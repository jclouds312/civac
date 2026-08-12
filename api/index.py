"""Unified Flask entrypoint for Vercel Python Functions.

The Flask monolith in ``artifacts/api-server/api/index.py`` is the migration
target for the CIVAC API.  This small WSGI dispatcher keeps the hardware-only
scale service isolated while the migrated domain and analytics routes run in
the same serverless function.  Routes not migrated yet are intentionally left
on the Node function through explicit Vercel rewrites.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from typing import Callable

from flask import Flask, jsonify

ROOT = Path(__file__).resolve().parents[1]
ANALYTICS_DIR = ROOT / "artifacts" / "analytics-server"
SCALE_DIR = ROOT / "artifacts" / "api-server" / "src"
FLASK_MONOLITH = ROOT / "artifacts" / "api-server" / "api" / "index.py"

# The existing scale service imports ``services.scale_service`` as a top-level
# package, so make both Python service roots importable before loading it.
for service_dir in (ANALYTICS_DIR, SCALE_DIR):
    service_path = str(service_dir)
    if service_path not in sys.path:
        sys.path.insert(0, service_path)


def load_flask_app(name: str, file_path: Path) -> Flask:
    spec = importlib.util.spec_from_file_location(name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"No se pudo cargar el servicio Flask: {file_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    app = getattr(module, "app", None)
    if not isinstance(app, Flask):
        raise RuntimeError(f"El módulo {file_path} no expone una app Flask")
    return app


class LazyFlaskApp:
    """Load a Python service only when one of its routes is requested."""

    def __init__(self, name: str, file_path: Path) -> None:
        self.name = name
        self.file_path = file_path
        self._app: Callable | None = None

    def __call__(self, environ, start_response):
        if self._app is None:
            self._app = load_flask_app(self.name, self.file_path)
        return self._app(environ, start_response)


flask_monolith = LazyFlaskApp("civac_vercel_monolith", FLASK_MONOLITH)
scale_app = LazyFlaskApp("civac_vercel_scale", SCALE_DIR / "app.py")
fallback_app = Flask("civac_vercel_gateway")


@fallback_app.get("/api/health")
def health():
    return jsonify(
        {
            "ok": True,
            "service": "civac-python-gateway",
            "services": ["analytics", "scale"],
        }
    )


class FlaskServiceRouter:
    """Dispatch migrated CIVAC routes and hardware routes independently."""

    def __init__(
        self,
        monolith: Callable,
        scale: Callable,
        fallback: Callable,
    ) -> None:
        self.monolith = monolith
        self.scale = scale
        self.fallback = fallback

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        # Be tolerant of Vercel passing the function filename after a rewrite.
        # Normally PATH_INFO remains the original browser path.
        if path.startswith("/api/index.py/"):
            path = path.removeprefix("/api/index.py") or "/"
            environ["PATH_INFO"] = path
        if path.startswith(
            (
                "/api/devices",
                "/api/tramas",
                "/api/config",
                "/api/status",
                "/api/health",
            )
        ):
            return self.scale(environ, start_response)
        return self.monolith(environ, start_response)


app = FlaskServiceRouter(flask_monolith, scale_app, fallback_app)
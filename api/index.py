"""Unified Flask entrypoint for Vercel Python Functions.

The browser-facing Next.js app calls the same-origin /api routes.  This
function keeps the existing analytics and scale services together without
requiring separate always-on Python servers in Vercel.
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


analytics_app = load_flask_app(
    "civac_vercel_analytics",
    ANALYTICS_DIR / "app.py",
)
scale_app = load_flask_app(
    "civac_vercel_scale",
    SCALE_DIR / "app.py",
)


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
    """Dispatch same-origin API paths to the existing Flask applications."""

    def __init__(
        self,
        analytics: Callable,
        scale: Callable,
        fallback: Callable,
    ) -> None:
        self.analytics = analytics
        self.scale = scale
        self.fallback = fallback

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        if path.startswith("/api/python/"):
            # Vercel may pass the original rewritten path to the Python
            # runtime. Normalize the optional namespace before dispatching.
            path = "/api/" + path.removeprefix("/api/python/")
            environ["PATH_INFO"] = path
        if path.startswith("/api/analytics"):
            return self.analytics(environ, start_response)
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
        return self.fallback(environ, start_response)


app = FlaskServiceRouter(analytics_app, scale_app, fallback_app)
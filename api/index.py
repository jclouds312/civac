"""Single Flask entrypoint for the Next.js/Vercel deployment.

The production deployment intentionally has one backend runtime: Flask. The
monolith owns the database-backed API and mounts the analytics and scale
contracts during startup. Keeping this file as a small WSGI adapter makes
Vercel's Python function discoverable without duplicating API handlers.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path
from urllib.parse import parse_qs

from flask import Flask, jsonify

ROOT = Path(__file__).resolve().parents[1]
FLASK_MONOLITH = ROOT / "artifacts" / "api-server" / "api" / "index.py"


def load_flask_app(name: str, file_path: Path) -> Flask:
    """Load a Flask app from a source file without starting a server."""

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
    """Load the Flask application once per warm serverless instance."""

    def __init__(self, name: str, file_path: Path) -> None:
        self.name = name
        self.file_path = file_path
        self._app: Flask | None = None

    def __call__(self, environ, start_response):
        if self._app is None:
            self._app = load_flask_app(self.name, self.file_path)
        return self._app(environ, start_response)


flask_monolith = LazyFlaskApp("civac_vercel_monolith", FLASK_MONOLITH)
fallback_app = Flask("civac_vercel_gateway")


@fallback_app.get("/api/health")
def health():
    return jsonify(
        {
            "ok": True,
            "service": "civac-python-gateway-fallback",
            "backend": "flask",
        }
    )


def _restore_rewritten_path(environ) -> None:
    """Restore the browser path after Vercel rewrites ``/api/*``.

    Depending on the Vercel runtime version, a rewrite can reach the Python
    function with either the original ``PATH_INFO`` or ``/api/index.py``.
    ``vercel.json`` also forwards ``__path`` so the latter case remains
    lossless. This is WSGI-level code so Flask sees normal routes and URL
    parameters.
    """

    path = environ.get("PATH_INFO", "") or "/"
    if path.startswith("/api/index.py/"):
        environ["PATH_INFO"] = path.removeprefix("/api/index.py") or "/"
        return
    if path != "/api/index.py":
        return

    forwarded = parse_qs(environ.get("QUERY_STRING", "")).get("__path", [])
    if forwarded and forwarded[0].startswith("/"):
        environ["PATH_INFO"] = forwarded[0]


def app(environ, start_response):
    """Vercel WSGI handler used for every ``/api/*`` request."""

    _restore_rewritten_path(environ)
    try:
        return flask_monolith(environ, start_response)
    except Exception:
        # Keep a valid WSGI response if an import fails during a cold start.
        # The real exception remains visible in Vercel's function logs.
        return fallback_app(environ, start_response)
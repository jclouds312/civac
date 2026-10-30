"""Smoke tests for the Vercel WSGI gateway and Python service contracts."""

from __future__ import annotations

import importlib.util
import io
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


def load_gateway():
    spec = importlib.util.spec_from_file_location("civac_test_gateway", ROOT / "api" / "index.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("No se pudo cargar api/index.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.app


class FlaskServerlessSmokeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.gateway = load_gateway()

    def test_analytics_health_and_summary(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        response = client.get("/api/analytics/health")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])

        summary = client.get("/api/analytics/summary")
        self.assertEqual(summary.status_code, 200)
        self.assertIn("kpis", summary.json)

    def test_ai_route_is_forwarded_through_the_vercel_wsgi_rewrite(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        response = client.post(
            "/api/index.py?__path=%2Fapi%2Fai%2Fchat",
            json={"message": "Hola"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json["code"], "SESSION_REQUIRED")

    def test_gps_locations_route_is_registered_in_flask(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        response = client.get("/api/gps")
        self.assertNotEqual(response.status_code, 404)

    def test_scale_wsgi_health(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        response = client.get("/api/health")
        self.assertIn(response.status_code, (200, 503))
        self.assertIn(response.content_type, ("application/json", "application/json; charset=utf-8"))

    def test_scale_parser_without_hardware(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        response = client.post("/api/tramas/test", json={"trama_format": "generic_line", "test_data": "Weight 450 kg"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["frames_parsed"], 1)

    def test_device_registration_returns_controlled_error_without_port(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        response = client.post("/api/devices", json={"device_id": "test", "port": "/dev/does-not-exist"})
        self.assertIn(response.status_code, (400, 500))
        self.assertIn("error", response.json)

    def test_william_card_requires_the_complete_campaign_code(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        for incomplete_code in ("noviembre2026", "CIVAC-WILLIAM-NOVIEMBRE2026-"):
            with self.subTest(code=incomplete_code):
                response = client.post(
                    "/api/auth/card/activate",
                    json={"code": incomplete_code},
                )
                self.assertEqual(response.status_code, 400)

    def test_william_card_issuance_requires_admin_session(self):
        from werkzeug.test import Client
        from werkzeug.wrappers import Response

        client = Client(self.gateway, Response)
        response = client.post("/api/codigos/william-card", json={})
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
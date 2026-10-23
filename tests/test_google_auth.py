"""Tests for Google sign-in and secure account approval in Flask."""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "artifacts" / "api-server" / "api" / "index.py"


def load_app():
    spec = importlib.util.spec_from_file_location("civac_google_test_app", SOURCE)
    if spec is None or spec.loader is None:
        raise RuntimeError("No se pudo importar la app Flask")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeCursor:
    def __init__(self):
        self.row = None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, query, params=()):
        if query.startswith("UPDATE usuarios_sistema"):
            self.row = {
                "id": params[-1],
                "nombre": "William",
                "email": "william@example.com",
                "role": "viewer",
                "plan_code": params[0],
                "plan_dias": params[2],
                "estado": "activo",
                "activo": True,
                "password": "",
                "updated_at": None,
            }

    def fetchall(self):
        return []

    def fetchone(self):
        return self.row


class FakeConnection:
    def __init__(self):
        self._cursor = FakeCursor()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def cursor(self):
        return self._cursor

    def commit(self):
        return None


class GoogleAuthTest(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module = load_app()

    def setUp(self):
        self.client = self.module.app.test_client()
        self.admin_token = "test-google-admin-session"
        self.viewer_token = "test-google-viewer-session"
        self.module._memory_sessions[self.admin_token] = {
            "user": {"id": "admin", "role": "admin"},
            "expires_at": 4_000_000_000,
        }
        self.module._memory_sessions[self.viewer_token] = {
            "user": {"id": "viewer", "role": "viewer"},
            "expires_at": 4_000_000_000,
        }

    def tearDown(self):
        self.module._memory_sessions.pop(self.admin_token, None)
        self.module._memory_sessions.pop(self.viewer_token, None)

    def test_google_status_is_disabled_without_server_configuration(self):
        with patch.dict(os.environ, {
            "GOOGLE_CLIENT_ID": "",
            "GOOGLE_CLIENT_SECRET": "",
            "SESSION_SECRET": "",
            "DATABASE_URL": "",
            "POSTGRES_URL": "",
        }):
            response = self.client.get("/api/auth/google/status")
        self.assertEqual(response.json, {"configured": False})

    def test_google_state_is_signed_and_callback_url_is_same_origin(self):
        env = {
            "GOOGLE_CLIENT_ID": "unit-test-client-id",
            "GOOGLE_CLIENT_SECRET": "unit-test-client-secret",
            "SESSION_SECRET": "unit-test-session-secret",
            "DATABASE_URL": "postgresql://unit:test@127.0.0.1/test",
            "CIVAC_PUBLIC_URL": "https://civac.example",
        }
        with patch.dict(os.environ, env):
            state = self.module._new_google_state()
            self.assertTrue(self.module._valid_google_state(state))
            self.assertFalse(self.module._valid_google_state(state + "x"))

            response = self.client.get("/api/auth/google")
            query = parse_qs(urlparse(response.location).query)
            self.assertEqual(
                query["redirect_uri"],
                ["https://civac.example/api/auth/google/callback"],
            )
            self.assertTrue(self.module._valid_google_state(query["state"][0]))

            invalid = self.client.get(
                "/api/auth/google/callback?code=test&state=invalid"
            )
        self.assertEqual(response.status_code, 302)
        self.assertIn("google_error=state_invalid", invalid.location)

    def test_user_management_requires_an_admin_session(self):
        missing = self.client.get("/api/admin/users")
        viewer = self.client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {self.viewer_token}"},
        )
        self.assertEqual(missing.status_code, 401)
        self.assertEqual(viewer.status_code, 403)

    def test_admin_can_list_users_without_exposing_passwords(self):
        with patch.object(self.module, "_db", FakeConnection):
            response = self.client.get(
                "/api/admin/users",
                headers={"Authorization": f"Bearer {self.admin_token}"},
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"ok": True, "total": 0, "users": []})

    def test_admin_can_activate_a_pending_google_user(self):
        with patch.object(self.module, "_db", FakeConnection):
            response = self.client.post(
                "/api/admin/users/william/activate",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                json={"planCode": "pro", "dias": 30},
            )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])
        self.assertEqual(response.json["user"]["role"], "viewer")
        self.assertEqual(response.json["user"]["estado"], "activo")


if __name__ == "__main__":
    import unittest

    unittest.main()

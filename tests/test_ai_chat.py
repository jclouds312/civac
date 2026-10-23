"""Tests for the authenticated server-side CIVAC IA integration."""

from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "artifacts" / "api-server" / "api" / "index.py"


def load_app():
    spec = importlib.util.spec_from_file_location("civac_ai_test_app", SOURCE)
    if spec is None or spec.loader is None:
        raise RuntimeError("No se pudo importar la app Flask")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeResponse:
    def __init__(self, payload: dict):
        self.payload = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return self.payload


class AiChatTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module = load_app()

    def setUp(self):
        self.token = "test-civac-ai-session"
        self.module._memory_sessions[self.token] = {
            "user": {"id": "test-user", "role": "vet", "nombre": "Veterinaria"},
            "expires_at": 4_000_000_000,
        }
        self.client = self.module.app.test_client()

    def tearDown(self):
        self.module._memory_sessions.pop(self.token, None)

    def test_chat_requires_a_server_session(self):
        response = self.client.post("/api/ai/chat", json={"message": "Hola"})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json["code"], "SESSION_REQUIRED")

    def test_status_and_chat_report_missing_provider_key(self):
        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
            status = self.client.get(
                "/api/ai/status",
                headers={"Authorization": f"Bearer {self.token}"},
            )
            chat = self.client.post(
                "/api/ai/chat",
                headers={"Authorization": f"Bearer {self.token}"},
                json={"message": "Hola"},
            )
        self.assertEqual(status.status_code, 200)
        self.assertFalse(status.json["configured"])
        self.assertEqual(chat.status_code, 503)
        self.assertEqual(chat.json["code"], "AI_NOT_CONFIGURED")

    def test_chat_calls_gemini_with_authenticated_role_and_returns_text(self):
        fake = FakeResponse({
            "candidates": [{
                "content": {"parts": [{"text": "Registra los signos y consulta al veterinario responsable."}]}
            }]
        })
        with patch.dict(os.environ, {"GEMINI_API_KEY": "unit-test-key"}):
            with patch("urllib.request.urlopen", return_value=fake) as urlopen:
                response = self.client.post(
                    "/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={
                        "message": "¿Qué registro primero?",
                        "history": [
                            {"role": "model", "text": "Saludo inicial omitible"},
                            {"role": "user", "text": "Necesito registrar un caso"},
                            {"role": "model", "text": "¿Qué información tienes?"},
                        ],
                    },
                )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])
        self.assertIn("veterinario", response.json["respuesta"])
        request = urlopen.call_args.args[0]
        self.assertEqual(request.get_header("X-goog-api-key"), "unit-test-key")
        body = json.loads(request.data.decode("utf-8"))
        system = body["systemInstruction"]["parts"][0]["text"]
        self.assertIn("Perfil autenticado: vet", system)
        self.assertEqual(body["contents"][-1]["role"], "user")
        self.assertEqual(body["contents"][-1]["parts"][0]["text"], "¿Qué registro primero?")


if __name__ == "__main__":
    unittest.main()

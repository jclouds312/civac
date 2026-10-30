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
        empty_keys = {
            "GEMINI_API_KEY": "",
            "CLOUDFLARE_API_TOKEN": "",
            "CLOUDFLARE_ACCOUNT_ID": "",
            "GROQ_API_KEY": "",
            "OPENAI_API_KEY": "",
            "ANTHROPIC_API_KEY": "",
        }
        with patch.dict(os.environ, empty_keys):
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
        self.assertEqual(chat.json["code"], "AI_PROVIDER_REQUIRED")

    def test_status_lists_providers_without_exposing_keys(self):
        with patch.dict(os.environ, {
            "GEMINI_API_KEY": "hidden-test-key",
            "CLOUDFLARE_API_TOKEN": "",
            "CLOUDFLARE_ACCOUNT_ID": "",
            "GROQ_API_KEY": "",
            "OPENAI_API_KEY": "",
            "ANTHROPIC_API_KEY": "",
        }):
            response = self.client.get(
                "/api/ai/status",
                headers={"Authorization": f"Bearer {self.token}"},
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["defaultProvider"], "gemini")
        self.assertTrue(response.json["configured"])
        self.assertNotIn("hidden-test-key", json.dumps(response.json))
        providers = {item["id"]: item for item in response.json["providers"]}
        self.assertTrue(providers["gemini"]["available"])
        self.assertFalse(providers["openai"]["available"])
        self.assertTrue(providers["openai"]["locked"])

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
        self.assertEqual(response.json["provider"], "gemini")

    def test_groq_paid_provider_uses_openai_compatible_chat_api(self):
        self.module._memory_sessions[self.token]["user"]["planCode"] = "premium"
        fake = FakeResponse({
            "choices": [{"message": {"content": "Registra la fecha y los signos observados."}}],
        })
        with patch.dict(os.environ, {
            "GEMINI_API_KEY": "",
            "GROQ_API_KEY": "unit-test-groq-key",
            "GROQ_MODEL": "openai/gpt-oss-20b",
        }):
            with patch("urllib.request.urlopen", return_value=fake) as urlopen:
                response = self.client.post(
                    "/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={"message": "¿Qué registro primero?", "provider": "groq"},
                )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["provider"], "groq")
        self.assertEqual(response.json["tier"], "premium")
        self.assertIn("fecha", response.json["respuesta"])
        request = urlopen.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.groq.com/openai/v1/chat/completions")
        self.assertEqual(request.get_header("Authorization"), "Bearer unit-test-groq-key")

    def test_cloudflare_free_provider_uses_account_scoped_inference(self):
        fake = FakeResponse({"result": {"response": "Registra la fecha y los signos observados."}})
        account_id = "a" * 32
        with patch.dict(os.environ, {
            "GEMINI_API_KEY": "",
            "CLOUDFLARE_API_TOKEN": "unit-test-cloudflare-token",
            "CLOUDFLARE_ACCOUNT_ID": account_id,
        }):
            with patch("urllib.request.urlopen", return_value=fake) as urlopen:
                response = self.client.post(
                    "/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={"message": "¿Qué registro primero?", "provider": "cloudflare"},
                )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["provider"], "cloudflare")
        self.assertEqual(response.json["tier"], "free")
        self.assertIn("fecha", response.json["respuesta"])
        request = urlopen.call_args.args[0]
        self.assertIn(f"/accounts/{account_id}/ai/run/@cf/meta/llama-3.1-8b-instruct", request.full_url)
        self.assertEqual(request.get_header("Authorization"), "Bearer unit-test-cloudflare-token")

    def test_paid_provider_is_denied_for_non_premium_plan(self):
        self.module._memory_sessions[self.token]["user"]["planCode"] = "basico"
        with patch.dict(os.environ, {"OPENAI_API_KEY": "unit-test-openai-key"}):
            with patch("urllib.request.urlopen") as urlopen:
                response = self.client.post(
                    "/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={"message": "Explica un indicador.", "provider": "openai"},
                )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json["code"], "AI_PREMIUM_REQUIRED")
        urlopen.assert_not_called()

    def test_paid_provider_can_be_used_by_premium_plan(self):
        self.module._memory_sessions[self.token]["user"]["planCode"] = "premium"
        fake = FakeResponse({
            "output_text": "Revisa el indicador con el historial disponible.",
            "output": [],
        })
        with patch.dict(os.environ, {"OPENAI_API_KEY": "unit-test-openai-key"}):
            with patch("urllib.request.urlopen", return_value=fake) as urlopen:
                response = self.client.post(
                    "/api/ai/chat",
                    headers={"Authorization": f"Bearer {self.token}"},
                    json={"message": "Explica un indicador.", "provider": "openai"},
                )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["provider"], "openai")
        self.assertEqual(response.json["tier"], "premium")
        self.assertIn("indicador", response.json["respuesta"])
        request_body = json.loads(urlopen.call_args.args[0].data.decode("utf-8"))
        self.assertEqual(request_body["model"], "gpt-6-luna")


if __name__ == "__main__":
    unittest.main()

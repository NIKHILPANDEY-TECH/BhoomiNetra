import os
import sys
import unittest
from unittest.mock import patch

os.environ.setdefault("DATABASE_URL", "sqlite:///./ml502_test.db")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("ML_SERVICE_URL", "http://localhost:8001")
os.environ.setdefault("ML_SERVICE_RETRIES", "3")
os.environ.setdefault("ML_SERVICE_RETRY_DELAY", "0")
os.environ.setdefault("ML_SERVICE_TIMEOUT", "1")

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app
from app.services.ml_service import MLService, MLServiceUnavailable
from fastapi.testclient import TestClient


class ML502HardeningTests(unittest.TestCase):
    def test_backend_health_does_not_call_ml(self):
        with patch("app.main.ml_service.check_ready", side_effect=AssertionError("ML was called")):
            with TestClient(app) as client:
                response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["status"], "ok")

    def test_ml_502_is_retried_then_reported_as_unavailable(self):
        service = MLService()
        class Response:
            status_code = 502
            def raise_for_status(self):
                raise AssertionError("should not reach raise_for_status for 502")
        with patch("app.services.ml_service.httpx.request", return_value=Response()) as request:
            with self.assertRaises(MLServiceUnavailable):
                service._request("GET", "/health")
        self.assertEqual(request.call_count, 4)  # initial request + 3 retries

    def test_ml_502_recovers_on_retry(self):
        service = MLService()
        class Response:
            def __init__(self, status_code, payload=None):
                self.status_code = status_code
                self.payload = payload or {"status": "ok"}
            def raise_for_status(self):
                if self.status_code >= 400:
                    raise RuntimeError(self.status_code)
            def json(self):
                return self.payload
        responses = [Response(502), Response(200, {"status": "ok"})]
        with patch("app.services.ml_service.httpx.request", side_effect=responses) as request:
            result = service._request("GET", "/health")
        self.assertEqual(request.call_count, 2)
        self.assertEqual(result.status_code, 200)


if __name__ == "__main__":
    unittest.main(verbosity=2)

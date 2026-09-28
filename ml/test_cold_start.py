import unittest
import app


class MLColdStartTests(unittest.TestCase):
    def test_health_is_shallow_and_does_not_load_models(self):
        app.classifier = None
        app.regressor = None
        app.calibrator = None
        app.schema = None
        app.metadata = None

        result = app.health()

        self.assertEqual(result["status"], "ok")
        self.assertFalse(result["model_loaded"])
        self.assertEqual(result["model_version"], "deferred")

    def test_ready_loads_models(self):
        app.load_models()
        result = app.ready()
        self.assertEqual(result["status"], "ready")
        self.assertTrue(result["model_loaded"])
        self.assertTrue(result["model_version"])


if __name__ == "__main__":
    unittest.main(verbosity=2)

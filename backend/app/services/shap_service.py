from app.services.ml_service import ml_service


class SHAPService:
    def explain(self, features):
        return ml_service.explain(features)


shap_service = SHAPService()

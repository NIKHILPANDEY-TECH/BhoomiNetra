from pathlib import Path
import json
import warnings

import joblib
import pandas as pd
import shap
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

BASE = Path(__file__).resolve().parent
MODEL_DIR = BASE / "models"

classifier = None
regressor = None
calibrator = None
schema = None
metadata = None


def load_models():
    global classifier, regressor, calibrator, schema, metadata
    if classifier is not None:
        return
    required = ["delay_classifier.pkl", "delay_regressor.pkl", "feature_schema.json", "model_metadata.json"]
    missing = [name for name in required if not (MODEL_DIR / name).exists()]
    if missing:
        raise RuntimeError(f"Missing ML artifacts: {missing}")
    classifier = joblib.load(MODEL_DIR / "delay_classifier.pkl")
    regressor = joblib.load(MODEL_DIR / "delay_regressor.pkl")
    calibration_path = MODEL_DIR / "classifier_calibrator.pkl"
    calibrator = joblib.load(calibration_path) if calibration_path.exists() else None
    schema = json.loads((MODEL_DIR / "feature_schema.json").read_text(encoding="utf-8"))
    metadata = json.loads((MODEL_DIR / "model_metadata.json").read_text(encoding="utf-8"))


def validate(features: dict) -> dict:
    load_models()
    missing = [name for name in schema["all_features"] if name not in features]
    if missing:
        raise ValueError(f"Missing model features: {missing}")
    return {name: features[name] for name in schema["all_features"]}


def predict(features: dict):
    frame = pd.DataFrame([validate(features)])
    model = calibrator or classifier
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", message=r"X does not have valid feature names.*", category=UserWarning)
        probability = float(model.predict_proba(frame)[:, 1][0])
    days = max(0.0, float(regressor.predict(frame)[0]))
    threshold = float(schema.get("prediction_threshold", 0.5))
    band = "HIGH" if probability >= 0.70 else "MEDIUM" if probability >= 0.40 else "LOW"
    return {
        "risk_probability": probability,
        "risk_percent": probability * 100,
        "risk_level": band,
        "delay_flag": int(probability >= threshold),
        "decision_threshold": threshold,
        "predicted_delay_days": days,
        "model_version": metadata.get("model_version", "unknown"),
    }


def explain(features: dict):
    load_models()
    validated = validate(features)
    frame = pd.DataFrame([validated])
    pipeline = classifier
    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]
    transformed = preprocessor.transform(frame)
    if hasattr(transformed, "toarray"):
        transformed = transformed.toarray()
    explainer_path = MODEL_DIR / "shap_explainer_classifier.pkl"
    if explainer_path.exists():
        explainer = joblib.load(explainer_path)
    else:
        explainer = shap.TreeExplainer(model)
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", message=r"LightGBM binary classifier with TreeExplainer.*", category=UserWarning)
        values = explainer.shap_values(transformed)
    if isinstance(values, list):
        values = values[1][0]
    else:
        values = values[0]
    names = preprocessor.get_feature_names_out()
    aggregated = {}
    for name, impact in zip(names, values):
        raw_name = name.split("__", 1)[-1]
        for feature in schema["all_features"]:
            if raw_name == feature or raw_name.startswith(f"{feature}_"):
                raw_name = feature
                break
        aggregated[raw_name] = aggregated.get(raw_name, 0.0) + float(impact)
    pairs = sorted(aggregated.items(), key=lambda item: abs(item[1]), reverse=True)[:8]
    return [{"feature": name, "value": validated[name], "impact": impact, "direction": "increases_risk" if impact > 0 else "decreases_risk"} for name, impact in pairs]


class FeatureRequest(BaseModel):
    features: dict = Field(min_length=1)


app = FastAPI(title="BhoomiMitra ML Service", version="2.0.0")

@app.on_event("startup")
def startup():
    load_models()

@app.get("/health")
def health():
    load_models()
    return {"status": "ok", **metadata}

@app.post("/predict")
def predict_endpoint(request: FeatureRequest):
    try:
        return predict(request.features)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.post("/explain")
def explain_endpoint(request: FeatureRequest):
    try:
        return {"factors": explain(request.features), "note": "Model explanation; SHAP contribution is not causal evidence."}
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

import json
from pathlib import Path
import joblib
import pandas as pd
import warnings

from .config import MODEL_DIR

_classifier = None
_regressor = None
_calibrator = None
_schema = None


def _load():
    global _classifier, _regressor, _calibrator, _schema
    if _classifier is None:
        _classifier = joblib.load(MODEL_DIR / 'delay_classifier.pkl')
        _regressor = joblib.load(MODEL_DIR / 'delay_regressor.pkl')
        cal_path = MODEL_DIR / 'classifier_calibrator.pkl'
        _calibrator = joblib.load(cal_path) if cal_path.exists() else None
        with open(MODEL_DIR / 'feature_schema.json', encoding='utf-8') as f:
            _schema = json.load(f)


def _frame(project):
    _load()
    return pd.DataFrame([project])


def predict_delay_risk(project):
    _load()
    model = _calibrator if _calibrator is not None else _classifier
    with warnings.catch_warnings():
        warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
        p = float(model.predict_proba(_frame(project))[:, 1][0])
    threshold = float(_schema['prediction_threshold'])
    return {'risk_probability': p, 'risk_level': 'HIGH' if p >= .70 else ('MEDIUM' if p >= .40 else 'LOW'), 'delay_flag': int(p >= threshold), 'decision_threshold': threshold}


def predict_expected_delay(project):
    _load()
    value = max(0.0, float(_regressor.predict(_frame(project))[0]))
    return {'expected_delay_days': value}

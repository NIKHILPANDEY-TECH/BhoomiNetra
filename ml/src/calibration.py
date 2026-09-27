import json
import numpy as np
import pandas as pd
import warnings
from sklearn.base import clone
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss

from .config import REPORT_DIR


def evaluate_calibration(base_model, X_train, y_train, X_val, y_val):
    candidates = {'none': base_model}
    for method in ('sigmoid', 'isotonic'):
        model = CalibratedClassifierCV(estimator=clone(base_model), method=method, cv=3, n_jobs=1)
        with warnings.catch_warnings():
            warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
            model.fit(X_train, y_train)
        candidates[method] = model

    rows = []
    for method, model in candidates.items():
        p = model.predict_proba(X_val)[:, 1]
        rows.append({'method': method, 'brier_score': float(brier_score_loss(y_val, p)), 'mean_probability': float(np.mean(p))})

    result = pd.DataFrame(rows)
    base_brier = float(result.loc[result.method == 'none', 'brier_score'].iloc[0])
    best = result[result.method != 'none'].sort_values('brier_score').iloc[0]
    selected = best.method if best.brier_score < base_brier - 1e-4 else 'none'

    with open(REPORT_DIR / 'calibration_selection.json', 'w', encoding='utf-8') as f:
        json.dump({'selected_method': selected, 'validation_results': result.to_dict(orient='records')}, f, indent=2)
    result.to_csv(REPORT_DIR / 'calibration_experiments.csv', index=False)
    return selected, candidates[selected], result

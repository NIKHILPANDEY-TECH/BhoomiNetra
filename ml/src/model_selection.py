import json
import time
import warnings
import numpy as np
import pandas as pd
from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score, average_precision_score, brier_score_loss, f1_score,
    mean_absolute_error, mean_squared_error, precision_score, r2_score,
    recall_score, roc_auc_score,
)
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, KFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .config import RANDOM_SEED, REPORT_DIR

try:
    from xgboost import XGBClassifier, XGBRegressor
    HAS_XGB = True
except Exception:
    HAS_XGB = False

try:
    from lightgbm import LGBMClassifier, LGBMRegressor
    HAS_LGBM = True
except Exception:
    HAS_LGBM = False


def classification_metrics(y, p, threshold=0.5):
    pred = (p >= threshold).astype(int)
    return {
        'accuracy': float(accuracy_score(y, pred)),
        'precision': float(precision_score(y, pred, zero_division=0)),
        'recall': float(recall_score(y, pred, zero_division=0)),
        'f1': float(f1_score(y, pred, zero_division=0)),
        'roc_auc': float(roc_auc_score(y, p)),
        'pr_auc': float(average_precision_score(y, p)),
        'brier_score': float(brier_score_loss(y, p)),
        'threshold': float(threshold),
    }


def regression_metrics(y, p):
    return {
        'mae': float(mean_absolute_error(y, p)),
        'rmse': float(np.sqrt(mean_squared_error(y, p))),
        'r2': float(r2_score(y, p)),
    }


def selection_score(m):
    return .30 * m['f1'] + .30 * m['pr_auc'] + .20 * m['recall'] + .10 * m['precision'] + .10 * (1 - m['brier_score'])


def find_threshold(y, p):
    rows = []
    for threshold in np.arange(.20, .71, .01):
        m = classification_metrics(y, p, threshold)
        rows.append(m)
    table = pd.DataFrame(rows)
    eligible = table[table['recall'] >= 0.60]
    if eligible.empty:
        best = table.sort_values(['f1', 'recall'], ascending=False).iloc[0]
    else:
        best = eligible.sort_values(['f1', 'recall', 'precision'], ascending=False).iloc[0]
    table.to_csv(REPORT_DIR / 'threshold_analysis.csv', index=False)
    return float(best['threshold']), table


def make_classifiers(pos_weight):
    models = {
        'DummyClassifier': DummyClassifier(strategy='prior'),
        'LogisticRegression': LogisticRegression(C=1.0, max_iter=1500, class_weight='balanced', solver='lbfgs', random_state=RANDOM_SEED),
        'ExtraTrees': ExtraTreesClassifier(n_estimators=80, min_samples_leaf=2, class_weight='balanced', random_state=RANDOM_SEED, n_jobs=1),
        'RandomForest': RandomForestClassifier(n_estimators=80, min_samples_leaf=2, class_weight='balanced', random_state=RANDOM_SEED, n_jobs=1),
    }
    if HAS_XGB:
        models['XGBoost'] = XGBClassifier(
            n_estimators=80, max_depth=4, learning_rate=.04, subsample=.85,
            colsample_bytree=.85, min_child_weight=3, reg_lambda=2,
            objective='binary:logistic', eval_metric='logloss', random_state=RANDOM_SEED,
            n_jobs=1, tree_method='hist', scale_pos_weight=pos_weight,
        )
    if HAS_LGBM:
        models['LightGBM'] = LGBMClassifier(
            n_estimators=80, num_leaves=31, learning_rate=.04, max_depth=7,
            min_child_samples=25, subsample=.85, colsample_bytree=.85,
            class_weight='balanced', random_state=RANDOM_SEED, n_jobs=1, verbosity=-1,
        )
    return models


def make_regressors():
    models = {
        'DummyRegressor': DummyRegressor(strategy='median'),
        'Ridge': Ridge(alpha=3.0),
        'ExtraTreesRegressor': ExtraTreesRegressor(n_estimators=80, min_samples_leaf=2, random_state=RANDOM_SEED, n_jobs=1),
        'RandomForestRegressor': RandomForestRegressor(n_estimators=80, min_samples_leaf=2, random_state=RANDOM_SEED, n_jobs=1),
    }
    if HAS_XGB:
        models['XGBoostRegressor'] = XGBRegressor(
            n_estimators=100, max_depth=4, learning_rate=.035, subsample=.85,
            colsample_bytree=.85, min_child_weight=3, reg_lambda=3,
            objective='reg:squarederror', random_state=RANDOM_SEED, n_jobs=1, tree_method='hist'
        )
    if HAS_LGBM:
        models['LightGBMRegressor'] = LGBMRegressor(
            n_estimators=100, num_leaves=31, learning_rate=.035, max_depth=7,
            min_child_samples=25, subsample=.85, colsample_bytree=.85,
            reg_lambda=2, random_state=RANDOM_SEED, n_jobs=1, verbosity=-1
        )
    return models


def classifier_spaces():
    spaces = {
        'LogisticRegression': {'model__C': np.logspace(-2, 1, 12)},
        'ExtraTrees': {
            'model__n_estimators': [120, 180, 240], 'model__max_depth': [None, 8, 14, 20],
            'model__min_samples_leaf': [1, 2, 4, 8], 'model__max_features': ['sqrt', .6, 1.0]
        },
        'RandomForest': {
            'model__n_estimators': [120, 180, 240], 'model__max_depth': [None, 8, 14, 20],
            'model__min_samples_leaf': [1, 2, 4, 8], 'model__max_features': ['sqrt', .6, 1.0]
        },
    }
    if HAS_XGB:
        spaces['XGBoost'] = {
            'model__n_estimators': [150, 220, 300], 'model__max_depth': [2, 3, 4, 5],
            'model__learning_rate': [.02, .04, .06], 'model__min_child_weight': [2, 4, 8],
            'model__subsample': [.75, .85, 1.0], 'model__colsample_bytree': [.75, .85, 1.0],
            'model__reg_lambda': [1, 2, 5, 10]
        }
    if HAS_LGBM:
        spaces['LightGBM'] = {
            'model__n_estimators': [150, 220, 300], 'model__num_leaves': [15, 31, 63],
            'model__learning_rate': [.02, .04, .06], 'model__max_depth': [4, 7, 10],
            'model__min_child_samples': [15, 25, 40], 'model__subsample': [.75, .85, 1.0]
        }
    return spaces


def regressor_spaces():
    spaces = {
        'ExtraTreesRegressor': {
            'model__n_estimators': [120, 180, 240], 'model__max_depth': [None, 8, 14, 20],
            'model__min_samples_leaf': [1, 2, 4, 8], 'model__max_features': [1.0, .7, 'sqrt']
        },
        'RandomForestRegressor': {
            'model__n_estimators': [120, 180, 240], 'model__max_depth': [None, 8, 14, 20],
            'model__min_samples_leaf': [1, 2, 4, 8], 'model__max_features': [1.0, .7, 'sqrt']
        },
    }
    if HAS_XGB:
        spaces['XGBoostRegressor'] = {
            'model__n_estimators': [160, 240, 320], 'model__max_depth': [2, 3, 4, 5],
            'model__learning_rate': [.02, .035, .05], 'model__min_child_weight': [2, 4, 8],
            'model__subsample': [.75, .85, 1.0], 'model__colsample_bytree': [.75, .85, 1.0],
            'model__reg_lambda': [1, 3, 6, 10]
        }
    if HAS_LGBM:
        spaces['LightGBMRegressor'] = {
            'model__n_estimators': [160, 240, 320], 'model__num_leaves': [15, 31, 63],
            'model__learning_rate': [.02, .035, .05], 'model__max_depth': [4, 7, 10],
            'model__min_child_samples': [15, 25, 40]
        }
    return spaces


def _pipeline(name, preprocessor, estimator):
    steps = [('preprocessor', preprocessor)]
    if name == 'LogisticRegression':
        steps.append(('scaler', StandardScaler(with_mean=False)))
    steps.append(('model', estimator))
    return Pipeline(steps)


def _proba(pipe, X, name):
    if name == 'LightGBM':
        with warnings.catch_warnings():
            warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
            return pipe.predict_proba(X)[:, 1]
    return pipe.predict_proba(X)[:, 1]


def _predict(pipe, X, name):
    if name == 'LightGBMRegressor':
        with warnings.catch_warnings():
            warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
            return pipe.predict(X)
    return pipe.predict(X)


def run_classifier_experiments(preprocessor, X_train, y_train, X_val, y_val):
    pos_weight = (y_train == 0).sum() / max((y_train == 1).sum(), 1)
    rows, fitted = [], {}
    for name, estimator in make_classifiers(pos_weight).items():
        pipe = _pipeline(name, preprocessor, estimator)
        t0 = time.perf_counter(); pipe.fit(X_train, y_train); elapsed = time.perf_counter() - t0
        p = _proba(pipe, X_val, name)
        threshold, _ = find_threshold(y_val, p) if name != 'DummyClassifier' else (.5, None)
        m = classification_metrics(y_val, p, threshold)
        rows.append({'experiment_id': f'baseline_{name}', 'model': name, 'status': 'baseline', 'training_time': elapsed, 'selection_score': selection_score(m), **m})
        fitted[name] = pipe
    out = pd.DataFrame(rows)
    out.to_csv(REPORT_DIR / 'classification_experiments.csv', index=False)
    return out, fitted

def run_regressor_experiments(preprocessor, X_train, y_train, X_val, y_val):
    rows, fitted = [], {}
    for name, estimator in make_regressors().items():
        pipe = Pipeline([('preprocessor', preprocessor), ('model', estimator)])
        t0 = time.perf_counter(); pipe.fit(X_train, y_train); elapsed = time.perf_counter() - t0
        p = np.maximum(0, _predict(pipe, X_val, name)); m = regression_metrics(y_val, p)
        rows.append({'experiment_id': f'baseline_{name}', 'model': name, 'status': 'baseline', 'training_time': elapsed, **m})
        fitted[name] = pipe
    out = pd.DataFrame(rows)
    out.to_csv(REPORT_DIR / 'regression_experiments.csv', index=False)
    return out, fitted

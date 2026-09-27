import json
import time
import warnings
warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.calibration import CalibrationDisplay
from sklearn.metrics import ConfusionMatrixDisplay, PrecisionRecallDisplay, RocCurveDisplay, confusion_matrix

from .calibration import evaluate_calibration
from .config import DATA_PATH, MODEL_DIR, PLOT_DIR, REPORT_DIR, SHAP_DIR, RANDOM_SEED, TRAIN_FRACTION, VALIDATION_FRACTION
from .data_audit import audit_dataframe
from .explainability import save_shap_for_model
from .leakage_analysis import build_leakage_report, run_target_forensics
from .model_selection import classification_metrics, find_threshold, regression_metrics, run_classifier_experiments, run_regressor_experiments
from .preprocessing import build_preprocessor, get_feature_columns
from .stage_risk import run as run_stage_risk


def chronological_split(df):
    ordered = df.assign(_date=pd.to_datetime(df['project_start_date'], errors='coerce')).sort_values('_date').drop(columns='_date').reset_index(drop=True)
    n_train = int(len(ordered) * TRAIN_FRACTION)
    n_val = int(len(ordered) * (TRAIN_FRACTION + VALIDATION_FRACTION))
    return ordered.iloc[:n_train].copy(), ordered.iloc[n_train:n_val].copy(), ordered.iloc[n_val:].copy()


def save_classifier_plots(y, p, threshold):
    PLOT_DIR.mkdir(parents=True, exist_ok=True)
    ConfusionMatrixDisplay(confusion_matrix(y, p >= threshold)).plot()
    plt.tight_layout(); plt.savefig(PLOT_DIR / 'final_confusion_matrix.png', dpi=180); plt.close()
    RocCurveDisplay.from_predictions(y, p)
    plt.tight_layout(); plt.savefig(PLOT_DIR / 'final_roc_curve.png', dpi=180); plt.close()
    PrecisionRecallDisplay.from_predictions(y, p)
    plt.tight_layout(); plt.savefig(PLOT_DIR / 'final_precision_recall.png', dpi=180); plt.close()
    CalibrationDisplay.from_predictions(y, p, n_bins=10)
    plt.tight_layout(); plt.savefig(PLOT_DIR / 'final_calibration_curve.png', dpi=180); plt.close()


def save_regression_plot(y, p):
    residuals = y - p
    fig, ax = plt.subplots(figsize=(6, 5))
    ax.scatter(p, residuals, alpha=.35)
    ax.axhline(0, linestyle='--')
    ax.set_xlabel('Predicted delay days')
    ax.set_ylabel('Residual')
    ax.set_title('Regression residuals')
    fig.tight_layout(); fig.savefig(PLOT_DIR / 'regression_residuals.png', dpi=180); plt.close(fig)


def main(skip_shap=False):
    start_time = time.perf_counter()
    for path in (MODEL_DIR, REPORT_DIR, PLOT_DIR, SHAP_DIR):
        path.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(DATA_PATH)
    audit_dataframe(df)
    run_target_forensics(df)
    leakage = build_leakage_report(df)

    usable = df[df['usable_for_training']].copy()
    train_df, val_df, test_df = chronological_split(usable)
    with open(REPORT_DIR / 'split_summary.json', 'w', encoding='utf-8') as f:
        json.dump({
            'method': 'chronological_by_project_start_date',
            'train_rows': len(train_df), 'validation_rows': len(val_df), 'test_rows': len(test_df),
            'train_start': str(train_df.project_start_date.min()), 'train_end': str(train_df.project_start_date.max()),
            'validation_start': str(val_df.project_start_date.min()), 'validation_end': str(val_df.project_start_date.max()),
            'test_start': str(test_df.project_start_date.min()), 'test_end': str(test_df.project_start_date.max()),
            'test_untouched_until_final_evaluation': True,
        }, f, indent=2)

    categorical, numerical = get_feature_columns(df)
    features = categorical + numerical
    X_train, X_val, X_test = train_df[features], val_df[features], test_df[features]
    y_train_cls, y_val_cls, y_test_cls = train_df.delay_label.astype(int), val_df.delay_label.astype(int), test_df.delay_label.astype(int)
    y_train_reg, y_val_reg, y_test_reg = train_df.delay_days, val_df.delay_days, test_df.delay_days

    preprocessor, _, _ = build_preprocessor(df)
    cls_exp, cls_models = run_classifier_experiments(preprocessor, X_train, y_train_cls, X_val, y_val_cls)
    reg_exp, reg_models = run_regressor_experiments(preprocessor, X_train, y_train_reg, X_val, y_val_reg)

    eligible = cls_exp[(cls_exp.model != 'DummyClassifier') & (cls_exp.status != 'rejected')].sort_values(['selection_score', 'pr_auc'], ascending=False)
    selected_row = eligible.iloc[0]
    selected_key = selected_row.experiment_id.replace('baseline_', '').replace('tuned_', '')
    if selected_row.experiment_id.startswith('tuned_'):
        selected_key += '_tuned'
    selected_classifier = cls_models[selected_key]

    reg_eligible = reg_exp[(reg_exp.model != 'DummyRegressor') & (reg_exp.status != 'rejected')].sort_values(['mae', 'rmse', 'r2'], ascending=[True, True, False])
    reg_row = reg_eligible.iloc[0]
    reg_key = reg_row.experiment_id.replace('baseline_', '').replace('tuned_', '')
    if reg_row.experiment_id.startswith('tuned_'):
        reg_key += '_tuned'
    selected_regressor = reg_models[reg_key]

    cal_method, calibrated_model, cal_results = evaluate_calibration(selected_classifier, X_train, y_train_cls, X_val, y_val_cls)
    with warnings.catch_warnings():
        warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
        val_prob = calibrated_model.predict_proba(X_val)[:, 1]
    threshold, threshold_table = find_threshold(y_val_cls, val_prob)
    val_cls = classification_metrics(y_val_cls, val_prob, threshold)
    val_reg = regression_metrics(y_val_reg, np.maximum(0, selected_regressor.predict(X_val)))

    development_X = pd.concat([X_train, X_val], ignore_index=True)
    development_y_cls = pd.concat([y_train_cls, y_val_cls], ignore_index=True)
    development_y_reg = pd.concat([y_train_reg, y_val_reg], ignore_index=True)
    final_classifier = clone(selected_classifier).fit(development_X, development_y_cls)
    final_regressor = clone(selected_regressor).fit(development_X, development_y_reg)

    if cal_method == 'none':
        final_probability_model = final_classifier
    else:
        from sklearn.calibration import CalibratedClassifierCV
        
        with warnings.catch_warnings():
            warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
            final_probability_model = CalibratedClassifierCV(estimator=clone(final_classifier), method=cal_method, cv=3, n_jobs=1).fit(development_X, development_y_cls)

    with warnings.catch_warnings():
        warnings.filterwarnings('ignore', message=r'X does not have valid feature names.*', category=UserWarning)
        test_prob = final_probability_model.predict_proba(X_test)[:, 1]
    test_cls = classification_metrics(y_test_cls, test_prob, threshold)
    test_pred_reg = np.maximum(0, final_regressor.predict(X_test))
    test_reg = regression_metrics(y_test_reg, test_pred_reg)
    save_classifier_plots(y_test_cls, test_prob, threshold)
    save_regression_plot(y_test_reg, test_pred_reg)

    joblib.dump(final_classifier, MODEL_DIR / 'delay_classifier.pkl')
    joblib.dump(final_regressor, MODEL_DIR / 'delay_regressor.pkl')
    joblib.dump(final_classifier.named_steps['preprocessor'], MODEL_DIR / 'preprocessing_pipeline.pkl')
    if cal_method != 'none':
        joblib.dump(final_probability_model, MODEL_DIR / 'classifier_calibrator.pkl')
    elif (MODEL_DIR / 'classifier_calibrator.pkl').exists():
        (MODEL_DIR / 'classifier_calibrator.pkl').unlink()

    feature_schema = {
        'categorical_features': categorical,
        'numerical_features': numerical,
        'all_features': features,
        'excluded_features': leakage[leakage.status != 'SAFE_CANDIDATE'].feature.tolist(),
        'prediction_threshold': threshold,
    }
    with open(MODEL_DIR / 'feature_schema.json', 'w', encoding='utf-8') as f:
        json.dump(feature_schema, f, indent=2)

    selection = {
        'classifier_experiment_id': selected_row.experiment_id,
        'classifier_model': selected_row.model,
        'regressor_experiment_id': reg_row.experiment_id,
        'regressor_model': reg_row.model,
        'calibration': cal_method,
        'decision_threshold': threshold,
        'validation_classifier': val_cls,
        'validation_regressor': val_reg,
        'selection_rule': 'Classification uses validation F1/PR-AUC/recall/precision/calibration. Regression uses validation MAE, then RMSE and R2.',
    }
    with open(REPORT_DIR / 'final_classifier_selection.json', 'w', encoding='utf-8') as f:
        json.dump(selection, f, indent=2, default=str)

    with open(REPORT_DIR / 'final_test_metrics.json', 'w', encoding='utf-8') as f:
        json.dump({
            'dataset_type': 'synthetic prototype dataset',
            'dataset_rows': len(df),
            'selected_classifier': selected_row.model,
            'selected_regressor': reg_row.model,
            'calibration': cal_method,
            'decision_threshold': threshold,
            'test_classifier': test_cls,
            'test_regressor': test_reg,
            'warning': 'Synthetic metrics are for prototype validation and are not evidence of government-data performance.',
        }, f, indent=2)

    run_stage_risk(df, REPORT_DIR / 'stage_risk_analytics.csv')

    metadata = {
        'model_version': 'bhoomimitra-ml-v2',
        'dataset_rows': len(df),
        'features_used': features,
        'classifier_model': selected_row.model,
        'regressor_model': reg_row.model,
        'calibration': cal_method,
        'decision_threshold': threshold,
        'validation_metrics': {'classifier': val_cls, 'regressor': val_reg},
        'test_metrics': {'classifier': test_cls, 'regressor': test_reg},
        'random_seed': RANDOM_SEED,
        'notes': ['Synthetic domain-inspired data.', 'Chronological train/validation/test split.', 'Test set untouched until final evaluation.', 'Outcome fields excluded from predictors.'],
    }
    with open(MODEL_DIR / 'model_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, default=str)

    if skip_shap:
        shap_status = {'skipped': True}
    else:
        shap_status = {
            'classifier': save_shap_for_model(final_classifier, development_X, 'classifier'),
            'regressor': save_shap_for_model(final_regressor, development_X, 'regressor'),
        }
    with open(REPORT_DIR / 'shap_status.json', 'w', encoding='utf-8') as f:
        json.dump(shap_status, f, indent=2, default=str)

    print(json.dumps({
        'selected_classifier': selected_row.model,
        'selected_regressor': reg_row.model,
        'calibration': cal_method,
        'decision_threshold': threshold,
        'test_classifier': test_cls,
        'test_regressor': test_reg,
        'runtime_seconds': round(time.perf_counter() - start_time, 2),
    }, indent=2))

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / 'data' / 'data.csv'
MODEL_DIR = ROOT / 'models'
REPORT_DIR = ROOT / 'reports'
PLOT_DIR = ROOT / 'plots'
SHAP_DIR = PLOT_DIR / 'shap'

RANDOM_SEED = 42
TRAIN_FRACTION = 0.70
VALIDATION_FRACTION = 0.15

ID_METADATA = ['project_id', 'project_name', 'is_synthetic', 'usable_for_training', 'data_provenance']
OUTCOME_FIELDS = ['delay_label', 'delay_days', 'remaining_delay_days', 'actual_completion_date']
DATE_FIELDS = ['project_start_date', 'planned_completion_date', 'actual_completion_date']

CATEGORICAL_CANDIDATES = ['state', 'district', 'project_type', 'current_stage']
NUMERICAL_CANDIDATES = [
    'land_area', 'affected_families', 'pending_approvals', 'legal_disputes',
    'ownership_conflicts', 'documentation_completion_pct', 'approval_completion_pct',
    'compensation_total', 'compensation_progress', 'compensation_delay_days',
    'rr_total_families', 'rr_completed_families', 'rr_pending_families', 'rr_progress',
    'days_current_stage', 'historical_stage_avg_days', 'historical_delay_rate',
    'previous_project_delay_rate', 'department_avg_processing_days',
    'planned_duration_days', 'observed_elapsed_days', 'remaining_planned_days',
    'elapsed_vs_planned_ratio', 'stage_overrun_ratio'
]

CLASSIFIER_MODELS = ['LogisticRegression', 'ExtraTrees', 'RandomForest', 'XGBoost', 'LightGBM']
REGRESSOR_MODELS = ['Ridge', 'ExtraTreesRegressor', 'RandomForestRegressor', 'XGBoostRegressor', 'LightGBMRegressor']

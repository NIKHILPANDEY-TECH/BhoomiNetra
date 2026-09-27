
import json
import warnings
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_classif, mutual_info_regression
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import OrdinalEncoder
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold

from .config import REPORT_DIR, ID_METADATA, OUTCOME_FIELDS, DATE_FIELDS

def _single_feature_classification_score(x, y):
    x = pd.to_numeric(x, errors="coerce")
    if not x.notna().any():
        return np.nan
    x = x.fillna(x.median())
    if x.nunique() <= 1:
        return np.nan
    auc = roc_auc_score(y, x)
    return float(max(auc, 1 - auc))

def _single_feature_regression_corr(x, y):
    x = pd.to_numeric(x, errors="coerce")
    return float(x.corr(y))

def run_target_forensics(df):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    y_cls = df["delay_label"].astype(int)
    y_reg = df["delay_days"].astype(float)

    numeric = df.select_dtypes(include=np.number).columns.tolist()
    candidates = [c for c in numeric if c not in ["delay_label", "delay_days", "remaining_delay_days", "actual_completion_date", "project_start_date", "planned_completion_date"]]

    rows = []
    for c in candidates:
        x = df[c]
        rows.append({
            "feature": c,
            "pearson_delay_label": float(pd.to_numeric(x, errors="coerce").corr(y_cls)),
            "pearson_delay_days": float(pd.to_numeric(x, errors="coerce").corr(y_reg)),
            "single_feature_auc": _single_feature_classification_score(x, y_cls),
            "unique_values": int(x.nunique(dropna=True)),
        })

    rel = pd.DataFrame(rows).sort_values("single_feature_auc", ascending=False)
    rel.to_csv(REPORT_DIR / "target_relationships.csv", index=False)

    mi_cls = {}
    mi_reg = {}
    Xnum = df[candidates].copy()
    Xnum = Xnum.replace([np.inf, -np.inf], np.nan)
    # Mutual-information estimators cannot operate on columns that contain
    # no usable observations. Drop those columns explicitly rather than
    # allowing an opaque NumPy "Mean of empty slice" warning.
    valid_mi_columns = [c for c in candidates if Xnum[c].notna().any()]
    Xnum = Xnum[valid_mi_columns].copy()
    Xnum = Xnum.fillna(Xnum.median(numeric_only=True))
    # A column can still be unusable after coercion/imputation if it had no
    # finite values; remove it before calling sklearn.
    valid_mi_columns = [c for c in valid_mi_columns if Xnum[c].notna().any()]
    Xnum = Xnum[valid_mi_columns]
    try:
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", message="Mean of empty slice", category=RuntimeWarning)
            mi = mutual_info_classif(Xnum, y_cls, random_state=42)
        mi_cls = {c: float(v) for c, v in zip(valid_mi_columns, mi)}
    except Exception as e:
        mi_cls = {"error": str(e)}
    try:
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", message="Mean of empty slice", category=RuntimeWarning)
            mi = mutual_info_regression(Xnum, y_reg, random_state=42)
        mi_reg = {c: float(v) for c, v in zip(valid_mi_columns, mi)}
    except Exception as e:
        mi_reg = {"error": str(e)}

    # Explicit deterministic / near-deterministic checks.
    deterministic = {}
    if "compensation_pending" in df and "compensation_progress" in df:
        diff = (df["compensation_pending"] + df["compensation_progress"] - 100).abs()
        deterministic["compensation_pending_plus_progress"] = {
            "max_abs_error_from_100": float(diff.max()),
            "is_deterministic": bool(diff.max() == 0),
            "note": "These two fields encode the same information and one should be removed from ML features."
        }
    if "stage_index" in df and "current_stage" in df:
        map_counts = df.groupby("current_stage")["stage_index"].nunique()
        deterministic["stage_index_current_stage"] = {
            "max_unique_stage_index_per_current_stage": int(map_counts.max()),
            "is_deterministic_mapping": bool(map_counts.max() == 1),
            "note": "Stage index is redundant with current_stage in this dataset."
        }

    report = {
        "dataset_note": "Synthetic prototype data; target-forensics findings do not establish real-world causal relationships.",
        "classification_target": "delay_label",
        "regression_target": "delay_days",
        "numeric_relationships": rel.to_dict(orient="records"),
        "mutual_information_classification": mi_cls,
        "mutual_information_regression": mi_reg,
        "deterministic_relationships": deterministic,
        "suspicious_features": [],
        "interpretation_rules": [
            "High association alone is not leakage; a feature is leakage when it contains future/outcome information or is constructed from the target/outcome.",
            "remaining_delay_days, actual_completion_date, delay_days and delay_label are outcomes and excluded from predictors.",
            "stage_overrun_ratio and historical_delay_rate require a prediction-time availability assumption; they are retained only if documented as current/historical information."
        ]
    }

    # Flag outcome-like fields and near-perfect associations for human review.
    for r in rows:
        if abs(r["single_feature_auc"] - 0.5) > 0.45:
            report["suspicious_features"].append({
                "feature": r["feature"],
                "single_feature_auc": r["single_feature_auc"],
                "reason": "Very strong univariate association; inspect provenance before production use."
            })

    with open(REPORT_DIR / "target_forensics.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=str)
    return report

def build_leakage_report(df):
    rows = []
    for c in df.columns:
        status, reason = "SAFE_CANDIDATE", "Potential prediction-time feature; provenance must be confirmed."
        if c in ID_METADATA:
            status, reason = "EXCLUDED", "Identifier, metadata, or training-control field; not a predictor."
        elif c in ["delay_label", "delay_days", "remaining_delay_days", "actual_completion_date"]:
            status, reason = "LEAKED/OUTCOME", "Target or future/outcome information; unavailable for valid prediction."
        elif c == "project_start_date":
            status, reason = "EXCLUDED", "Date metadata retained for chronological splitting, not used as a raw predictor."
        elif c == "planned_completion_date":
            status, reason = "EXCLUDED", "Planned milestone date is redundant with start/planned duration and is excluded to reduce proxy leakage."
        elif c == "data_provenance":
            status, reason = "EXCLUDED", "Dataset provenance metadata."
        elif c == "compensation_pending":
            status, reason = "EXCLUDED", "Deterministically redundant with compensation_progress (sum equals 100 in all rows)."
        elif c == "stage_index":
            status, reason = "EXCLUDED", "Deterministically redundant with current_stage in this dataset."
        elif c == "historical_delay_rate":
            status, reason = "SAFE_CANDIDATE", "Historical aggregate; valid only if computed from prior projects/snapshots and frozen before prediction."
        elif c == "stage_overrun_ratio":
            status, reason = "SAFE_CANDIDATE", "Current-stage diagnostic; valid only if available at prediction time and not computed using future completion outcomes."
        rows.append({"feature": c, "status": status, "reason": reason})
    out = pd.DataFrame(rows)
    out.to_csv(REPORT_DIR / "feature_leakage_report.csv", index=False)
    return out

def main():
    df = pd.read_csv(Path(__file__).resolve().parents[1] / "data" / "data.csv")
    run_target_forensics(df)
    build_leakage_report(df)
    print("Target forensics and leakage report written.")

if __name__ == "__main__":
    main()

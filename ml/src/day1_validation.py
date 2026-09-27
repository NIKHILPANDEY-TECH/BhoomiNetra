from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
)

from .config import DATA_PATH, MODEL_DIR, REPORT_DIR, OUTCOME_FIELDS, ID_METADATA
from .preprocessing import build_preprocessor, get_feature_columns


DEFAULT_SEEDS = [42, 52, 62, 72, 82]


def chronological_split(df):
    dates = pd.to_datetime(df["project_start_date"], errors="coerce")
    if dates.isna().any():
        raise ValueError("project_start_date contains invalid or missing values.")
    ordered = df.iloc[np.argsort(dates.values)].reset_index(drop=True)
    n = len(ordered)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)
    return ordered.iloc[:train_end], ordered.iloc[train_end:val_end], ordered.iloc[val_end:]


def optimize_threshold(y, probability):
    best = None
    for threshold in np.arange(0.20, 0.801, 0.01):
        prediction = (probability >= threshold).astype(int)
        metrics = (
            f1_score(y, prediction, zero_division=0),
            recall_score(y, prediction, zero_division=0),
            -abs(threshold - 0.50),
        )
        if best is None or metrics > best[0]:
            best = (metrics, float(threshold))
    return best[1]


def classification_metrics(y, probability, threshold):
    prediction = (probability >= threshold).astype(int)
    return {
        "accuracy": accuracy_score(y, prediction),
        "precision": precision_score(y, prediction, zero_division=0),
        "recall": recall_score(y, prediction, zero_division=0),
        "f1": f1_score(y, prediction, zero_division=0),
        "roc_auc": roc_auc_score(y, probability),
        "pr_auc": average_precision_score(y, probability),
        "brier_score": brier_score_loss(y, probability),
        "threshold": threshold,
    }


def regression_metrics(y, prediction):
    return {
        "mae": mean_absolute_error(y, prediction),
        "rmse": np.sqrt(mean_squared_error(y, prediction)),
        "r2": r2_score(y, prediction),
    }


def set_seed(model, seed):
    params = model.get_params(deep=True)
    updates = {}
    for name in params:
        if name.endswith("random_state"):
            updates[name] = seed
    if updates:
        model.set_params(**updates)
    return model


def feature_audit(df, features):
    rows = []
    for column in df.columns:
        status = "PREDICTION_TIME_CANDIDATE"
        reason = "Requires provenance confirmation."
        if column in ID_METADATA:
            status = "EXCLUDED"
            reason = "Identifier, metadata, or training-control field."
        elif column in OUTCOME_FIELDS:
            status = "OUTCOME_LEAKAGE"
            reason = "Target or future outcome; unavailable at prediction time."
        elif column in {"project_start_date", "planned_completion_date"}:
            status = "EXCLUDED"
            reason = "Date metadata used for temporal splitting, not as a raw predictor."
        elif column in {"compensation_pending", "stage_index"}:
            status = "REDUNDANT"
            reason = "Already excluded from the current feature contract."
        elif column == "historical_delay_rate":
            status = "CONDITIONAL"
            reason = "Must be calculated only from prior/frozen historical records."
        elif column == "stage_overrun_ratio":
            status = "CONDITIONAL"
            reason = "Must use only information available at prediction time."
        if column in features and status not in {"PREDICTION_TIME_CANDIDATE", "CONDITIONAL"}:
            status = "REVIEW"
            reason = "Currently used by the feature contract but requires review."
        rows.append({"feature": column, "status": status, "reason": reason})

    numeric = df.select_dtypes(include=np.number)
    for i, first in enumerate(numeric.columns):
        for second in numeric.columns[i + 1:]:
            if np.allclose(
                numeric[first].to_numpy(),
                numeric[second].to_numpy(),
                equal_nan=True,
            ):
                rows.append({
                    "feature": f"{first} == {second}",
                    "status": "REDUNDANT_PAIR",
                    "reason": "Numeric columns are identical across all rows.",
                })

    return pd.DataFrame(rows)


def dataset_audit(df, features):
    all_null = [c for c in df.columns if df[c].isna().all()]
    duplicate_rows = int(df.duplicated().sum())

    summary = {
        "rows": len(df),
        "columns": len(df.columns),
        "features_used": len(features),
        "duplicate_rows": duplicate_rows,
        "all_null_columns": all_null,
        "missing_values": {
            c: int(n)
            for c, n in df.isna().sum().items()
            if n > 0
        },
        "delay_rate": float(df["delay_label"].mean()),
        "delay_days": {
            "min": float(df["delay_days"].min()),
            "median": float(df["delay_days"].median()),
            "mean": float(df["delay_days"].mean()),
            "p95": float(df["delay_days"].quantile(0.95)),
            "max": float(df["delay_days"].max()),
        },
        "feature_contract": features,
    }
    return summary


def main(seeds):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(DATA_PATH)
    usable = df[df["usable_for_training"].astype(bool)].copy()
    train, validation, test = chronological_split(usable)

    categorical, numerical = get_feature_columns(df)
    features = categorical + numerical

    audit = dataset_audit(df, features)
    audit["split"] = {
        "method": "chronological by project_start_date",
        "train_rows": len(train),
        "validation_rows": len(validation),
        "test_rows": len(test),
        "test_used_only_for_final_seed_evaluation": True,
    }

    leakage = feature_audit(df, features)
    leakage.to_csv(REPORT_DIR / "day1_leakage_audit.csv", index=False)

    with open(REPORT_DIR / "day1_data_audit.json", "w", encoding="utf-8") as file:
        json.dump(audit, file, indent=2, default=str)

    classifier_path = MODEL_DIR / "delay_classifier.pkl"
    regressor_path = MODEL_DIR / "delay_regressor.pkl"
    if not classifier_path.exists() or not regressor_path.exists():
        raise FileNotFoundError(
            "Trained model artifacts are required. Run python run_pipeline.py first."
        )

    classifier_template = joblib.load(classifier_path)
    regressor_template = joblib.load(regressor_path)

    results = []
    for seed in seeds:
        preprocessor, _, _ = build_preprocessor(df)

        classifier = clone(classifier_template)
        classifier = set_seed(classifier, seed)
        classifier.set_params(preprocessor=preprocessor)
        classifier.fit(train[features], train["delay_label"].astype(int))

        calibrated = CalibratedClassifierCV(
            estimator=classifier,
            method="sigmoid",
            cv=3,
            n_jobs=1,
        )
        calibrated.fit(train[features], train["delay_label"].astype(int))

        validation_probability = calibrated.predict_proba(validation[features])[:, 1]
        threshold = optimize_threshold(
            validation["delay_label"].astype(int),
            validation_probability,
        )

        test_probability = calibrated.predict_proba(test[features])[:, 1]
        cls = classification_metrics(
            test["delay_label"].astype(int),
            test_probability,
            threshold,
        )

        preprocessor_reg, _, _ = build_preprocessor(df)
        regressor = clone(regressor_template)
        regressor = set_seed(regressor, seed)
        regressor.set_params(preprocessor=preprocessor_reg)
        regressor.fit(train[features], train["delay_days"])

        test_prediction = np.maximum(
            0,
            regressor.predict(test[features]),
        )
        reg = regression_metrics(test["delay_days"], test_prediction)

        results.append({
            "seed": seed,
            "classifier": type(classifier.named_steps["model"]).__name__,
            "regressor": type(regressor.named_steps["model"]).__name__,
            **{f"class_{k}": v for k, v in cls.items()},
            **{f"reg_{k}": v for k, v in reg.items()},
        })

    results_df = pd.DataFrame(results)
    results_df.to_csv(REPORT_DIR / "day1_multi_seed_results.csv", index=False)

    numeric_columns = [
        c for c in results_df.columns
        if c not in {"seed", "classifier", "regressor"}
    ]
    summary = {}
    for column in numeric_columns:
        values = results_df[column]
        summary[column] = {
            "mean": float(values.mean()),
            "std": float(values.std(ddof=1)),
            "min": float(values.min()),
            "max": float(values.max()),
        }

    final = {
        "seeds": seeds,
        "classifier": results_df["classifier"].iloc[0],
        "regressor": results_df["regressor"].iloc[0],
        "multi_seed_summary": summary,
        "interpretation": [
            "The test set is the same chronological holdout for every seed.",
            "Threshold is optimized on validation data only.",
            "Calibration is fit on training data only.",
            "This is a stability check, not a new model-selection procedure.",
            "Synthetic-data performance must not be presented as real-world accuracy.",
        ],
    }

    with open(REPORT_DIR / "day1_multi_seed_summary.json", "w", encoding="utf-8") as file:
        json.dump(final, file, indent=2, default=str)

    print(json.dumps({
        "status": "complete",
        "classifier": final["classifier"],
        "regressor": final["regressor"],
        "seeds": seeds,
        "reports": [
            "reports/day1_data_audit.json",
            "reports/day1_leakage_audit.csv",
            "reports/day1_multi_seed_results.csv",
            "reports/day1_multi_seed_summary.json",
        ],
    }, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Day 1 stability and leakage checks.")
    parser.add_argument(
        "--seeds",
        nargs="+",
        type=int,
        default=DEFAULT_SEEDS,
        help="Random seeds used for stability checks.",
    )
    args = parser.parse_args()
    main(args.seeds)


import json
from pathlib import Path
import numpy as np
import pandas as pd

from .config import DATA_PATH, REPORT_DIR

CONSTRAINTS = {
    "land_area": lambda s: s > 0,
    "affected_families": lambda s: s >= 0,
    "compensation_progress": lambda s: s.between(0, 100),
    "rr_progress": lambda s: s.between(0, 100),
    "legal_disputes": lambda s: s >= 0,
    "delay_days": lambda s: s >= 0,
    "remaining_delay_days": lambda s: s >= 0,
}

def audit_dataframe(df: pd.DataFrame):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report = {
        "dataset": str(DATA_PATH),
        "rows": int(len(df)),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "dtypes": {c: str(t) for c, t in df.dtypes.items()},
        "missing_values": {c: int(v) for c, v in df.isna().sum().items()},
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_project_ids": int(df["project_id"].duplicated().sum()) if "project_id" in df else None,
        "unique_categorical_values": {},
        "numeric_ranges": {},
        "constraint_violations": {},
        "outlier_counts_iqr": {},
        "target_distribution": {},
        "date_validity": {},
        "synthetic_status": {},
        "notes": [
            "This is synthetic prototype data; audit results describe this dataset only."
        ],
    }

    cats = df.select_dtypes(include=["object", "category", "bool"]).columns
    for c in cats:
        vals = df[c].dropna().astype(str)
        report["unique_categorical_values"][c] = {
            "n_unique": int(vals.nunique()),
            "values": sorted(vals.unique().tolist())[:500],
        }

    for c in df.select_dtypes(include=np.number).columns:
        s = df[c].dropna()
        report["numeric_ranges"][c] = {
            "min": float(s.min()) if len(s) else None,
            "max": float(s.max()) if len(s) else None,
            "mean": float(s.mean()) if len(s) else None,
            "median": float(s.median()) if len(s) else None,
        }
        if len(s) >= 4:
            q1, q3 = s.quantile([0.25, 0.75])
            iqr = q3 - q1
            lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
            report["outlier_counts_iqr"][c] = int(((s < lo) | (s > hi)).sum())

    for c, fn in CONSTRAINTS.items():
        if c in df:
            mask = ~fn(df[c])
            report["constraint_violations"][c] = {
                "count": int(mask.sum()),
                "row_indices_sample": df.index[mask].tolist()[:20],
            }

    if "delay_label" in df:
        counts = df["delay_label"].value_counts(dropna=False)
        report["target_distribution"]["delay_label"] = {
            "counts": {str(k): int(v) for k, v in counts.items()},
            "positive_rate": float(df["delay_label"].mean()),
        }
    if "delay_days" in df:
        report["target_distribution"]["delay_days"] = {
            "mean": float(df["delay_days"].mean()),
            "median": float(df["delay_days"].median()),
            "p95": float(df["delay_days"].quantile(.95)),
            "max": float(df["delay_days"].max()),
        }

    for c in ["project_start_date", "planned_completion_date", "actual_completion_date"]:
        if c in df:
            parsed = pd.to_datetime(df[c], errors="coerce")
            report["date_validity"][c] = {
                "non_null": int(parsed.notna().sum()),
                "invalid_non_null": int(df[c].notna().sum() - parsed.notna().sum()),
                "min": str(parsed.min()) if parsed.notna().any() else None,
                "max": str(parsed.max()) if parsed.notna().any() else None,
            }

    report["synthetic_status"] = {
        "is_synthetic_unique": df["is_synthetic"].dropna().unique().tolist() if "is_synthetic" in df else [],
        "usable_for_training_counts": df["usable_for_training"].value_counts(dropna=False).astype(int).to_dict()
            if "usable_for_training" in df else {},
        "data_provenance_unique": df["data_provenance"].dropna().unique().tolist()
            if "data_provenance" in df else [],
    }

    pd.DataFrame([
        {"check": f"constraint:{k}", "violations": v["count"]}
        for k, v in report["constraint_violations"].items()
    ]).to_csv(REPORT_DIR / "data_quality_report.csv", index=False)

    with open(REPORT_DIR / "data_audit_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=str)
    return report

def main():
    df = pd.read_csv(DATA_PATH)
    audit_dataframe(df)
    print("Data audit written to reports/data_audit_report.json")

if __name__ == "__main__":
    main()


import numpy as np
import pandas as pd
from pathlib import Path

def stage_risk_table(df):
    d = df.copy()
    # Transparent analytics score; not an ML prediction and not causal.
    overrun = d["stage_overrun_ratio"].clip(lower=0).rank(pct=True)
    hist = d["historical_delay_rate"].clip(lower=0).rank(pct=True)
    risk = 100 * (0.60 * overrun + 0.40 * hist)
    d["_risk_score"] = risk

    out = d.groupby(["current_stage", "stage_index"], as_index=False).agg(
        risk_score=("_risk_score", "mean"),
        projects_at_risk=("delay_label", "sum"),
        projects=("project_id", "count"),
        average_days=("days_current_stage", "mean"),
        benchmark_days=("historical_stage_avg_days", "mean"),
        overrun_ratio=("stage_overrun_ratio", "mean"),
    )
    out["projects_at_risk"] = out["projects_at_risk"].astype(int)
    out["risk_score"] = out["risk_score"].round(2)
    out["average_days"] = out["average_days"].round(2)
    out["benchmark_days"] = out["benchmark_days"].round(2)
    out["overrun_ratio"] = out["overrun_ratio"].round(3)
    return out.sort_values("risk_score", ascending=False)

def run(df, output_path):
    out = stage_risk_table(df)
    out.to_csv(output_path, index=False)
    return out

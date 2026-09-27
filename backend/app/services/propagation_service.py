STAGES = [
    "Land Acquisition",
    "Compensation",
    "Rehabilitation",
    "Possession",
    "Construction",
    "Completion",
]


def estimate(project):
    base = max(0.0, float(project.days_current_stage) - float(project.historical_stage_avg_days))
    if base <= 0:
        return []

    index = max(0, min(int(project.stage_index), len(STAGES) - 1))
    estimates = []
    for offset, stage in enumerate(STAGES[index:]):
        factor = max(0.0, 1.0 - offset * 0.15)
        estimates.append({
            "stage": stage,
            "estimated_delay_days": round(base * factor, 2),
        })
    return estimates

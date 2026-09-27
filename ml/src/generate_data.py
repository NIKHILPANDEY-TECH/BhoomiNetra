from pathlib import Path
import numpy as np
import pandas as pd

SEED = 42
ROWS = 5000
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'data.csv'

STATES = {
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
    'Maharashtra': ['Pune', 'Nagpur', 'Nashik', 'Navi Mumbai'],
    'Rajasthan': ['Jaipur', 'Ajmer', 'Kota', 'Jodhpur'],
    'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Tumakuru', 'Dharwad'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur Nagar', 'Agra', 'Prayagraj'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
}
PROJECT_TYPES = ['Highway', 'Railway', 'Irrigation', 'Industrial Corridor', 'Urban Development', 'Power']
STAGES = ['Notification', 'Survey', 'Valuation', 'Compensation', 'R&R', 'Possession']


def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-np.clip(x, -30, 30)))


def make_data():
    rng = np.random.default_rng(SEED)
    n = ROWS

    start = pd.Timestamp('2022-01-01') + pd.to_timedelta(rng.integers(0, 1600, n), unit='D')
    state = rng.choice(list(STATES), n)
    district = [rng.choice(STATES[s]) for s in state]
    project_type = rng.choice(PROJECT_TYPES, n, p=[.28, .15, .14, .16, .15, .12])
    stage_index = rng.integers(1, 7, n)
    current_stage = np.array(STAGES)[stage_index - 1]

    land_area = np.clip(rng.lognormal(3.3, 1.15, n), 1.0, 2500).round(1)
    affected_families = np.maximum(5, rng.poisson(np.clip(land_area * rng.uniform(.8, 2.4, n), 5, 3500))).astype(int)

    complexity = (
        0.25 * np.log1p(land_area)
        + 0.20 * np.log1p(affected_families)
        + rng.normal(0, .35, n)
    )
    project_risk = sigmoid(complexity - 1.55)

    pending_approvals = np.clip(
        rng.poisson(1.0 + 4.0 * project_risk + .7 * (stage_index >= 3)), 0, 14
    ).astype(int)
    legal_disputes = np.clip(
        rng.poisson(.3 + 2.2 * project_risk + .4 * (affected_families > 300)), 0, 10
    ).astype(int)
    ownership_conflicts = np.clip(
        rng.poisson(.5 + 2.0 * project_risk + .5 * (legal_disputes > 1)), 0, 9
    ).astype(int)

    documentation_completion_pct = np.clip(
        96 - 5.5 * pending_approvals - 4.0 * ownership_conflicts + rng.normal(0, 8, n), 20, 100
    ).round(1)
    approval_completion_pct = np.clip(
        100 - pending_approvals * rng.uniform(4.5, 8.0, n) + rng.normal(0, 5, n), 10, 100
    ).round(1)

    compensation_total = np.maximum(1.0, affected_families * rng.uniform(0.7, 3.0, n)).round(1)
    compensation_progress = np.clip(
        92 - 0.7 * pending_approvals - 2.8 * legal_disputes - 1.8 * ownership_conflicts
        - 3.5 * np.maximum(stage_index - 3, 0) + rng.normal(0, 9, n), 8, 100
    ).round(1)
    compensation_paid = (compensation_total * compensation_progress / 100).round(1)
    compensation_pending = np.maximum(0, compensation_total - compensation_paid).round(1)
    compensation_delay_days = np.maximum(
        0, 4 + 2.2 * pending_approvals + 4.0 * legal_disputes + rng.normal(0, 6, n)
    ).round(1)

    rr_progress = np.clip(
        94 - 2.0 * legal_disputes - 1.2 * ownership_conflicts - 2.0 * np.maximum(stage_index - 4, 0)
        + rng.normal(0, 10, n), 5, 100
    ).round(1)
    rr_total_families = np.maximum(1, (affected_families * rng.uniform(.35, .85, n)).round()).astype(int)
    rr_completed_families = np.minimum(rr_total_families, np.round(rr_total_families * rr_progress / 100).astype(int))
    rr_pending_families = rr_total_families - rr_completed_families

    historical_stage_avg_days = np.clip(
        18 + 5.0 * stage_index + rng.normal(0, 4, n), 15, 65
    ).round().astype(int)
    days_current_stage = np.maximum(
        3, historical_stage_avg_days * (
            .65 + .06 * pending_approvals + .09 * legal_disputes + rng.normal(0, .18, n)
        )
    ).round().astype(int)
    stage_overrun_ratio = (days_current_stage / historical_stage_avg_days).round(3)

    historical_delay_rate = np.clip(
        0.08 + .035 * pending_approvals + .055 * legal_disputes + .025 * ownership_conflicts
        + rng.normal(0, .05, n), .02, .92
    ).round(3)
    previous_project_delay_rate = np.clip(
        historical_delay_rate + rng.normal(0, .07, n), .01, .95
    ).round(3)
    department_avg_processing_days = np.clip(
        22 + 3.0 * pending_approvals + 2.5 * legal_disputes + rng.normal(0, 8, n), 12, 90
    ).round(1)

    planned_duration_days = np.clip(
        300 + 1.7 * affected_families + 0.18 * land_area + 35 * (project_type == 'Railway')
        + rng.normal(0, 80, n), 180, 2200
    ).round().astype(int)
    observed_elapsed_days = np.clip(
        planned_duration_days * (.25 + .08 * stage_index + rng.normal(0, .08, n)), 30, 2100
    ).round(1)
    remaining_planned_days = np.maximum(1, planned_duration_days - observed_elapsed_days).round(1)
    elapsed_vs_planned_ratio = (observed_elapsed_days / planned_duration_days).round(3)

    risk_score = (
        -2.65
        + .25 * np.log1p(pending_approvals)
        + .34 * legal_disputes
        + .22 * ownership_conflicts
        + .95 * np.maximum(stage_overrun_ratio - 1, 0)
        + .018 * np.maximum(60 - documentation_completion_pct, 0)
        + .015 * np.maximum(65 - approval_completion_pct, 0)
        + .014 * np.maximum(70 - compensation_progress, 0)
        + .012 * np.maximum(70 - rr_progress, 0)
        + 1.10 * historical_delay_rate
        + .75 * previous_project_delay_rate
        + .80 * np.maximum(elapsed_vs_planned_ratio - .75, 0)
        + rng.normal(0, .24, n)
    )
    delay_probability = sigmoid(risk_score)
    delay_label = (risk_score + rng.normal(0, .28, n) > -0.20).astype(int)

    delay_days = np.maximum(
        0,
        2
        + 7.0 * pending_approvals
        + 12.0 * legal_disputes
        + 8.0 * ownership_conflicts
        + 28.0 * np.maximum(stage_overrun_ratio - 1, 0)
        + .45 * compensation_delay_days
        + .20 * rr_pending_families
        + 30.0 * historical_delay_rate
        + 22.0 * previous_project_delay_rate
        + 24.0 * np.maximum(elapsed_vs_planned_ratio - .75, 0)
        + rng.normal(0, 7, n)
    ).round(1)
    delay_days = np.where(delay_label == 1, delay_days, np.maximum(0, rng.normal(2.0, 1.5, n))).round(1)
    remaining_delay_days = np.maximum(0, delay_days - np.maximum(0, rng.normal(8, 5, n))).round(1)

    planned_completion = start + pd.to_timedelta(planned_duration_days, unit='D')

    df = pd.DataFrame({
        'project_id': [f'LA-{i:05d}' for i in range(1, n + 1)],
        'project_name': [f'{t} Land Acquisition Project {i:04d}' for i, t in enumerate(project_type, 1)],
        'state': state,
        'district': district,
        'project_type': project_type,
        'land_area': land_area,
        'affected_families': affected_families,
        'pending_approvals': pending_approvals,
        'legal_disputes': legal_disputes,
        'ownership_conflicts': ownership_conflicts,
        'documentation_completion_pct': documentation_completion_pct,
        'approval_completion_pct': approval_completion_pct,
        'compensation_total': compensation_total,
        'compensation_paid': compensation_paid,
        'compensation_pending': compensation_pending,
        'compensation_progress': compensation_progress,
        'compensation_delay_days': compensation_delay_days,
        'rr_total_families': rr_total_families,
        'rr_completed_families': rr_completed_families,
        'rr_pending_families': rr_pending_families,
        'rr_progress': rr_progress,
        'current_stage': current_stage,
        'stage_index': stage_index,
        'days_current_stage': days_current_stage,
        'historical_stage_avg_days': historical_stage_avg_days,
        'historical_delay_rate': historical_delay_rate,
        'previous_project_delay_rate': previous_project_delay_rate,
        'department_avg_processing_days': department_avg_processing_days,
        'planned_duration_days': planned_duration_days,
        'observed_elapsed_days': observed_elapsed_days,
        'remaining_planned_days': remaining_planned_days,
        'elapsed_vs_planned_ratio': elapsed_vs_planned_ratio,
        'project_start_date': start.strftime('%Y-%m-%d'),
        'planned_completion_date': planned_completion.strftime('%Y-%m-%d'),
        'actual_completion_date': np.nan,
        'stage_overrun_ratio': stage_overrun_ratio,
        'delay_label': delay_label,
        'delay_days': delay_days,
        'remaining_delay_days': remaining_delay_days,
        'is_synthetic': True,
        'usable_for_training': True,
        'data_provenance': 'Synthetic prototype data; generated from domain-inspired relationships',
    })
    return df


if __name__ == '__main__':
    df = make_data()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT, index=False)
    print(f'Wrote {len(df)} rows and {len(df.columns)} columns to {OUT}')

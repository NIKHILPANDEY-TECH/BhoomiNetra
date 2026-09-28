from app.services.ml_service import ml_service


def simulate(features, changes):
    baseline = ml_service.predict(features)
    scenario = dict(features)
    scenario.update(changes)
    simulated = ml_service.predict(scenario)

    b = float(baseline["risk_probability"])
    s = float(simulated["risk_probability"])
    bd = float(baseline["predicted_delay_days"])
    sd = float(simulated["predicted_delay_days"])
    return {
        "baseline_risk": b,
        "scenario_risk": s,
        "risk_change": s - b,
        "baseline_predicted_delay": bd,
        "scenario_predicted_delay": sd,
        "delay_change": sd - bd,
        "label": "model_based_scenario_estimate",
    }

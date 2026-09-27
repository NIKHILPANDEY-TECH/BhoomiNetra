from app.services.ml_service import ml_service
def simulate(features,changes):
    b=ml_service.predict_delay(features); bd=ml_service.predict_delay_days(features); scenario=dict(features); scenario.update(changes); s=ml_service.predict_delay(scenario); sd=ml_service.predict_delay_days(scenario)
    return {"baseline_risk":b,"scenario_risk":s,"risk_change":s-b,"baseline_predicted_delay":bd,"scenario_predicted_delay":sd,"delay_change":sd-bd,"label":"model_based_scenario_estimate"}

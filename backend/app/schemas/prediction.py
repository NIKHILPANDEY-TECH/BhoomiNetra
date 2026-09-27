from pydantic import BaseModel,Field
class PredictionOut(BaseModel): project_id:str; risk_probability:float; risk_percent:float; risk_band:str; predicted_delay_days:float; model_version:str; created_at:str
class ExplanationItem(BaseModel): feature:str; value:object; impact:float; direction:str
class BottleneckOut(BaseModel): primary_bottleneck:str; current_duration:float; benchmark_duration:float; overrun_percentage:float; severity:str
class SimulationRequest(BaseModel): changes:dict[str,object]
class SimulationOut(BaseModel): baseline_risk:float; scenario_risk:float; risk_change:float; baseline_predicted_delay:float; scenario_predicted_delay:float; delay_change:float; label:str

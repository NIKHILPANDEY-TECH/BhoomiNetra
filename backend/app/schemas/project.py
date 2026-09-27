from datetime import date
from pydantic import BaseModel,Field
class ProjectBase(BaseModel):
    project_name:str; state:str; district:str; project_type:str; land_area:float=Field(ge=0); affected_families:int=Field(ge=0); pending_approvals:int=Field(ge=0); legal_disputes:int=Field(ge=0); compensation_pending:int=Field(ge=0); compensation_progress:float=Field(ge=0,le=100); rr_progress:float=Field(ge=0,le=100); current_stage:str; stage_index:int=Field(ge=0); days_current_stage:int=Field(ge=0); historical_stage_avg_days:float=Field(ge=0); historical_delay_rate:float=Field(ge=0,le=1); planned_duration_days:int=Field(gt=0); observed_elapsed_days:int=Field(ge=0); stage_overrun_ratio:float=Field(ge=0); project_start_date:date; planned_completion_date:date; latitude:float|None=None; longitude:float|None=None
class ProjectCreate(ProjectBase): pass
class ProjectUpdate(BaseModel): project_name:str|None=None; pending_approvals:int|None=Field(default=None,ge=0); legal_disputes:int|None=Field(default=None,ge=0); compensation_pending:int|None=Field(default=None,ge=0); compensation_progress:float|None=Field(default=None,ge=0,le=100); rr_progress:float|None=Field(default=None,ge=0,le=100); current_stage:str|None=None; days_current_stage:int|None=Field(default=None,ge=0); observed_elapsed_days:int|None=Field(default=None,ge=0); stage_overrun_ratio:float|None=Field(default=None,ge=0)
class ProjectOut(ProjectBase):
    id:str; public_id:str; status:str; assigned_user_id:str|None; is_archived:bool

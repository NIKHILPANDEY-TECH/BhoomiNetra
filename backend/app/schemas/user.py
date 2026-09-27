from pydantic import BaseModel,Field
class UserCreate(BaseModel): username:str; email:str|None=None; password:str=Field(min_length=8); role:str; organization_id:str|None=None; state_id:str|None=None; division_id:str|None=None; district_id:str|None=None
class UserUpdate(BaseModel): is_active:bool|None=None; role:str|None=None
class UserOut(BaseModel): id:str; username:str; email:str|None; role:str; is_active:bool

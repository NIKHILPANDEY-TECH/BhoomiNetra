from typing import Any,Generic,TypeVar
from pydantic import BaseModel,ConfigDict,Field
T=TypeVar('T')
class DataResponse(BaseModel,Generic[T]): data:T; message:str="Success"
class ErrorBody(BaseModel): code:str; message:str; request_id:str|None=None
class ErrorResponse(BaseModel): error:ErrorBody
class Page(BaseModel,Generic[T]): data:list[T]; page:int; limit:int; total:int; message:str="Success"

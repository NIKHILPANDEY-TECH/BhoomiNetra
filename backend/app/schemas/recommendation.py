from pydantic import BaseModel
class RecommendationOut(BaseModel): recommendation:str; priority:str; reason:str; source:str

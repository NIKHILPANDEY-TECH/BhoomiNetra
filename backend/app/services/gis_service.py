from sqlalchemy import select,func
from app.models.project import Project
def viewport_query(db,min_lat,max_lat,min_lng,max_lng):
    return db.execute(select(Project).where(Project.is_archived.is_(False),func.ST_Within(Project.location,func.ST_MakeEnvelope(min_lng,min_lat,max_lng,max_lat,4326)))).scalars().all()

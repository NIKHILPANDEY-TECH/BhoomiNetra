from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography
revision="0001_initial"; down_revision=None; branch_labels=None; depends_on=None
def upgrade():
    from app.database.base import Base
    import app.models
    bind=op.get_bind(); Base.metadata.create_all(bind=bind)
def downgrade():
    from app.database.base import Base
    import app.models
    bind=op.get_bind(); Base.metadata.drop_all(bind=bind)

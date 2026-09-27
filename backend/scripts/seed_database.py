import csv
import os
from datetime import datetime
from pathlib import Path

from geoalchemy2.elements import WKTElement
from sqlalchemy import select

from app.database.database import SessionLocal, init_db
from app.models.jurisdiction import Jurisdiction
from app.models.organization import Organization
from app.models.project import Project


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATA_PATH = BASE_DIR / "ml" / "data" / "data.csv"
EXCLUDED = {
    "project_id",
    "delay_label",
    "delay_days",
    "remaining_delay_days",
    "actual_completion_date",
    "is_synthetic",
    "usable_for_training",
    "data_provenance",
}


def get_or_create_jurisdiction(db, name, level, parent_id=None):
    if not name:
        return None
    item = db.execute(
        select(Jurisdiction).where(
            Jurisdiction.name == name,
            Jurisdiction.level == level,
            Jurisdiction.parent_id == parent_id,
        )
    ).scalar_one_or_none()
    if item:
        return item
    item = Jurisdiction(name=name, level=level, parent_id=parent_id)
    db.add(item)
    db.flush()
    return item


def main():
    init_db()
    db = SessionLocal()
    path = Path(os.getenv("SEED_DATA_PATH", str(DEFAULT_DATA_PATH)))

    try:
        if not path.exists():
            raise FileNotFoundError(f"Seed data not found: {path}")

        organization = db.execute(
            select(Organization).where(Organization.name == "BhoomiMitra Demo Organization")
        ).scalar_one_or_none()
        if organization is None:
            organization = Organization(name="BhoomiMitra Demo Organization")
            db.add(organization)
            db.flush()

        created = 0

        with path.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                public_id = row["project_id"]
                if db.execute(select(Project.id).where(Project.public_id == public_id)).scalar_one_or_none():
                    continue

                state = get_or_create_jurisdiction(db, row["state"], "STATE")
                district = get_or_create_jurisdiction(db, row["district"], "DISTRICT", state.id if state else None)

                def number(name):
                    return float(row[name])

                def integer(name):
                    return int(float(row[name]))

                start_date = datetime.fromisoformat(row["project_start_date"]).date()
                planned_completion = datetime.fromisoformat(row["planned_completion_date"]).date()

                project = Project(
                    public_id=public_id,
                    project_name=row["project_name"],
                    state=row["state"],
                    district=row["district"],
                    project_type=row["project_type"],
                    land_area=number("land_area"),
                    affected_families=integer("affected_families"),
                    pending_approvals=integer("pending_approvals"),
                    legal_disputes=integer("legal_disputes"),
                    compensation_pending=integer("compensation_pending"),
                    compensation_progress=number("compensation_progress"),
                    rr_progress=number("rr_progress"),
                    current_stage=row["current_stage"],
                    stage_index=integer("stage_index"),
                    days_current_stage=integer("days_current_stage"),
                    historical_stage_avg_days=number("historical_stage_avg_days"),
                    historical_delay_rate=number("historical_delay_rate"),
                    planned_duration_days=integer("planned_duration_days"),
                    observed_elapsed_days=integer("observed_elapsed_days"),
                    stage_overrun_ratio=number("stage_overrun_ratio"),
                    project_start_date=start_date,
                    planned_completion_date=planned_completion,
                    organization_id=organization.id,
                    state_id=state.id if state else None,
                    district_id=district.id if district else None,
                    status="ACTIVE",
                    is_archived=False,
                )
                db.add(project)
                created += 1

        db.commit()
        print(f"Created projects: {created}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

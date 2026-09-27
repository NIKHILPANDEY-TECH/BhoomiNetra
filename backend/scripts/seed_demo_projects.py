from datetime import date, timedelta

from geoalchemy2.elements import WKTElement
from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.project import Project
from app.models.user import User


PROJECTS = [
    {
        "project_name": "Narmada Irrigation Expansion Project",
        "state": "Madhya Pradesh",
        "district": "Khandwa",
        "project_type": "Irrigation",
        "land_area": 820.5,
        "affected_families": 420,
        "pending_approvals": 1,
        "legal_disputes": 2,
        "compensation_pending": 38,
        "compensation_progress": 91,
        "rr_progress": 88,
        "current_stage": "Compensation",
        "stage_index": 1,
        "days_current_stage": 34,
        "historical_stage_avg_days": 45,
        "historical_delay_rate": 0.18,
        "planned_duration_days": 900,
        "observed_elapsed_days": 420,
        "stage_overrun_ratio": 0.0,
        "latitude": 21.8257,
        "longitude": 76.3526,
    },
    {
        "project_name": "Indore Outer Ring Road Land Acquisition",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "project_type": "Road",
        "land_area": 640.2,
        "affected_families": 685,
        "pending_approvals": 6,
        "legal_disputes": 17,
        "compensation_pending": 214,
        "compensation_progress": 58,
        "rr_progress": 46,
        "current_stage": "Compensation",
        "stage_index": 1,
        "days_current_stage": 126,
        "historical_stage_avg_days": 72,
        "historical_delay_rate": 0.61,
        "planned_duration_days": 720,
        "observed_elapsed_days": 510,
        "stage_overrun_ratio": 0.75,
        "latitude": 22.7196,
        "longitude": 75.8577,
    },
    {
        "project_name": "Bhopal Regional Logistics Corridor",
        "state": "Madhya Pradesh",
        "district": "Bhopal",
        "project_type": "Industrial Corridor",
        "land_area": 1120.8,
        "affected_families": 930,
        "pending_approvals": 9,
        "legal_disputes": 28,
        "compensation_pending": 390,
        "compensation_progress": 41,
        "rr_progress": 31,
        "current_stage": "Land Acquisition",
        "stage_index": 0,
        "days_current_stage": 168,
        "historical_stage_avg_days": 80,
        "historical_delay_rate": 0.72,
        "planned_duration_days": 1000,
        "observed_elapsed_days": 610,
        "stage_overrun_ratio": 1.1,
        "latitude": 23.2599,
        "longitude": 77.4126,
    },
    {
        "project_name": "Jabalpur Highway Widening Package",
        "state": "Madhya Pradesh",
        "district": "Jabalpur",
        "project_type": "Highway",
        "land_area": 510.4,
        "affected_families": 310,
        "pending_approvals": 4,
        "legal_disputes": 8,
        "compensation_pending": 95,
        "compensation_progress": 69,
        "rr_progress": 61,
        "current_stage": "Rehabilitation",
        "stage_index": 2,
        "days_current_stage": 108,
        "historical_stage_avg_days": 70,
        "historical_delay_rate": 0.47,
        "planned_duration_days": 680,
        "observed_elapsed_days": 455,
        "stage_overrun_ratio": 0.54,
        "latitude": 23.1815,
        "longitude": 79.9864,
    },
    {
        "project_name": "Satna Industrial Water Supply Project",
        "state": "Madhya Pradesh",
        "district": "Satna",
        "project_type": "Water Infrastructure",
        "land_area": 390.7,
        "affected_families": 180,
        "pending_approvals": 3,
        "legal_disputes": 4,
        "compensation_pending": 42,
        "compensation_progress": 77,
        "rr_progress": 73,
        "current_stage": "Possession",
        "stage_index": 3,
        "days_current_stage": 52,
        "historical_stage_avg_days": 60,
        "historical_delay_rate": 0.23,
        "planned_duration_days": 620,
        "observed_elapsed_days": 410,
        "stage_overrun_ratio": 0.0,
        "latitude": 24.6005,
        "longitude": 80.8322,
    },
    {
        "project_name": "Gwalior Urban Connectivity Project",
        "state": "Madhya Pradesh",
        "district": "Gwalior",
        "project_type": "Urban Infrastructure",
        "land_area": 275.3,
        "affected_families": 245,
        "pending_approvals": 7,
        "legal_disputes": 11,
        "compensation_pending": 88,
        "compensation_progress": 52,
        "rr_progress": 39,
        "current_stage": "Approvals",
        "stage_index": 0,
        "days_current_stage": 96,
        "historical_stage_avg_days": 48,
        "historical_delay_rate": 0.56,
        "planned_duration_days": 540,
        "observed_elapsed_days": 350,
        "stage_overrun_ratio": 1.0,
        "latitude": 26.2183,
        "longitude": 78.1828,
    },
    {
        "project_name": "Rewa Renewable Energy Land Pool",
        "state": "Madhya Pradesh",
        "district": "Rewa",
        "project_type": "Renewable Energy",
        "land_area": 1450.6,
        "affected_families": 520,
        "pending_approvals": 2,
        "legal_disputes": 5,
        "compensation_pending": 61,
        "compensation_progress": 84,
        "rr_progress": 79,
        "current_stage": "Land Acquisition",
        "stage_index": 0,
        "days_current_stage": 58,
        "historical_stage_avg_days": 75,
        "historical_delay_rate": 0.21,
        "planned_duration_days": 850,
        "observed_elapsed_days": 310,
        "stage_overrun_ratio": 0.0,
        "latitude": 24.5362,
        "longitude": 81.3037,
    },
    {
        "project_name": "Sagar Agricultural Processing Zone",
        "state": "Madhya Pradesh",
        "district": "Sagar",
        "project_type": "Industrial Zone",
        "land_area": 730.9,
        "affected_families": 610,
        "pending_approvals": 8,
        "legal_disputes": 19,
        "compensation_pending": 265,
        "compensation_progress": 49,
        "rr_progress": 44,
        "current_stage": "Compensation",
        "stage_index": 1,
        "days_current_stage": 142,
        "historical_stage_avg_days": 68,
        "historical_delay_rate": 0.67,
        "planned_duration_days": 760,
        "observed_elapsed_days": 535,
        "stage_overrun_ratio": 1.09,
        "latitude": 23.8388,
        "longitude": 78.7378,
    },
    {
        "project_name": "Ujjain Urban Transit Expansion",
        "state": "Madhya Pradesh",
        "district": "Ujjain",
        "project_type": "Urban Transit",
        "land_area": 185.2,
        "affected_families": 145,
        "pending_approvals": 1,
        "legal_disputes": 1,
        "compensation_pending": 18,
        "compensation_progress": 94,
        "rr_progress": 91,
        "current_stage": "Possession",
        "stage_index": 3,
        "days_current_stage": 42,
        "historical_stage_avg_days": 55,
        "historical_delay_rate": 0.14,
        "planned_duration_days": 480,
        "observed_elapsed_days": 350,
        "stage_overrun_ratio": 0.0,
        "latitude": 23.1765,
        "longitude": 75.7885,
    },
]


def main():
    db = SessionLocal()

    try:
        user = db.execute(
            select(User).where(User.username == "national.admin")
        ).scalars().first()

        if not user:
            raise RuntimeError("national.admin user not found")

        existing = {
            project.project_name
            for project in db.execute(select(Project)).scalars().all()
        }

        max_number = db.execute(
            select(Project.public_id)
            .order_by(Project.public_id.desc())
            .limit(1)
        ).scalar()

        next_number = (
            int(max_number.split("-")[1]) + 1
            if max_number and max_number.startswith("LA-")
            else 1
        )

        created = 0

        for item in PROJECTS:
            if item["project_name"] in existing:
                continue

            latitude = item.pop("latitude")
            longitude = item.pop("longitude")

            start_date = date.today() - timedelta(
                days=item["observed_elapsed_days"]
            )

            planned_completion_date = start_date + timedelta(
                days=item["planned_duration_days"]
            )

            project = Project(
                public_id=f"LA-{next_number:05d}",
                project_name=item["project_name"],
                state=item["state"],
                district=item["district"],
                project_type=item["project_type"],
                land_area=item["land_area"],
                affected_families=item["affected_families"],
                pending_approvals=item["pending_approvals"],
                legal_disputes=item["legal_disputes"],
                compensation_pending=item["compensation_pending"],
                compensation_progress=item["compensation_progress"],
                rr_progress=item["rr_progress"],
                current_stage=item["current_stage"],
                stage_index=item["stage_index"],
                days_current_stage=item["days_current_stage"],
                historical_stage_avg_days=item["historical_stage_avg_days"],
                historical_delay_rate=item["historical_delay_rate"],
                planned_duration_days=item["planned_duration_days"],
                observed_elapsed_days=item["observed_elapsed_days"],
                stage_overrun_ratio=item["stage_overrun_ratio"],
                project_start_date=start_date,
                planned_completion_date=planned_completion_date,
                organization_id=user.organization_id,
                state_id=user.state_id,
                division_id=user.division_id,
                district_id=user.district_id,
                location=WKTElement(
                    f"POINT({longitude} {latitude})",
                    srid=4326,
                ),
                status="ACTIVE",
                is_archived=False,
            )

            db.add(project)
            next_number += 1
            created += 1

        db.commit()

        print(f"Created projects: {created}")

        projects = db.execute(
            select(Project)
            .where(Project.is_archived.is_(False))
            .order_by(Project.public_id)
        ).scalars().all()

        for project in projects:
            print(
                f"{project.public_id} | "
                f"{project.project_name} | "
                f"{project.current_stage} | "
                f"{project.district}"
            )

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
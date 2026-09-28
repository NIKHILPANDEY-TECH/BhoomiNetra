import csv
import hashlib
from datetime import datetime
from pathlib import Path

from geoalchemy2.elements import WKTElement
from sqlalchemy import select

from app.database.database import SessionLocal, init_db
from app.models.jurisdiction import Jurisdiction
from app.models.organization import Organization
from app.models.project import Project


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "ml" / "data" / "data.csv"


# Approximate district centers for prototype GIS visualization.
# These are visualization coordinates, not project survey coordinates.
DISTRICT_COORDS = {
    "Agra": (27.1767, 78.0081),
    "Ahmedabad": (23.0225, 72.5714),
    "Ajmer": (26.4499, 74.6399),
    "Bengaluru Urban": (12.9716, 77.5946),
    "Bhopal": (23.2599, 77.4126),
    "Dharwad": (15.4589, 75.0078),
    "Gwalior": (26.2183, 78.1828),
    "Indore": (22.7196, 75.8577),
    "Jabalpur": (23.1815, 79.9864),
    "Jaipur": (26.9124, 75.7873),
    "Jodhpur": (26.2389, 73.0243),
    "Kanpur Nagar": (26.4499, 80.3319),
    "Kota": (25.2138, 75.8648),
    "Lucknow": (26.8467, 80.9462),
    "Mysuru": (12.2958, 76.6394),
    "Nagpur": (21.1458, 79.0882),
    "Nashik": (19.9975, 73.7898),
    "Navi Mumbai": (19.0330, 73.0297),
    "Prayagraj": (25.4358, 81.8463),
    "Pune": (18.5204, 73.8567),
    "Rajkot": (22.3039, 70.8022),
    "Surat": (21.1702, 72.8311),
    "Tumakuru": (13.3409, 77.1010),
    "Vadodara": (22.3072, 73.1812),
}


def get_or_create_jurisdiction(
    db,
    name,
    level,
    parent_id=None,
):
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

    item = Jurisdiction(
        name=name,
        level=level,
        parent_id=parent_id,
    )

    db.add(item)
    db.flush()

    return item


def deterministic_location(district, public_id):
    """
    Returns a deterministic point around the district center.

    These coordinates are ONLY for prototype GIS visualization.
    """

    if district not in DISTRICT_COORDS:
        return None

    base_lat, base_lon = DISTRICT_COORDS[district]

    digest = hashlib.sha256(
        public_id.encode("utf-8")
    ).hexdigest()

    # Deterministic values in approximately [-0.03, +0.03]
    lat_fraction = int(digest[:8], 16) / 0xFFFFFFFF
    lon_fraction = int(digest[8:16], 16) / 0xFFFFFFFF

    lat_offset = (lat_fraction - 0.5) * 0.06
    lon_offset = (lon_fraction - 0.5) * 0.06

    latitude = base_lat + lat_offset
    longitude = base_lon + lon_offset

    return WKTElement(
        f"POINT({longitude} {latitude})",
        srid=4326,
    )


def number(row, name):
    return float(row[name])


def integer(row, name):
    return int(float(row[name]))


def main():
    init_db()

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    print("=" * 70)
    print("BHOOMINETRA PRODUCTION PROJECT IMPORT")
    print("=" * 70)
    print(f"Dataset: {DATA_PATH}")

    db = SessionLocal()

    try:
        organization = db.execute(
            select(Organization).where(
                Organization.name == "BhoomiMitra Demo Organization"
            )
        ).scalar_one_or_none()

        if organization is None:
            organization = Organization(
                name="BhoomiMitra Demo Organization"
            )
            db.add(organization)
            db.flush()

        existing_ids = set(
            db.execute(
                select(Project.public_id)
            ).scalars().all()
        )

        print(f"Existing projects: {len(existing_ids)}")

        created = 0
        skipped = 0
        missing_coordinates = 0

        with DATA_PATH.open(
            newline="",
            encoding="utf-8",
        ) as handle:

            reader = csv.DictReader(handle)

            for row in reader:

                public_id = row["project_id"]

                # Never duplicate production records.
                if public_id in existing_ids:
                    skipped += 1
                    continue

                state_name = row["state"]
                district_name = row["district"]

                state = get_or_create_jurisdiction(
                    db,
                    state_name,
                    "STATE",
                )

                district = get_or_create_jurisdiction(
                    db,
                    district_name,
                    "DISTRICT",
                    state.id if state else None,
                )

                start_date = datetime.fromisoformat(
                    row["project_start_date"]
                ).date()

                planned_completion = datetime.fromisoformat(
                    row["planned_completion_date"]
                ).date()

                location = deterministic_location(
                    district_name,
                    public_id,
                )

                if location is None:
                    missing_coordinates += 1

                project = Project(
                    public_id=public_id,
                    project_name=row["project_name"],
                    state=state_name,
                    district=district_name,
                    project_type=row["project_type"],

                    land_area=number(row, "land_area"),
                    affected_families=integer(
                        row,
                        "affected_families",
                    ),
                    pending_approvals=integer(
                        row,
                        "pending_approvals",
                    ),
                    legal_disputes=integer(
                        row,
                        "legal_disputes",
                    ),

                    compensation_pending=integer(
                        row,
                        "compensation_pending",
                    ),
                    compensation_progress=number(
                        row,
                        "compensation_progress",
                    ),
                    rr_progress=number(
                        row,
                        "rr_progress",
                    ),

                    current_stage=row["current_stage"],
                    stage_index=integer(
                        row,
                        "stage_index",
                    ),
                    days_current_stage=integer(
                        row,
                        "days_current_stage",
                    ),
                    historical_stage_avg_days=number(
                        row,
                        "historical_stage_avg_days",
                    ),
                    historical_delay_rate=number(
                        row,
                        "historical_delay_rate",
                    ),
                    planned_duration_days=integer(
                        row,
                        "planned_duration_days",
                    ),
                    observed_elapsed_days=integer(
                        row,
                        "observed_elapsed_days",
                    ),
                    stage_overrun_ratio=number(
                        row,
                        "stage_overrun_ratio",
                    ),

                    project_start_date=start_date,
                    planned_completion_date=planned_completion,

                    organization_id=organization.id,
                    state_id=state.id if state else None,
                    district_id=district.id if district else None,

                    status="ACTIVE",
                    location=location,
                    is_archived=False,
                )

                db.add(project)
                existing_ids.add(public_id)

                created += 1

                # Commit periodically instead of keeping
                # all 5,000 objects in one transaction.
                if created % 500 == 0:
                    db.commit()
                    print(
                        f"Imported {created} projects..."
                    )

        db.commit()

        print()
        print("=" * 70)
        print("IMPORT COMPLETE")
        print("=" * 70)
        print(f"Created:              {created}")
        print(f"Skipped existing:     {skipped}")
        print(f"Missing coordinates:  {missing_coordinates}")
        print("=" * 70)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
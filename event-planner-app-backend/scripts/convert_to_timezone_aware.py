import logging
import os
import sys
from zoneinfo import ZoneInfo

from sqlalchemy import MetaData, Table, select, update
from src import create_app
from src.extensions import db

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UTC = ZoneInfo("UTC")


def convert_to_timezone_aware():
    app = create_app()

    with app.app_context():
        metadata = MetaData()

        events = Table("events", metadata, autoload_with=db.engine)
        itineraries = Table("itineraries", metadata, autoload_with=db.engine)

        stmt = select(
            events.c.id,
            events.c.start_at,
            events.c.end_at,
            itineraries.c.timezone,
        ).join(
            itineraries,
            events.c.itinerary_id == itineraries.c.id,
        )

        with db.engine.begin() as conn:
            rows = conn.execute(stmt).all()

            logger.info(f"Found {len(rows)} events.")

            success = 0
            failure = 0

            for row in rows:
                try:
                    if not row.timezone:
                        raise ValueError("Itinerary does not have a timezone")

                    timezone = ZoneInfo(row.timezone)

                    start_at = row.start_at
                    end_at = row.end_at

                    if start_at.tzinfo is None:
                        start_at = start_at.replace(tzinfo=timezone)

                    if end_at.tzinfo is None:
                        end_at = end_at.replace(tzinfo=timezone)

                    update_stmt = (
                        update(events)
                        .where(events.c.id == row.id)
                        .values(
                            start_at=start_at.astimezone(UTC),
                            end_at=end_at.astimezone(UTC),
                        )
                    )

                    conn.execute(update_stmt)
                    success += 1

                except Exception as exc:
                    failure += 1
                    logger.error(f"Failed to convert event {row.id}: {exc}")

            logger.info(f"Conversion complete: {success} successes, {failure} failures")


if __name__ == "__main__":
    logger.info("Starting timezone conversion...")
    convert_to_timezone_aware()
    logger.info("Timezone conversion finished.")

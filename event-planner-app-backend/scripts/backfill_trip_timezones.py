import logging
import os
import sys
from datetime import datetime

from sqlalchemy import select

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src import create_app
from src.extensions import db
from src.models import Itinerary
from src.services.timezone_service import get_timezone_for_coordinates

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def backfill_trip_timezones():
    """
    Backfill timezone for all trips that don't have one.
    """
    app = create_app()
    with app.app_context():
        stmt = select(Itinerary).where(Itinerary.timezone.is_(None))
        itineraries_without_timezone = db.session.execute(stmt).scalars().all()

        logger.info(
            f"Found {len(itineraries_without_timezone)} itineraries without timezone"
        )
        stmt = select(Itinerary)
        result = db.session.execute(stmt).scalars().all()
        logger.info(f"There are {len(result)} itineraries total")

        success_count = 0
        failure_count = 0

        for itinerary in itineraries_without_timezone:
            try:
                timestamp = None
                if itinerary.start_date:
                    timestamp = int(
                        datetime.combine(
                            itinerary.start_date, datetime.min.time()
                        ).timestamp()
                    )

                timezone = get_timezone_for_coordinates(
                    latitude=itinerary.latitude,
                    longitude=itinerary.longitude,
                    timestamp=timestamp,
                )

                itinerary.timezone = timezone
                db.session.commit()

                logger.info(
                    f"Set timezone {timezone} for itinerary {itinerary.id} {itinerary.name}"
                )
                success_count += 1

            except Exception as e:
                logger.error(
                    f"Failed to set timezone for itinerary {itinerary.id}: {e}"
                )

                failure_count += 1

        logger.info(
            f"Backfill complete: {success_count} successes, {failure_count} failures"
        )


if __name__ == "__main__":
    logger.info("Starting timezone backfill...")
    backfill_trip_timezones()
    logger.info("Timezone backfill finished")

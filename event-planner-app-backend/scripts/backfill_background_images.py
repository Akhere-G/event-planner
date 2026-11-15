"""Fill background images for trips and templates that have none.

Each destination costs two Unsplash requests (a search and a download ping), and
a demo Unsplash app allows 50 requests an hour, so use --limit to stay under it.
Destinations shared by several rows are looked up once. Rows whose destination
has no photo stay empty, so running the script again retries them.

Usage: python scripts/backfill_background_images.py [--dry-run] [--limit N]
"""

import argparse
import logging
import os
import sys

from sqlalchemy import select

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src import create_app
from src.extensions import db
from src.models import BackgroundImage, Itinerary, TripTemplate
from src.utils.unsplash_utils import find_destination_image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

IMAGE_MODELS: tuple[type[Itinerary] | type[TripTemplate], ...] = (
    Itinerary,
    TripTemplate,
)


class DestinationImages:
    """Unsplash lookups for one run: each destination once, at most `limit` in all."""

    def __init__(self, limit: int | None) -> None:
        self._limit = limit
        self._images: dict[str, BackgroundImage | None] = {}

    def has_budget_for(self, destination: str) -> bool:
        return (
            destination in self._images
            or self._limit is None
            or len(self._images) < self._limit
        )

    def get(self, destination: str) -> BackgroundImage | None:
        if destination not in self._images:
            self._images[destination] = find_destination_image(destination)
        return self._images[destination]


def backfill(
    model: type[Itinerary] | type[TripTemplate],
    images: DestinationImages,
    dry_run: bool,
) -> None:
    rows = db.session.execute(select(model).where(model.background_image_url.is_(None)))
    missing = rows.scalars().all()
    logger.info("%s: %d without a background image", model.__tablename__, len(missing))

    filled = 0
    for row in missing:
        if not images.has_budget_for(row.destination):
            logger.info("Lookup limit reached; run again later for the rest.")
            break
        image = images.get(row.destination)
        if image is None:
            logger.info(
                "No photo for %s %d %r", model.__tablename__, row.id, row.destination
            )
            continue
        filled += 1
        if not dry_run:
            row.background_image = image
            db.session.commit()

    logger.info("%s: filled %d of %d", model.__tablename__, filled, len(missing))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run", action="store_true", help="Look up photos without saving them."
    )
    parser.add_argument(
        "--limit", type=int, help="Most destinations to look up in this run."
    )
    args = parser.parse_args()

    images = DestinationImages(args.limit)
    app = create_app()
    with app.app_context():
        for model in IMAGE_MODELS:
            backfill(model, images, args.dry_run)


if __name__ == "__main__":
    main()

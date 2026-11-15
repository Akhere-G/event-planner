"""Fill image_url for events and accommodations that have none.

Each row costs a Places text search and a photo request. Rows whose place has no
photo stay empty, so running the script again retries them.

Usage: python scripts/backfill_place_images.py [--dry-run]
"""

import argparse
import logging
import os
import sys

from sqlalchemy import select

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src import create_app
from src.extensions import db
from src.models import Accommodation, Event
from src.utils.location_utils import find_place_photo_url

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PLACE_MODELS: tuple[type[Event] | type[Accommodation], ...] = (Event, Accommodation)


def backfill(model: type[Event] | type[Accommodation], dry_run: bool) -> None:
    rows = db.session.execute(select(model).where(model.image_url.is_(None)))
    missing = rows.scalars().all()
    logger.info("%s: %d without an image", model.__tablename__, len(missing))

    filled = 0
    for row in missing:
        image_url = find_place_photo_url(row.name, row.address)
        if not image_url:
            logger.info("No photo for %s %d %r", model.__tablename__, row.id, row.name)
            continue
        filled += 1
        if not dry_run:
            row.image_url = image_url
            db.session.commit()

    logger.info("%s: filled %d of %d", model.__tablename__, filled, len(missing))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run", action="store_true", help="Look up photos without saving them."
    )
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        for model in PLACE_MODELS:
            backfill(model, args.dry_run)


if __name__ == "__main__":
    main()

import logging
import sys

from dotenv import load_dotenv

load_dotenv()

from src import create_app
from src.calendar_sync.connections import google_client_for_user
from src.calendar_sync.scheduled import run_scheduled_sync

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("run_calendar_sync")


def main() -> None:
    logger.info("--- Starting run_calendar_sync.py ---")
    app = create_app()

    with app.app_context():
        try:
            run_scheduled_sync(google_client_for_user)
        except Exception as e:
            logger.exception(f"Error running calendar sync: {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()

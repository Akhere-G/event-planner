import logging
import sys
from dotenv import load_dotenv

load_dotenv()

from src import create_app
from src.services.notification_service import check_upcoming_event_reminders

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("run_reminders")


def main():
    logger.info("--- Starting run_reminders.py ---")
    app = create_app()

    with app.app_context():
        try:
            total = check_upcoming_event_reminders(minutes_ahead=30)
            logger.info(f"Successfully processed upcoming event reminders. Sent {total} push notification(s).")
        except Exception as e:
            logger.exception(f"Error running reminders: {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()

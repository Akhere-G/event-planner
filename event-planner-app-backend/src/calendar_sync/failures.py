import logging

from .client import GoogleAuthRevokedError
from .connections import forget_user

logger = logging.getLogger(__name__)


def handle_user_failure(user_id: int, exc: Exception) -> None:
    """Records a per-user sync failure so one account never blocks the others.

    A revoked grant means this user can no longer sync, so their connection is
    dropped and they can reconnect from Settings.
    """
    if isinstance(exc, GoogleAuthRevokedError):
        logger.warning("Google access revoked for user %s; disconnecting", user_id)
        forget_user(user_id)
        return
    logger.error("Calendar sync failed for user %s", user_id, exc_info=exc)

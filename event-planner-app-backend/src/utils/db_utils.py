from ..extensions import db


def release_connection():
    """End the current read transaction so a pooled connection is not held while
    waiting on a slow network call. Anything uncommitted is discarded, and loaded
    objects are expired, so copy out what you need first."""
    db.session.rollback()

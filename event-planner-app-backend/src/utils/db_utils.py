from ..extensions import db


def release_connection():
    """End the current read transaction so a pooled connection is not held while
    waiting on a slow network call.

    Call it only when nothing is pending: it commits. Loaded objects are expired,
    so copy out what you need first or expect a fresh read.
    """
    db.session.commit()

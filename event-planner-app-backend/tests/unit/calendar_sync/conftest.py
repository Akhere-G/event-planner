import pytest


@pytest.fixture(autouse=True)
def _calendar_sync_environment(calendar_settings, clean_calendar_tables):
    """Every calendar sync test is configured and leaves no sync rows behind."""

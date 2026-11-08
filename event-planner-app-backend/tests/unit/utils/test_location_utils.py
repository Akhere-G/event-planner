from unittest.mock import MagicMock, patch

import pytest
from marshmallow import ValidationError
from src.extensions import cache
from src.utils import location_utils

WEEK = [f"Day {n}: 9:00 AM - 5:00 PM" for n in range(7)]


@pytest.fixture
def gmaps(app):
    cache.clear()
    client = MagicMock()
    client.places.return_value = {"results": [{"place_id": "abc"}]}
    with patch.object(location_utils, "_gmaps", return_value=client):
        yield client
    cache.clear()


def test_opening_hours_are_returned_and_cached(gmaps):
    gmaps.place.return_value = {"result": {"opening_hours": {"weekday_text": WEEK}}}

    first = location_utils.get_weekly_opening_hours("Louvre", "Paris")
    second = location_utils.get_weekly_opening_hours("Louvre", "Paris")

    assert first == second == WEEK
    assert gmaps.place.call_count == 1


def test_a_place_without_hours_is_cached_as_unknown(gmaps):
    gmaps.place.return_value = {"result": {}}

    assert location_utils.get_weekly_opening_hours("Park", None) is None
    assert location_utils.get_weekly_opening_hours("Park", None) is None
    assert gmaps.place.call_count == 1


def test_lookup_failures_are_unknown_and_not_cached(gmaps):
    gmaps.places.side_effect = Exception("quota")

    assert location_utils.get_weekly_opening_hours("Louvre", "Paris") is None

    gmaps.places.side_effect = None
    gmaps.place.return_value = {"result": {"opening_hours": {"weekday_text": WEEK}}}
    assert location_utils.get_weekly_opening_hours("Louvre", "Paris") == WEEK


def test_place_details_return_coordinates_and_address(gmaps):
    gmaps.place.return_value = {
        "result": {
            "geometry": {"location": {"lat": 1.5, "lng": 2.5}},
            "formatted_address": "1 Rue, Paris",
        }
    }

    assert location_utils.get_place_details("Louvre") == {
        "latitude": 1.5,
        "longitude": 2.5,
        "formatted_address": "1 Rue, Paris",
    }


def test_unknown_place_is_a_validation_error(gmaps):
    gmaps.places.return_value = {"results": []}

    with pytest.raises(ValidationError):
        location_utils.get_place_details("Nowhere")

from unittest.mock import patch

from src.ai_entities.places import Place, PlaceResolver

LOOKUP = "src.ai_entities.places.get_place_details"
LOUVRE = Place(latitude=48.86, longitude=2.33, address="Rue de Rivoli, 75001 Paris")


def test_a_saved_address_is_reused_without_a_lookup():
    resolver = PlaceResolver([LOUVRE])

    with patch(LOOKUP) as lookup:
        place = resolver.resolve("The Louvre", "rue de  rivoli, 75001 PARIS")

    assert place == LOUVRE
    lookup.assert_not_called()


def test_an_unknown_address_is_looked_up():
    details = {"latitude": 1, "longitude": 2, "formatted_address": "1 Rue Cler, Paris"}

    with patch(LOOKUP, return_value=details) as lookup:
        place = PlaceResolver([LOUVRE]).resolve("Cafe", "1 Rue Cler", "lodging")

    assert place == {"latitude": 1.0, "longitude": 2.0, "address": "1 Rue Cler, Paris"}
    lookup.assert_called_once_with("Cafe", "1 Rue Cler", "lodging")


def test_a_place_that_cannot_be_found_is_none():
    with patch(LOOKUP, side_effect=RuntimeError("no such place")):
        assert PlaceResolver().resolve("Nowhere", None) is None

from src.services.airport_directory import get_airport_info, search_places


def test_get_airport_info():
    airport = get_airport_info("cdg")
    assert airport.code == "CDG"
    assert airport.timezone == "Europe/Paris"
    assert airport.address == "Paris, FR"


def test_get_airport_info_unknown():
    assert get_airport_info("ZZZ") is None


def test_search_groups_airports_by_city():
    place = search_places("paris")[0]
    assert {airport.code for airport in place.airports} >= {"CDG", "ORY"}


def test_search_prefers_places_near_coordinates():
    labels = [place.label for place in search_places("paris", lat=48.85, lng=2.35)]
    assert labels.index("Paris, FR") < labels.index("Paris, US")


def test_search_by_iata_code_returns_that_airport_first():
    [place, *_] = search_places("lhr")
    assert [airport.code for airport in place.airports] == ["LHR"]


def test_search_blank_query():
    assert search_places("  ") == []

import re
from collections import Counter
from pathlib import Path

import pytest
from src.services.template_seed_service import load_premade_templates

DATA_PATH = Path(__file__).parents[3] / "scripts" / "data" / "premade_templates.json"

EXPECTED_DAYS = {
    "bangkok-4-days-itinerary": 4,
    "tokyo-1-week-itinerary": 7,
    "seoul-5-days-itinerary": 5,
    "hanoi-4-days-itinerary": 4,
    "bali-1-week-itinerary": 7,
    "paris-4-days-itinerary": 4,
    "barcelona-4-days-itinerary": 4,
    "amsterdam-3-days-itinerary": 3,
    "new-york-1-week-itinerary": 7,
    "lisbon-4-days-itinerary": 4,
    "rome-5-days-itinerary": 5,
    "budapest-3-days-itinerary": 3,
    "prague-3-days-itinerary": 3,
}


@pytest.fixture(scope="module")
def templates():
    return load_premade_templates(DATA_PATH)


def test_every_destination_has_one_template(templates):
    durations = {}
    for template in templates:
        durations[template.slug] = template.duration_days

    assert durations == EXPECTED_DAYS


def test_every_template_has_a_cover_image_named_after_its_city(templates):
    for template in templates:
        city = re.sub(r"-(\d+-days|1-week)-itinerary$", "", template.slug)
        assert template.cover_image == f"/template-images/{city}.jpg"


def test_every_day_has_three_or_four_events(templates):
    for template in templates:
        per_day = Counter()
        for op in template.ops:
            if op["entity"] == "event":
                per_day[op["data"]["day_offset"]] += 1
        for day in range(template.duration_days):
            assert 3 <= per_day[day] <= 4, f"{template.slug} day {day + 1}"


def test_every_template_has_the_expected_extras(templates):
    for template in templates:
        entities = Counter()
        lists = Counter()
        for op in template.ops:
            entities[op["entity"]] += 1
            if op["entity"] == "wishlist_item":
                lists[op["data"]["wishlist_name"]] += 1
        assert 1 <= entities["accommodation"] <= 2, template.slug
        assert entities["packing_item"] >= 1, template.slug
        assert lists["Top restaurants"] >= 1, template.slug
        assert lists["Hidden gems"] >= 1, template.slug

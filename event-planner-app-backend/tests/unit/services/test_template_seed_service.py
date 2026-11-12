import json

import pytest
from marshmallow import ValidationError
from sqlalchemy import select
from src.extensions import db
from src.models import TripTemplate
from src.services.template_seed_service import (
    load_premade_templates,
    seed_premade_templates,
)

pytestmark = pytest.mark.usefixtures("clean_templates")


def premade(slug="paris-4-days-itinerary", **overrides):
    template = {
        "slug": slug,
        "title": "Paris in 4 days",
        "description": "A first visit to Paris.",
        "destination": "Paris, France",
        "region": "Europe",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "timezone": "Europe/Paris",
        "duration_days": 4,
        "cover_image": "/template-images/paris.jpg",
        "ops": [
            {
                "op": "create",
                "entity": "event",
                "data": {
                    "name": "Louvre",
                    "address": "Rue de Rivoli, 75001 Paris",
                    "latitude": 48.8606,
                    "longitude": 2.3376,
                    "category": "Culture",
                    "day_offset": 0,
                    "start_time": "09:30",
                    "end_day_offset": 0,
                    "end_time": "12:30",
                },
            }
        ],
    }
    return {**template, **overrides}


def write_templates(tmp_path, *templates):
    path = tmp_path / "templates.json"
    path.write_text(json.dumps(list(templates)))
    return path


def test_loads_valid_templates(tmp_path):
    loaded = load_premade_templates(write_templates(tmp_path, premade()))

    assert loaded[0].slug == "paris-4-days-itinerary"
    assert loaded[0].ops[0]["data"]["start_time"] == "09:30"


@pytest.mark.parametrize(
    "overrides",
    [
        {"slug": "Not A Slug"},
        {"region": "Atlantis"},
        {"timezone": "Mars/Olympus"},
        {"cover_image": "/elsewhere/paris.jpg"},
        {"duration_days": 0},
        {"ops": []},
    ],
)
def test_rejects_invalid_templates(tmp_path, overrides):
    with pytest.raises(ValidationError):
        load_premade_templates(write_templates(tmp_path, premade(**overrides)))


def test_rejects_ops_outside_the_trip_days(tmp_path):
    template = premade(duration_days=1)
    template["ops"][0]["data"]["day_offset"] = 1
    template["ops"][0]["data"]["end_day_offset"] = 1

    with pytest.raises(ValidationError, match="outside"):
        load_premade_templates(write_templates(tmp_path, template))


def test_rejects_duplicate_slugs_and_reports_every_bad_template(tmp_path):
    path = write_templates(
        tmp_path, premade(), premade(), premade("other", region="Atlantis")
    )

    with pytest.raises(ValidationError) as error:
        load_premade_templates(path)

    assert set(error.value.messages) == {"paris-4-days-itinerary", "other"}


def test_seeding_creates_public_templates_without_an_author(tmp_path):
    templates = load_premade_templates(write_templates(tmp_path, premade()))

    result = seed_premade_templates(templates)

    row = db.session.execute(select(TripTemplate)).scalar_one()
    assert (result.created, result.updated) == (1, 0)
    assert row.is_public is True
    assert (row.author_id, row.itinerary_id) == (None, None)
    assert row.cover_image == "/template-images/paris.jpg"


def test_reseeding_updates_in_place_and_keeps_clone_counts(tmp_path):
    seed_premade_templates(load_premade_templates(write_templates(tmp_path, premade())))
    row = db.session.execute(select(TripTemplate)).scalar_one()
    row.clone_count = 7
    db.session.commit()

    updated = premade(title="Paris, revised")
    result = seed_premade_templates(
        load_premade_templates(write_templates(tmp_path, updated))
    )

    rows = db.session.execute(select(TripTemplate)).scalars().all()
    assert (result.created, result.updated) == (0, 1)
    assert [(r.title, r.clone_count) for r in rows] == [("Paris, revised", 7)]

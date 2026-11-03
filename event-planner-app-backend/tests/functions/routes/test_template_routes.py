from datetime import date, datetime, timezone

import pytest
from sqlalchemy import delete, func, select, update
from src.extensions import db
from src.models import (
    Accommodation,
    Event,
    Itinerary,
    ItineraryUser,
    PackingItem,
    TripTemplate,
    Wishlist,
)
from tests.factories import UserFactory, WishlistFactory, WishlistItemFactory


def utc(*args):
    return datetime(*args, tzinfo=timezone.utc)


@pytest.fixture(autouse=True)
def clean_templates(app):
    """Route commits survive the per-test rollback, so clear templates around each test."""
    db.session.execute(delete(TripTemplate))
    db.session.flush()
    yield
    db.session.rollback()
    db.session.execute(delete(TripTemplate))
    db.session.commit()


@pytest.fixture
def trip(app, admin_user, itinerary, admin_itinerary_user):
    """Paris trip (UTC+2 in August) with one of everything, plus private data."""
    itinerary.start_date = date(2026, 8, 1)
    itinerary.end_date = date(2026, 8, 3)
    itinerary.timezone = "Europe/Paris"
    itinerary.anonymous_access_code = "SECRET-ANON-CODE"
    db.session.add_all(
        [
            Event(
                itinerary_id=itinerary.id,
                name="Louvre",
                address="Rue de Rivoli",
                latitude=48.86,
                longitude=2.33,
                category="Culture",
                start_at=utc(2026, 8, 2, 8, 0),  # 10:00 local, day 1
                end_at=utc(2026, 8, 2, 10, 30),
                created_by_id=admin_user.id,
                updated_by_id=admin_user.id,
            ),
            # Outside the trip dates: must be dropped.
            Event(
                itinerary_id=itinerary.id,
                name="Way too late",
                address="x",
                latitude=1,
                longitude=1,
                category="Other",
                start_at=utc(2026, 9, 2, 8, 0),
                end_at=utc(2026, 9, 2, 9, 0),
            ),
            Accommodation(
                itinerary_id=itinerary.id,
                name="Hotel Paris",
                address="1 Rue",
                latitude=48.8,
                longitude=2.3,
                start_date=date(2026, 8, 1),
                end_date=date(2026, 8, 3),
            ),
            PackingItem(
                itinerary_id=itinerary.id,
                name="Passport",
                category="Docs",
                is_shared=True,
            ),
            PackingItem(
                itinerary_id=itinerary.id,
                owner_id=admin_user.id,
                name="Private meds",
                category="Health",
                is_shared=False,
            ),
        ]
    )
    wishlist = WishlistFactory(itinerary=itinerary, creator=admin_user, name="Food")
    WishlistItemFactory(wishlist=wishlist, creator=admin_user, name="Croissants")
    db.session.flush()
    return itinerary


@pytest.fixture
def cloner_client(client, non_member_user, published):
    """A different logged-in user than the publisher (they share one test client)."""
    with client.session_transaction() as session:
        session["user_id"] = non_member_user.id
    return client


def publish(client, itinerary_id, body=None):
    return client.post(f"/api/itineraries/{itinerary_id}/publish", json=body or {})


@pytest.fixture
def published(admin_client, trip):
    response = publish(admin_client, trip.id, {"title": "Paris in 3 days"})
    assert response.status_code == 200
    return response.get_json()["data"]["slug"]


# ---- publish / unpublish -------------------------------------------------


def test_publish_builds_relative_snapshot(published, trip):
    template = db.session.execute(select(TripTemplate)).scalar_one()
    assert template.slug == published
    assert template.title == "Paris in 3 days"
    assert template.duration_days == 3
    assert template.timezone == "Europe/Paris"
    assert template.is_public is True

    by_entity = {}
    for op in template.ops:
        by_entity.setdefault(op["entity"], []).append(op["data"])

    assert len(by_entity["event"]) == 1
    louvre = by_entity["event"][0]
    assert louvre["day_offset"] == 1
    assert louvre["start_time"] == "10:00"
    assert louvre["end_day_offset"] == 1
    assert louvre["end_time"] == "12:30"
    assert by_entity["accommodation"][0]["start_day_offset"] == 0
    assert by_entity["accommodation"][0]["end_day_offset"] == 2
    assert [p["name"] for p in by_entity["packing_item"]] == ["Passport"]
    assert by_entity["wishlist_item"][0]["wishlist_name"] == "Food"


def test_republish_updates_same_template(admin_client, trip, published):
    db.session.add(
        PackingItem(itinerary_id=trip.id, name="Umbrella", category="Misc", is_shared=True)
    )
    db.session.flush()

    response = publish(admin_client, trip.id, {"description": "Updated"})

    assert response.status_code == 200
    assert response.get_json()["data"]["slug"] == published
    template = db.session.execute(select(TripTemplate)).scalar_one()
    assert template.description == "Updated"
    assert template.title == "Paris in 3 days"
    assert "Umbrella" in [op["data"].get("name") for op in template.ops]


@pytest.mark.parametrize("client_name", ["editor_client", "viewer_client"])
def test_publish_requires_admin(request, client_name, trip):
    client = request.getfixturevalue(client_name)
    assert publish(client, trip.id).status_code == 403
    assert db.session.execute(select(TripTemplate)).first() is None


def test_publish_non_member_and_logged_out(client, non_member_client, trip):
    assert publish(non_member_client, trip.id).status_code in (401, 404)
    with non_member_client.session_transaction() as s:
        s.clear()
    assert publish(non_member_client, trip.id).status_code in (401, 404)


def test_publish_empty_trip_is_rejected(admin_client, itinerary):
    assert publish(admin_client, itinerary.id).status_code == 400


def test_publish_rejects_invalid_title(admin_client, trip):
    assert publish(admin_client, trip.id, {"title": "x" * 300}).status_code == 400


def test_unpublish_hides_template(admin_client, client, trip, published):
    response = admin_client.delete(f"/api/itineraries/{trip.id}/publish")
    assert response.status_code == 200
    assert response.get_json()["data"]["isPublished"] is False

    assert client.get(f"/api/templates/{published}").status_code == 404
    assert client.get("/api/templates").get_json()["data"]["templates"] == []


def test_unpublish_requires_admin(trip, published, editor_client):
    assert editor_client.delete(f"/api/itineraries/{trip.id}/publish").status_code == 403


def test_publish_status(admin_client, trip, published):
    data = admin_client.get(f"/api/itineraries/{trip.id}/publish").get_json()["data"]
    assert data["isPublished"] is True
    assert data["slug"] == published


# ---- public reads --------------------------------------------------------


def test_public_list_and_detail_need_no_login(client, published):
    listing = client.get("/api/templates")
    assert listing.status_code == 200
    templates = listing.get_json()["data"]["templates"]
    assert [t["slug"] for t in templates] == [published]
    assert templates[0]["durationDays"] == 3
    assert templates[0]["eventCount"] == 1

    detail = client.get(f"/api/templates/{published}")
    assert detail.status_code == 200
    data = detail.get_json()["data"]
    assert len(data["days"]) == 3
    assert data["days"][1]["events"][0]["name"] == "Louvre"
    assert data["days"][1]["events"][0]["startTime"] == "10:00"
    assert [p["name"] for p in data["packingItems"]] == ["Passport"]
    assert data["wishlistItems"][0]["wishlistName"] == "Food"


def test_public_responses_do_not_leak_private_data(client, admin_user, trip, published):
    bodies = (
        client.get("/api/templates").get_data(as_text=True)
        + client.get(f"/api/templates/{published}").get_data(as_text=True)
    )
    assert admin_user.email not in bodies
    assert "SECRET-ANON-CODE" not in bodies
    assert "Private meds" not in bodies
    assert trip.admin_code not in bodies
    assert trip.editor_code not in bodies
    assert trip.viewer_code not in bodies
    for key in ("email", "members", "userMemberships", "authorId", "itineraryId"):
        assert key not in bodies
    assert admin_user.username in bodies  # author display name only


def test_get_unknown_template_404(client):
    assert client.get("/api/templates/nope").status_code == 404


def test_search_and_pagination(client, app, admin_user):
    for i, destination in enumerate(["Paris", "Rome", "Paris Texas", "Lisbon"]):
        db.session.add(
            TripTemplate(
                slug=f"t-{i}",
                title=f"Trip {i}",
                destination=destination,
                latitude=0,
                longitude=0,
                duration_days=2,
                ops=[],
                is_public=True,
                clone_count=i,
                author_id=admin_user.id,
            )
        )
    db.session.add(
        TripTemplate(
            slug="hidden",
            title="Hidden",
            destination="Paris",
            latitude=0,
            longitude=0,
            duration_days=1,
            ops=[],
            is_public=False,
            clone_count=0,
        )
    )
    db.session.flush()

    found = client.get("/api/templates?search=paris").get_json()["data"]
    assert sorted(t["slug"] for t in found["templates"]) == ["t-0", "t-2"]
    assert found["total"] == 2

    page1 = client.get("/api/templates?limit=3").get_json()["data"]
    assert len(page1["templates"]) == 3
    assert page1["hasMore"] is True
    page2 = client.get("/api/templates?limit=3&offset=3").get_json()["data"]
    assert len(page2["templates"]) == 1
    assert page2["hasMore"] is False

    assert client.get("/api/templates?search=%25").get_json()["data"]["total"] == 0
    assert client.get("/api/templates?limit=500").status_code == 400


# ---- clone ---------------------------------------------------------------


def clone(client, slug, start_date="2027-01-10"):
    return client.post(f"/api/templates/{slug}/clone", json={"startDate": start_date})


def test_clone_requires_login(client, published):
    with client.session_transaction() as session:
        session.clear()
    before = db.session.execute(select(func.count(Itinerary.id))).scalar()

    assert clone(client, published).status_code == 401

    assert db.session.execute(select(func.count(Itinerary.id))).scalar() == before


def test_clone_shifts_dates_and_converts_timezone(cloner_client, non_member_user, published):
    # Winter start: Paris is UTC+1, whereas the template was authored in summer (UTC+2).
    response = clone(cloner_client, published, "2027-01-10")

    assert response.status_code == 201
    new_id = response.get_json()["data"]["id"]
    new_trip = db.session.get(Itinerary, new_id)
    assert new_trip.start_date == date(2027, 1, 10)
    assert new_trip.end_date == date(2027, 1, 12)
    assert new_trip.timezone == "Europe/Paris"
    assert new_trip.destination == "Paris"
    assert new_trip.created_by_id == non_member_user.id

    membership = db.session.get(ItineraryUser, (new_id, non_member_user.id))
    assert membership.role == "admin"

    event = db.session.execute(select(Event).where(Event.itinerary_id == new_id)).scalar_one()
    # Day offset 1 at 10:00 Paris local -> 09:00 UTC in January.
    assert event.start_at.replace(tzinfo=None) == datetime(2027, 1, 11, 9, 0)
    assert event.end_at.replace(tzinfo=None) == datetime(2027, 1, 11, 11, 30)
    assert event.created_by_id == non_member_user.id

    stay = db.session.execute(
        select(Accommodation).where(Accommodation.itinerary_id == new_id)
    ).scalar_one()
    assert (stay.start_date, stay.end_date) == (date(2027, 1, 10), date(2027, 1, 12))

    packing = db.session.execute(
        select(PackingItem).where(PackingItem.itinerary_id == new_id)
    ).scalars().all()
    assert [p.name for p in packing] == ["Passport"]
    wishlist = db.session.execute(
        select(Wishlist).where(Wishlist.itinerary_id == new_id)
    ).scalar_one()
    assert wishlist.name == "Food"


def test_clone_increments_count_and_leaves_source_alone(
    cloner_client, trip, published
):
    clone(cloner_client, published)
    clone(cloner_client, published, "2027-02-01")

    template = db.session.execute(select(TripTemplate)).scalar_one()
    assert template.clone_count == 2
    assert db.session.execute(
        select(Event).where(Event.itinerary_id == trip.id)
    ).scalars().all()


def test_clone_does_not_copy_private_trip_data(cloner_client, admin_user, published):
    new_id = clone(cloner_client, published).get_json()["data"]["id"]
    members = db.session.execute(
        select(ItineraryUser).where(ItineraryUser.itinerary_id == new_id)
    ).scalars().all()
    assert len(members) == 1
    assert admin_user.id not in [m.user_id for m in members]
    assert not db.session.execute(
        select(PackingItem).where(
            PackingItem.itinerary_id == new_id, PackingItem.name == "Private meds"
        )
    ).first()


def test_clone_validates_start_date(cloner_client, published):
    assert cloner_client.post(
        f"/api/templates/{published}/clone", json={}
    ).status_code == 400
    assert clone(cloner_client, published, "not-a-date").status_code == 400


def test_clone_unknown_or_unpublished_template(cloner_client, published):
    assert clone(cloner_client, "nope").status_code == 404
    db.session.execute(update(TripTemplate).values(is_public=False))
    assert clone(cloner_client, published).status_code == 404


def test_clone_is_all_or_nothing(cloner_client, published, monkeypatch):
    from src.services import template_service

    def boom(*args, **kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(template_service, "apply_change_set", boom)
    before = db.session.execute(select(Itinerary.id)).all()
    with pytest.raises(RuntimeError):
        clone(cloner_client, published)
    db.session.rollback()
    assert db.session.execute(select(Itinerary.id)).all() == before
    assert db.session.execute(select(TripTemplate)).scalar_one().clone_count == 0

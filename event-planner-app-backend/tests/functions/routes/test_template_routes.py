from datetime import UTC, date, datetime

import pytest
from sqlalchemy import select
from src.extensions import db
from src.models import Event, PackingItem, TripTemplate
from src.services.template_service import publish_itinerary
from tests.factories import (
    EventFactory,
    ExpenseFactory,
    InviteFactory,
    ItineraryFactory,
    UserFactory,
    WishlistFactory,
    WishlistItemFactory,
)

pytestmark = pytest.mark.usefixtures("clean_templates")

FORBIDDEN_KEYS = (
    "email",
    "userId",
    "authorId",
    "createdById",
    "updatedById",
    "ownerId",
    "userMemberships",
    "members",
    "invites",
    "viewerCode",
    "editorCode",
    "adminCode",
    "anonymousAccessCode",
    "itineraryId",
    "expense",
    "flights",
)


def trip_event(itinerary, creator, **fields):
    return EventFactory(
        itinerary=itinerary,
        creator=creator,
        start_at=datetime(2026, 8, 1, 10, 0, tzinfo=UTC),
        end_at=datetime(2026, 8, 1, 12, 0, tzinfo=UTC),
        **fields,
    )


def publish_url(itinerary):
    return f"/api/itineraries/{itinerary.id}/publish"


def publish(client, itinerary, **body):
    return client.post(publish_url(itinerary), json={"region": "Europe", **body})


def published_template(itinerary, admin_user, **kwargs):
    trip_event(itinerary, admin_user)
    return publish_itinerary(
        itinerary.id,
        admin_user.id,
        kwargs.get("region", "Europe"),
        kwargs.get("title"),
        kwargs.get("description"),
    )


def anonymous_client(app):
    return app.test_client()


def test_admin_can_publish(admin_client, itinerary, admin_user):
    trip_event(itinerary, admin_user)

    response = publish(admin_client, itinerary, title="Paris weekend")

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["isPublished"] is True
    assert data["title"] == "Paris weekend"
    assert len(data["slug"]) == 32


@pytest.mark.parametrize("client_name", ["editor_client", "viewer_client"])
def test_only_admins_can_publish(client_name, itinerary, admin_user, request):
    client = request.getfixturevalue(client_name)
    trip_event(itinerary, admin_user)

    assert publish(client, itinerary).status_code == 403


def test_non_members_cannot_publish(client, itinerary, admin_user):
    trip_event(itinerary, admin_user)

    assert publish(client, itinerary).status_code == 401


def test_anonymous_access_codes_cannot_publish(client, admin_user):
    trip = ItineraryFactory(is_anonymous=True, anonymous_access_code="secret")
    trip_event(trip, admin_user)

    response = client.post(
        publish_url(trip),
        json={"region": "Europe"},
        headers={"X-Itinerary-Access-Code": "secret"},
    )

    assert response.status_code == 403


def test_publish_requires_a_valid_region(admin_client, itinerary, admin_user):
    trip_event(itinerary, admin_user)

    assert admin_client.post(publish_url(itinerary), json={}).status_code == 400
    assert (
        admin_client.post(publish_url(itinerary), json={"region": "Mars"}).status_code
        == 400
    )


def test_publishing_an_empty_trip_is_rejected(admin_client, itinerary):
    assert publish(admin_client, itinerary).status_code == 400


def test_admin_can_read_status_and_unpublish(admin_client, itinerary, admin_user):
    trip_event(itinerary, admin_user)
    assert admin_client.get(publish_url(itinerary)).get_json()["data"] == {
        "isPublished": False
    }
    publish(admin_client, itinerary)

    status = admin_client.get(publish_url(itinerary)).get_json()["data"]
    removed = admin_client.delete(publish_url(itinerary))

    assert status["isPublished"] is True
    assert removed.get_json()["data"]["isPublished"] is False


def test_public_can_browse_without_logging_in(app, itinerary, admin_user):
    template = published_template(itinerary, admin_user, title="Paris weekend")
    client = anonymous_client(app)

    listing = client.get("/api/templates")
    detail = client.get(f"/api/templates/{template.slug}")

    assert listing.status_code == 200
    body = listing.get_json()["data"]
    assert body["total"] == 1
    assert body["hasMore"] is False
    assert body["templates"][0]["slug"] == template.slug
    assert body["templates"][0]["eventCount"] == 1
    assert detail.status_code == 200
    assert detail.get_json()["data"]["days"][0]["events"][0]["startTime"] == "12:00"


def test_list_filters_by_region_and_search(app, itinerary, admin_user):
    published_template(itinerary, admin_user, title="Paris weekend")
    client = anonymous_client(app)

    assert client.get("/api/templates?regions=Asia").get_json()["data"]["total"] == 0
    assert (
        client.get("/api/templates?regions=Asia,Europe").get_json()["data"]["total"]
        == 1
    )
    assert client.get("/api/templates?search=weekend").get_json()["data"]["total"] == 1
    assert client.get("/api/templates?regions=Mars").status_code == 400
    assert client.get("/api/templates?limit=500").status_code == 400


def test_pins_list_every_match(app, itinerary, admin_user):
    template = published_template(itinerary, admin_user)

    pins = anonymous_client(app).get("/api/templates/pins").get_json()["data"]

    assert pins == [
        {
            "slug": template.slug,
            "title": template.title,
            "destination": template.destination,
            "region": "Europe",
            "latitude": template.latitude,
            "longitude": template.longitude,
        }
    ]


def test_unknown_and_unpublished_templates_are_not_found(
    admin_client, app, itinerary, admin_user
):
    template = published_template(itinerary, admin_user)
    admin_client.delete(publish_url(itinerary))
    client = anonymous_client(app)

    assert client.get(f"/api/templates/{template.slug}").status_code == 404
    assert client.get("/api/templates/nope").status_code == 404
    assert client.post(
        f"/api/templates/{template.slug}/clone", json={}
    ).status_code in (
        401,
        404,
    )


def test_public_responses_leak_nothing_private(app, itinerary, admin_user):
    member = UserFactory()
    event = trip_event(itinerary, admin_user)
    ExpenseFactory(event=event, creator=admin_user)
    InviteFactory(itinerary=itinerary, creator=admin_user, email="invitee@secret.test")
    wishlist = WishlistFactory(itinerary=itinerary, creator=admin_user, name="Gems")
    WishlistItemFactory(wishlist=wishlist, creator=admin_user, name="Hidden bar")
    db.session.add(
        PackingItem(
            itinerary_id=itinerary.id,
            name="Personal passport",
            category="Docs",
            is_shared=False,
            owner_id=member.id,
            created_by_id=member.id,
            updated_by_id=member.id,
        )
    )
    db.session.flush()
    db.session.refresh(itinerary)
    template = publish_itinerary(itinerary.id, admin_user.id, "Europe", None, None)
    client = anonymous_client(app)

    bodies = [
        client.get("/api/templates").get_data(as_text=True),
        client.get("/api/templates/pins").get_data(as_text=True),
        client.get(f"/api/templates/{template.slug}").get_data(as_text=True),
    ]

    for body in bodies:
        for key in FORBIDDEN_KEYS:
            assert f'"{key}"' not in body
        for secret in (
            admin_user.email,
            member.email,
            "invitee@secret.test",
            "Personal passport",
            itinerary.admin_code,
            itinerary.editor_code,
            itinerary.viewer_code,
        ):
            assert secret not in body
    assert "Hidden bar" in bodies[2]


def test_clone_requires_login(app, itinerary, admin_user):
    template = published_template(itinerary, admin_user)

    response = anonymous_client(app).post(
        f"/api/templates/{template.slug}/clone", json={"startDate": "2026-10-01"}
    )

    assert response.status_code == 401


def test_clone_creates_a_trip_for_the_user(auth_client, itinerary, admin_user):
    template = published_template(itinerary, admin_user)

    response = auth_client.post(
        f"/api/templates/{template.slug}/clone", json={"startDate": "2026-10-01"}
    )

    assert response.status_code == 201
    data = response.get_json()["data"]
    assert data["startDate"] == "2026-10-01"
    assert data["endDate"] == "2026-10-03"
    events = (
        db.session.execute(select(Event).where(Event.itinerary_id == data["id"]))
        .scalars()
        .all()
    )
    assert len(events) == 1
    assert events[0].start_at.replace(tzinfo=UTC) == datetime(
        2026, 10, 1, 10, 0, tzinfo=UTC
    )
    assert date.fromisoformat(data["startDate"]) == date(2026, 10, 1)
    assert db.session.get(TripTemplate, template.id).clone_count == 1


def test_clone_validates_the_start_date(auth_client, itinerary, admin_user):
    template = published_template(itinerary, admin_user)

    missing = auth_client.post(f"/api/templates/{template.slug}/clone", json={})
    invalid = auth_client.post(
        f"/api/templates/{template.slug}/clone", json={"startDate": "soon"}
    )

    assert missing.status_code == 400
    assert invalid.status_code == 400


def test_demo_users_cannot_clone(client, itinerary, admin_user):
    template = published_template(itinerary, admin_user)
    demo = UserFactory(is_demo=True)
    with client.session_transaction() as session:
        session["user_id"] = demo.id

    response = client.post(
        f"/api/templates/{template.slug}/clone", json={"startDate": "2026-10-01"}
    )

    assert response.status_code == 403

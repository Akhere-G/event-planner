from datetime import date, datetime

import factory
from src.extensions import db
from src.models import (
    Event,
    InvitationStatus,
    Invite,
    Itinerary,
    ItineraryUser,
    User,
    UserRole,
    Wishlist,
    WishlistItem,
    WishlistItemVote,
)


class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    password = "password123"


class ItineraryFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Itinerary
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"Trip {n}")
    destination = "Paris"
    latitude = 48.8566
    longitude = 2.3522
    description = "Sample trip"
    start_date = date(2026, 8, 1)
    end_date = date(2026, 8, 3)

    creator = factory.SubFactory(UserFactory)

    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)


class ItineraryUserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = ItineraryUser
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    role = UserRole.VIEWER.value
    itinerary = factory.SubFactory(ItineraryFactory)
    creator = factory.SubFactory(UserFactory)
    user = factory.SelfAttribute("creator")
    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)


class EventFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Event
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    itinerary = factory.SubFactory(ItineraryFactory)
    creator = factory.SubFactory(UserFactory)

    name = factory.Sequence(lambda n: f"Event {n}")
    address = "123 Test St"
    latitude = 40.7128
    longitude = -74.0060
    description = "Sample event"
    start_at = datetime(2026, 8, 20, 10, 0)
    end_at = datetime(2026, 8, 20, 12, 0)
    category = "food"

    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)


class InviteFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Invite
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    itinerary = factory.SubFactory(ItineraryFactory)
    creator = factory.SubFactory(UserFactory)
    inviter = factory.SelfAttribute("creator")

    email = factory.Sequence(lambda n: f"invite{n}@example.com")
    role = UserRole.VIEWER.value
    status = InvitationStatus.PENDING.value

    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)


class WishlistFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Wishlist
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    itinerary = factory.SubFactory(ItineraryFactory)
    name = factory.Sequence(lambda n: f"Wishlist {n}")

    creator = factory.SubFactory(UserFactory)

    itinerary_id = factory.LazyAttribute(lambda obj: obj.itinerary.id)
    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)


class WishlistItemFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = WishlistItem
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    wishlist = factory.SubFactory(WishlistFactory)
    creator = factory.SubFactory(UserFactory)

    name = factory.Sequence(lambda n: f"Wishlist Item {n}")
    address = "123 Food St"
    latitude = 40.7128
    longitude = -74.0060
    description = "Sample item"
    place_id = factory.Sequence(lambda n: f"place{n}")
    is_promoted = False

    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)


class WishlistItemVoteFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = WishlistItemVote
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    wishlist_item = factory.SubFactory(WishlistItemFactory)
    creator = factory.SubFactory(UserFactory)
    user = factory.SelfAttribute("creator")

    is_thumbs_up = True

    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)

from datetime import date, datetime, timezone
from decimal import Decimal

import factory
from src.extensions import bcrypt, db
from src.models import (
    AiTask,
    Airport,
    Event,
    Expense,
    ExpenseShare,
    Flight,
    InvitationStatus,
    Invite,
    Itinerary,
    ItineraryUser,
    Settlement,
    User,
    UserRole,
    Wishlist,
    WishlistItem,
    WishlistItemVote,
)

TEST_PASSWORD = "password123"
TEST_PASSWORD_HASH = bcrypt.generate_password_hash(TEST_PASSWORD).decode("utf-8")


class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    password = TEST_PASSWORD_HASH


class ItineraryFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Itinerary
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"Trip {n}")
    destination = "Paris"
    latitude = 48.8566
    longitude = 2.3522
    timezone = "Europe/Paris"
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
    start_at = datetime(2026, 8, 20, 10, 0, tzinfo=timezone.utc)
    end_at = datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc)
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
    inviter_id = factory.LazyAttribute(lambda obj: obj.creator.id)

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


class AirportFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Airport
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"
        sqlalchemy_get_or_create = ("code",)

    code = "LHR"
    name = "London Heathrow Airport"
    latitude = 51.4706
    longitude = -0.4619
    address = "London, GB"
    timezone = "Europe/London"


class FlightFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Flight
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    itinerary = factory.SubFactory(ItineraryFactory)
    creator = factory.SubFactory(UserFactory)

    airline = "BA"
    flight_number = factory.Sequence(lambda n: str(100 + n))
    departure_airport = factory.SubFactory(AirportFactory, code="LHR")
    arrival_airport = factory.SubFactory(
        AirportFactory,
        code="CDG",
        name="Charles de Gaulle International Airport",
        latitude=49.0128,
        longitude=2.55,
        address="Paris, FR",
        timezone="Europe/Paris",
    )
    depart_at = datetime(2026, 8, 1, 8, 0, tzinfo=timezone.utc)
    arrive_at = datetime(2026, 8, 1, 9, 20, tzinfo=timezone.utc)
    created_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.creator.id)


class ExpenseFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Expense
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    itinerary = factory.SubFactory(ItineraryFactory)
    paid_by = factory.SubFactory(UserFactory)

    description = "Cost"
    category = "other"
    amount = Decimal("30.00")
    currency = "GBP"
    amount_gbp = factory.SelfAttribute("amount")
    fx_rate = Decimal("1")
    spent_on = date(2026, 8, 1)
    split_type = "even_all"
    created_by_id = factory.LazyAttribute(lambda obj: obj.paid_by.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.paid_by.id)


class ExpenseShareFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = ExpenseShare
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    expense = factory.SubFactory(ExpenseFactory)
    user = factory.SubFactory(UserFactory)
    amount_gbp = Decimal("10.00")


class SettlementFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Settlement
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    itinerary_id = factory.LazyFunction(lambda: ItineraryFactory().id)
    from_user = factory.SubFactory(UserFactory)
    to_user = factory.SubFactory(UserFactory)
    amount_gbp = Decimal("10.00")
    settled_on = date(2026, 8, 2)
    created_by_id = factory.LazyAttribute(lambda obj: obj.from_user.id)
    updated_by_id = factory.LazyAttribute(lambda obj: obj.from_user.id)


class AiTaskFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = AiTask
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "flush"

    itinerary = factory.SubFactory(ItineraryFactory)
    type = "optimise_day"
    status = "queued"
    params = factory.LazyFunction(dict)
    attempts = 0
    max_attempts = 3

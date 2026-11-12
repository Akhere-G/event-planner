import pytest
from cryptography.fernet import Fernet
from flask.testing import FlaskClient
from sqlalchemy import delete
from sqlalchemy import event as sa_event

from src import create_app
from src.calendar_sync.jobs.dispatchers import (
    EXTENSION_KEY as CALENDAR_JOB_DISPATCHER_KEY,
)
from src.extensions import cache, db
from src.models import (
    CalendarConnection,
    CalendarLink,
    Event,
    ExchangeRate,
    Flight,
    Invite,
    Itinerary,
    ItineraryUser,
    TripCalendar,
    TripTemplate,
    User,
    UserRole,
    Wishlist,
    WishlistItem,
    WishlistItemVote,
)
from src.services import fx_service
from src.services.flight_providers import (
    FlightNumberProviderFactory,
    FlightProviderFactory,
)

from .factories import (
    EventFactory,
    FlightFactory,
    InviteFactory,
    ItineraryFactory,
    ItineraryUserFactory,
    UserFactory,
    WishlistFactory,
    WishlistItemFactory,
    WishlistItemVoteFactory,
)
from .fakes import (
    FakeFlightNumberProvider,
    FakeFlightProvider,
    FakeRateProvider,
    RecordingJobDispatcher,
)


def _let_sqlite_savepoints_roll_back(engine):
    """pysqlite starts transactions lazily, so a SAVEPOINT would commit the test's
    outer transaction. Begin explicitly so the per-test rollback still undoes it."""

    @sa_event.listens_for(engine, "connect")
    def _take_over_transactions(dbapi_connection, _record):
        dbapi_connection.isolation_level = None

    @sa_event.listens_for(engine, "begin")
    def _begin(connection):
        # In-memory SQLite shares one DBAPI connection between every checkout.
        if not connection.connection.dbapi_connection.in_transaction:
            connection.exec_driver_sql("BEGIN")


@pytest.fixture(scope="session")
def _db_setup():
    app = create_app(testing=True)

    with app.app_context():
        _let_sqlite_savepoints_roll_back(db.engine)
        db.create_all()
        db.session.execute(db.text("PRAGMA foreign_keys=ON"))

    yield app

    with app.app_context():
        db.drop_all()


@pytest.fixture
def flight_provider(monkeypatch, app) -> FakeFlightProvider:
    """Swap the registered flight providers for one fake and start with a cold cache."""
    provider = FakeFlightProvider()
    monkeypatch.setattr(FlightProviderFactory, "PROVIDERS", [lambda: provider])
    cache.clear()
    yield provider
    cache.clear()


@pytest.fixture
def flight_number_provider(monkeypatch, app) -> FakeFlightNumberProvider:
    """Swap the flight-number providers for one fake and start with a cold cache."""
    provider = FakeFlightNumberProvider()
    monkeypatch.setattr(FlightNumberProviderFactory, "PROVIDERS", [lambda: provider])
    cache.clear()
    yield provider
    cache.clear()


def _clear_rates():
    """Cached rates are committed by the services, which outlives a test's rollback."""
    cache.clear()
    db.session.execute(delete(ExchangeRate))
    db.session.commit()


@pytest.fixture
def rate_provider(monkeypatch, app) -> FakeRateProvider:
    """Swap the exchange rate provider for a fake and start with a cold cache."""
    provider = FakeRateProvider()
    monkeypatch.setattr(fx_service, "_provider", provider)
    _clear_rates()
    yield provider
    _clear_rates()


@pytest.fixture
def app(_db_setup):
    with _db_setup.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        db.session.bind = connection

        yield _db_setup

        db.session.rollback()
        transaction.rollback()
        db.session.remove()
        connection.close()


@pytest.fixture
def clean_templates(app):
    """Template services commit, which outlives the per-test rollback."""
    db.session.execute(delete(TripTemplate))
    db.session.commit()
    yield
    db.session.rollback()
    db.session.execute(delete(TripTemplate))
    db.session.commit()


@pytest.fixture
def calendar_settings(monkeypatch) -> dict[str, str]:
    values = {
        "GOOGLE_CALENDAR_CLIENT_ID": "client-id",
        "GOOGLE_CALENDAR_CLIENT_SECRET": "client-secret",
        "GOOGLE_CALENDAR_REDIRECT_URI": "https://app.example.com/callback",
        "GOOGLE_CALENDAR_WEBHOOK_URL": "https://app.example.com/webhook",
        "CALENDAR_TOKEN_ENCRYPTION_KEY": Fernet.generate_key().decode(),
        "FRONTEND_URL": "https://frontend.example.com",
    }
    for name, value in values.items():
        monkeypatch.setenv(name, value)
    return values


@pytest.fixture
def clean_calendar_tables(app):
    """Services commit, which outlives a test's rollback, so clear what they wrote."""
    yield
    for model in (CalendarLink, TripCalendar, CalendarConnection):
        db.session.execute(delete(model))
    db.session.commit()


@pytest.fixture
def queued_jobs(app) -> RecordingJobDispatcher:
    """Collects calendar sync jobs instead of running them against Google."""
    recorder = RecordingJobDispatcher()
    app.extensions[CALENDAR_JOB_DISPATCHER_KEY] = recorder
    yield recorder
    app.extensions.pop(CALENDAR_JOB_DISPATCHER_KEY)


@pytest.fixture
def client(app) -> FlaskClient:
    return app.test_client()


@pytest.fixture
def auth_client(client, admin_user) -> FlaskClient:
    with client.session_transaction() as session:
        session["user_id"] = admin_user.id

    return client


@pytest.fixture
def admin_user(app) -> User:
    return UserFactory()


@pytest.fixture
def itinerary(app, admin_user) -> Itinerary:
    return ItineraryFactory(creator=admin_user)


@pytest.fixture
def admin_itinerary_user(app, admin_user, itinerary) -> ItineraryUser:
    return ItineraryUserFactory(
        user=admin_user,
        itinerary=itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )


@pytest.fixture
def editor_user(app) -> User:
    return UserFactory()


@pytest.fixture
def editor_itinerary_user(app, editor_user, itinerary, admin_user) -> ItineraryUser:
    return ItineraryUserFactory(
        user=editor_user,
        itinerary=itinerary,
        role=UserRole.EDITOR.value,
        creator=admin_user,
    )


@pytest.fixture
def viewer_user(app) -> User:
    return UserFactory()


@pytest.fixture
def viewer_itinerary_user(app, viewer_user, itinerary, admin_user) -> ItineraryUser:
    return ItineraryUserFactory(
        user=viewer_user,
        itinerary=itinerary,
        role=UserRole.VIEWER.value,
        creator=admin_user,
    )


@pytest.fixture
def admin_client(client, admin_user, admin_itinerary_user) -> FlaskClient:
    with client.session_transaction() as session:
        session["user_id"] = admin_user.id
    return client


@pytest.fixture
def editor_client(client, editor_user, editor_itinerary_user) -> FlaskClient:
    with client.session_transaction() as session:
        session["user_id"] = editor_user.id
    return client


@pytest.fixture
def viewer_client(client, viewer_user, viewer_itinerary_user) -> FlaskClient:
    with client.session_transaction() as session:
        session["user_id"] = viewer_user.id
    return client


@pytest.fixture
def event(app, admin_user, itinerary, admin_itinerary_user) -> Event:
    event = EventFactory(
        itinerary=itinerary,
        creator=admin_user,
    )
    return event


@pytest.fixture
def invited_user(app, itinerary) -> User:
    return UserFactory()


@pytest.fixture
def invited_user_client(client, invited_user) -> FlaskClient:
    with client.session_transaction() as session:
        session["user_id"] = invited_user.id

    return client


@pytest.fixture
def invite(app, admin_user, itinerary, admin_itinerary_user, invited_user) -> Invite:
    return InviteFactory(
        itinerary=itinerary, creator=admin_user, email=invited_user.email
    )


@pytest.fixture
def wishlist(app, admin_user, itinerary, admin_itinerary_user) -> Wishlist:
    return WishlistFactory(
        itinerary=itinerary,
        creator=admin_user,
    )


@pytest.fixture
def wishlist_item(app, admin_user, wishlist) -> WishlistItem:
    return WishlistItemFactory(
        wishlist=wishlist,
        creator=admin_user,
    )


@pytest.fixture
def wishlist_item_vote(app, admin_user, wishlist_item) -> WishlistItemVote:
    return WishlistItemVoteFactory(
        wishlist_item=wishlist_item,
        user=admin_user,
        creator=admin_user,
    )


@pytest.fixture
def non_member_user(app) -> User:
    return UserFactory()


@pytest.fixture
def non_member_client(client, non_member_user) -> FlaskClient:
    with client.session_transaction() as session:
        session["user_id"] = non_member_user.id
    return client


@pytest.fixture
def flight(app, admin_user, itinerary, admin_itinerary_user) -> Flight:
    return FlightFactory(itinerary=itinerary, creator=admin_user)

import pytest
from flask.testing import FlaskClient
from src import create_app
from src.extensions import db
from src.models import (
    Event,
    Invite,
    Itinerary,
    ItineraryUser,
    User,
    UserRole,
    Wishlist,
    WishlistItem,
    WishlistItemVote,
)

from .factories import (
    EventFactory,
    InviteFactory,
    ItineraryFactory,
    ItineraryUserFactory,
    UserFactory,
    WishlistFactory,
    WishlistItemFactory,
    WishlistItemVoteFactory,
)


@pytest.fixture(scope="session")
def _db_setup():
    app = create_app(testing=True)

    with app.app_context():
        db.create_all()
        db.session.execute(db.text("PRAGMA foreign_keys=ON"))

    yield app

    with app.app_context():
        db.drop_all()


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

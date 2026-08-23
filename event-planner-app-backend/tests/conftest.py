import pytest
from src import create_app
from src.extensions import db
from src.models import UserRole

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


@pytest.fixture(autouse=True)
def reset_factory_sequences():
    UserFactory.reset_sequence()
    ItineraryFactory.reset_sequence()
    ItineraryUserFactory.reset_sequence()
    EventFactory.reset_sequence()
    InviteFactory.reset_sequence()
    WishlistFactory.reset_sequence()
    WishlistItemFactory.reset_sequence()
    WishlistItemVoteFactory.reset_sequence()


@pytest.fixture()
def _db_setup():
    app = create_app(testing=True)
    with app.app_context():
        db.create_all()
        db.session.execute(db.text("PRAGMA foreign_keys=ON"))
        yield app
        db.drop_all()


@pytest.fixture
def app(_db_setup):
    connection = db.engine.connect()
    transaction = connection.begin()
    db.session.bind = connection
    yield _db_setup
    db.session.rollback()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def user(app):
    return UserFactory()


@pytest.fixture
def auth_client(client, user):
    with client.session_transaction() as session:
        session["user_id"] = user.id

    return client


@pytest.fixture
def admin_user(app):
    return UserFactory()


@pytest.fixture
def admin_itinerary(app, admin_user):
    return ItineraryFactory(creator=admin_user)


@pytest.fixture
def admin_itinerary_user(app, admin_user, admin_itinerary):
    return ItineraryUserFactory(
        user=admin_user,
        itinerary=admin_itinerary,
        role=UserRole.ADMIN.value,
        creator=admin_user,
    )


@pytest.fixture
def editor_user(app):
    return UserFactory()


@pytest.fixture
def editor_itinerary_user(app, editor_user, admin_itinerary, admin_user):
    return ItineraryUserFactory(
        user=editor_user,
        itinerary=admin_itinerary,
        role=UserRole.EDITOR.value,
        creator=admin_user,
    )


@pytest.fixture
def viewer_user(app):
    return UserFactory()


@pytest.fixture
def viewer_itinerary_user(app, viewer_user, admin_itinerary, admin_user):
    return ItineraryUserFactory(
        user=viewer_user,
        itinerary=admin_itinerary,
        role=UserRole.VIEWER.value,
        creator=admin_user,
    )


@pytest.fixture
def admin_client(client, admin_user, admin_itinerary_user):
    with client.session_transaction() as session:
        session["user_id"] = admin_user.id
    return client


@pytest.fixture
def editor_client(client, editor_user, editor_itinerary_user):
    with client.session_transaction() as session:
        session["user_id"] = editor_user.id
    return client


@pytest.fixture
def viewer_client(client, viewer_user, viewer_itinerary_user):
    with client.session_transaction() as session:
        session["user_id"] = viewer_user.id
    return client


@pytest.fixture
def admin_event(app, admin_user, admin_itinerary, admin_itinerary_user):
    event = EventFactory(
        itinerary=admin_itinerary,
        creator=admin_user,
    )
    return event


@pytest.fixture
def itinerary(app, admin_user):
    itinerary = ItineraryFactory(creator=admin_user)
    return itinerary


@pytest.fixture
def itinerary_user(app, admin_user, admin_itinerary):
    itinerary_user = ItineraryUserFactory(user=admin_user, itinerary=admin_itinerary, creator=admin_user)
    return itinerary_user


@pytest.fixture
def event(app, admin_user, admin_itinerary, admin_itinerary_user):
    event = EventFactory(
        itinerary=admin_itinerary,
        creator=admin_user,
    )
    return event


@pytest.fixture
def invited_user(app, admin_itinerary):
    return UserFactory()


@pytest.fixture
def invited_user_client(client, invited_user):
    with client.session_transaction() as session:
        session["user_id"] = invited_user.id

    return client


@pytest.fixture
def invite(app, admin_user, admin_itinerary, admin_itinerary_user):
    return InviteFactory(itinerary=admin_itinerary, creator=admin_user, email="invited@example.com")


@pytest.fixture
def wishlist(app, admin_user, admin_itinerary, admin_itinerary_user):
    return WishlistFactory(
        itinerary=admin_itinerary,
        creator=admin_user,
    )


@pytest.fixture
def wishlist_item(app, admin_user, wishlist):
    return WishlistItemFactory(
        wishlist=wishlist,
        creator=admin_user,
    )


@pytest.fixture
def wishlist_item_vote(app, user, wishlist_item):
    return WishlistItemVoteFactory(
        wishlist_item=wishlist_item,
        user=user,
        creator=user,
    )


@pytest.fixture
def non_member_user(app):
    return UserFactory()


@pytest.fixture
def non_member_client(client, non_member_user):
    with client.session_transaction() as session:
        session["user_id"] = non_member_user.id
    return client

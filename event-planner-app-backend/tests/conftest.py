import pytest
from src import create_app
from src.extensions import db

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
def itinerary(app, user):
    itinerary = ItineraryFactory(creator=user)
    return itinerary


@pytest.fixture
def itinerary_user(app, user, itinerary):
    itinerary_user = ItineraryUserFactory(user=user, itinerary=itinerary, creator=user)
    return itinerary_user


@pytest.fixture
def event(app, user, itinerary, itinerary_user):
    event = EventFactory(
        itinerary=itinerary,
        creator=user,
    )
    return event


@pytest.fixture
def uninvited_user(app, itinerary_user):
    return UserFactory()


@pytest.fixture
def invite(app, user, itinerary, itinerary_user, uninvited_user):
    return InviteFactory(itinerary=itinerary, creator=user, email=uninvited_user.email)


@pytest.fixture
def wishlist(app, user, itinerary, itinerary_user):
    return WishlistFactory(
        itinerary=itinerary,
        creator=user,
    )


@pytest.fixture
def wishlist_item(app, user, wishlist):
    return WishlistItemFactory(
        wishlist=wishlist,
        creator=user,
    )


@pytest.fixture
def wishlist_item_vote(app, user, wishlist_item):
    return WishlistItemVoteFactory(
        wishlist_item=wishlist_item,
        user=user,
        creator=user,
    )

import pytest
from src import create_app
from src.extensions import db

from .factories import EventFactory, ItineraryFactory, ItineraryUserFactory, UserFactory


@pytest.fixture(scope="session")
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
def event(app, user, itinerary):
    event = EventFactory(
        itinerary=itinerary,
        creator=user,
    )
    return event

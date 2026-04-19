from ..extensions import db
from .. import create_app


def create_database(app):
    with app.app_context():
        db.create_all()


def drop_database(app):
    with app.app_context():
        db.drop_all()


def reset_database(app):
    with app.app_context():
        db.drop_all()
        db.create_all()


if __name__ == "__main__":
    app = create_app()
    print("Initialising database...")
    create_database(app)
    print("Database initialised successfully.")

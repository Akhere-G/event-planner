from ..extensions import db


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

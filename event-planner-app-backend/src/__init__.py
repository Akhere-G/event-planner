import os
from flask import Flask
from dotenv import load_dotenv
from .extensions import db, migrate, flask_bcrypt
from .config.config import Config


load_dotenv()


def create_app(config_class=None):
    app = Flask(__name__)

    if config_class is None:
        config_obj = Config().dev_config
    else:
        config_obj = config_class

    app.config.from_mapping(
        ENV=config_obj.ENV,
        DEBUG=config_obj.DEBUG,
        SQLALCHEMY_DATABASE_URI=os.environ.get("SQLALCHEMY_DATABASE_URI"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        ALEMBIC_CONTEXT={"render_as_batch": True},
    )
    app.secret_key = os.environ.get("FLASK_SECRET_KEY")

    basedir = os.path.abspath(os.path.dirname(app.root_path))
    migrations_path = os.path.join(basedir, "migrations")
    db.init_app(app)
    migrate.init_app(app, db, directory=migrations_path)
    flask_bcrypt.init_app(app)

    with app.app_context():
        from .routes import auth_bp, itinerary_bp, event_bp, user_bp, invite_bp

        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        app.register_blueprint(itinerary_bp, url_prefix="/api/itineraries")
        app.register_blueprint(
            event_bp, url_prefix="/api/itineraries/<int:itinerary_id>/events"
        )
        app.register_blueprint(
            user_bp, url_prefix="/api/itineraries/<int:itinerary_id>/users"
        )

        app.register_blueprint(
            invite_bp, url_prefix="/api/itineraries/<int:itinerary_id>/invites"
        )

        return app

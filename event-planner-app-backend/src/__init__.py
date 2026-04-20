import os
from flask import Flask
from dotenv import load_dotenv
from .extensions import db, migrate, flask_bcrypt
from flask_cors import CORS
from .config.dev_config import DevConfig
from .config.production_config import ProductionConfig
from flask import send_from_directory


load_dotenv()


def create_app():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_path = os.path.join(current_dir, "..", "static")
    app = Flask(__name__, static_folder=static_path, static_url_path="/")

    CORS(
        app,
        supports_credentials=True,
        origins=[os.environ.get("FRONTEND_URL")],
    )

    if os.environ.get("ENVIRONMENT") == "DEV":
        app.config.from_object(DevConfig())
    else:
        app.config.from_object(ProductionConfig())

    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    instance_dir = os.path.join(basedir, "instance")
    db_path = os.path.join(instance_dir, "database.db")

    os.makedirs(instance_dir, exist_ok=True)

    app.config.from_mapping(
        DEBUG=os.getenv("FLASK_DEBUG") == "True",
        SQLALCHEMY_DATABASE_URI=f"sqlite:////{db_path}",
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
        from .models import (
            User,
            Itinerary,
            ItineraryUser,
            ItineraryEvent,
            UserRole,
            Event,
            Invite,
            InvitationStatus,
        )
        from .routes import (
            auth_bp,
            itinerary_bp,
            event_bp,
            user_bp,
            itinerary_invites_bp,
            user_invites_bp,
        )

        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        app.register_blueprint(itinerary_bp, url_prefix="/api/itineraries")
        app.register_blueprint(
            event_bp, url_prefix="/api/itineraries/<int:itinerary_id>/events"
        )
        app.register_blueprint(
            user_bp, url_prefix="/api/itineraries/<int:itinerary_id>/users"
        )

        app.register_blueprint(
            itinerary_invites_bp,
            url_prefix="/api/itineraries/<int:itinerary_id>/invites",
        )

        app.register_blueprint(
            user_invites_bp,
            url_prefix="/api/invites",
        )

        @app.route("/")
        def serve():
            return send_from_directory(app.static_folder, "index.html")

        @app.errorhandler(404)
        def not_found(e):
            return send_from_directory(app.static_folder, "index.html")

        return app

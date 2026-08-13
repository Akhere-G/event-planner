import os

import pymysql
from dotenv import load_dotenv
from flask import Flask, jsonify, make_response, send_from_directory
from flask_cors import CORS

from .config.dev_config import DevConfig
from .config.production_config import ProductionConfig
from .extensions import bcrypt, db, limiter, migrate

pymysql.install_as_MySQLdb()
load_dotenv()


def create_app():
    app = Flask(
        __name__,
        static_folder="../static",
        static_url_path="/",
    )

    configure_app(app)
    initialise_extensions(app)
    register_models()
    register_blueprints(app)
    register_error_handlers(app)
    register_frontend(app)

    return app


def configure_app(app: Flask):
    environment = os.getenv("ENVIRONMENT", "PROD")
    database_url = os.getenv("DATABASE_URL")

    if environment == "DEV":
        app.config.from_object(DevConfig())
    else:
        app.config.from_object(ProductionConfig())

    engine_options = {}

    if environment != "DEV":
        cert_path = os.getenv(
            "DB_CA_CERT_PATH",
            "/app/certs/ca.pem",
        )

        engine_options = {
            "connect_args": {
                "ssl": {
                    "ca": cert_path,
                }
            }
        }

    app.config.from_mapping(
        DEBUG=os.getenv("FLASK_DEBUG") == "True",
        SQLALCHEMY_DATABASE_URI=database_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS=engine_options,
        ALEMBIC_CONTEXT={
            "render_as_batch": True,
        },
        SECRET_KEY=os.getenv("FLASK_SECRET_KEY"),
    )

    CORS(
        app,
        supports_credentials=True,
        origins=[
            os.getenv("FRONTEND_URL"),
        ],
    )


def initialise_extensions(app: Flask):
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    limiter.init_app(app)


def register_models():
    from .models import (
        Accommodation,
        Event,
        InvitationStatus,
        Invite,
        Itinerary,
        ItineraryEvent,
        ItineraryUser,
        PackingItem,
        User,
        UserRole,
        Wishlist,
        WishlistItem,
        WishlistItemVote,
    )


def register_blueprints(app: Flask):
    from .routes import (
        accommodation_bp,
        ai_bp,
        auth_bp,
        event_bp,
        itinerary_bp,
        itinerary_invites_bp,
        packing_item_bp,
        user_bp,
        user_invites_bp,
        wishlist_bp,
    )

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth",
    )

    app.register_blueprint(
        itinerary_bp,
        url_prefix="/api/itineraries",
    )

    app.register_blueprint(
        event_bp,
        url_prefix="/api/itineraries/<int:itinerary_id>/events",
    )

    app.register_blueprint(
        user_bp,
        url_prefix="/api/itineraries/<int:itinerary_id>/users",
    )

    app.register_blueprint(
        itinerary_invites_bp,
        url_prefix="/api/itineraries/<int:itinerary_id>/invites",
    )

    app.register_blueprint(
        user_invites_bp,
        url_prefix="/api/invites",
    )

    app.register_blueprint(
        wishlist_bp,
        url_prefix="/api/itineraries/<int:itinerary_id>/wishlists",
    )

    app.register_blueprint(
        accommodation_bp,
        url_prefix="/api/itineraries/<int:itinerary_id>/accommodations",
    )

    app.register_blueprint(
        ai_bp,
        url_prefix="/api/ai",
    )

    app.register_blueprint(
        packing_item_bp,
        url_prefix="/api/itineraries/<int:itinerary_id>/packing_items",
    )


def register_frontend(app: Flask):
    @app.route("/")
    def serve_frontend():
        return send_from_directory(
            app.static_folder,
            "index.html",
        )


def register_error_handlers(app: Flask):
    @app.errorhandler(404)
    def not_found(error):
        return send_from_directory(
            app.static_folder,
            "index.html",
        )

    @app.errorhandler(429)
    def ratelimit_handler(error):
        return make_response(
            jsonify(error=f"Rate limit exceeded: {error.description}"),
            429,
        )

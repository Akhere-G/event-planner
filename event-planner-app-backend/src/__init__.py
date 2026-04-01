import os
from flask import Flask
from dotenv import load_dotenv
from .extensions import db, alembic
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

    db.init_app(app)
    alembic.init_app(app)

    with app.app_context():
        from .routes.auth import auth_bp

        app.register_blueprint(auth_bp, url_prefix="/api/auth")

        return app

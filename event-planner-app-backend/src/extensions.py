from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

load_dotenv()


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
migrate = Migrate(render_as_batch=True)

flask_bcrypt = Bcrypt()

limiter = Limiter(
    get_remote_address,
    default_limits=["200 per day", "60 per hour"],
    storage_uri=os.getenv("STORAGE_URI"),
)

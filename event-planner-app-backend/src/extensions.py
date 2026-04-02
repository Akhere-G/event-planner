from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_alembic import Alembic
from flask_bcrypt import Bcrypt


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
alembic = Alembic(metadatas=Base.metadata)
flask_bcrypt = Bcrypt()

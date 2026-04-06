from ..extensions import flask_bcrypt
from ..models import User
from ..extensions import db
from ..exceptions import (
    UserAlreadyExistsError,
    UserDoesNotExistError,
    InvalidCredentialsError,
)
from sqlalchemy import select


def register_user(username: str, email: str, password: str):
    session = db.session
    password_hash = flask_bcrypt.generate_password_hash(password).decode("utf-8")
    stmt = select(User).where(User.email == email)
    user = session.execute(stmt).scalar_one_or_none()

    if user:
        raise UserAlreadyExistsError()
    new_user = User(username=username, email=email, password=password_hash)
    session.add(new_user)
    session.commit()
    return new_user.id


def login_user(email: str, password: str):
    session = db.session
    stmt = select(User).where(User.email == email)
    user = session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError()
    if flask_bcrypt.check_password_hash(user.password, password):
        return user.id
    else:
        raise InvalidCredentialsError()

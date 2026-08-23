from ..extensions import bcrypt
from ..models import User
from ..extensions import db
from ..exceptions import (
    UserAlreadyExistsError,
    UserDoesNotExistError,
    InvalidCredentialsError,
)
from sqlalchemy import select


def register_user(username: str, email: str, password: str):
    email = email.strip().lower()

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    stmt = select(User).where(User.email == email)
    user = db.session.execute(stmt).scalar_one_or_none()

    if user:
        raise UserAlreadyExistsError()
    new_user = User(username=username, email=email, password=password_hash)
    db.session.add(new_user)
    db.session.commit()
    return new_user.id


def login_user(email: str, password: str):
    email = email.strip().lower()

    session = db.session
    stmt = select(User).where(User.email == email)
    user = session.execute(stmt).scalar_one_or_none()

    if not user:
        raise InvalidCredentialsError()
    if bcrypt.check_password_hash(user.password, password):
        return user.id
    else:
        raise InvalidCredentialsError()

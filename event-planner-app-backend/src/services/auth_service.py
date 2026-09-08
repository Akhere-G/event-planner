from sqlalchemy import select

from ..exceptions import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from ..extensions import bcrypt, db
from ..models import User


def get_user(user_id: str | None):
    if not user_id:
        return None
    stmt = select(User).where(User.id == user_id)
    return db.session.execute(stmt).scalar_one_or_none()


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
    return {"id": new_user.id, "email": new_user.email, "username": new_user.username}


def login_user(email: str, password: str):
    email = email.strip().lower()

    session = db.session
    stmt = select(User).where(User.email == email)
    user = session.execute(stmt).scalar_one_or_none()

    if not user:
        raise InvalidCredentialsError()
    if bcrypt.check_password_hash(user.password, password):
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }
    else:
        raise InvalidCredentialsError()

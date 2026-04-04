from ..extensions import db
from ..models import User
from sqlalchemy import select
from ..exceptions import UserDoesNotExistError
from sqlalchemy.orm import selectinload


def get_itineraries(user_id: int):
    stmt = (
        select(User).where(User.id == user_id).options(selectinload(User.itineraries))
    )
    user = db.session.execute(stmt).scalar_one_or_none()

    if not user:
        raise UserDoesNotExistError

    return user.itineraries

import secrets
from dataclasses import dataclass
from functools import wraps

from flask import request, session
from sqlalchemy import select

from ..exceptions import (
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
)
from ..extensions import db
from ..models import Itinerary, ItineraryUser, UserRole


@dataclass
class ItineraryAccess:
    itinerary_id: int
    user_id: int | None
    role: str
    is_anonymous: bool
    anonymous_access_code: str | None


def itinerary_access_required(
    allowed_roles=None,
    message="You are not authorised to complete this action.",
):
    allowed_roles = allowed_roles or [UserRole.ADMIN]

    def decorator(f):
        @wraps(f)
        def decorated_func(*args, **kwargs):
            itinerary_id = kwargs.get("itinerary_id")

            if itinerary_id is None:
                raise ValueError("itinerary_access_required requires itinerary_id.")

            stmt = select(Itinerary).where(Itinerary.id == itinerary_id)
            itinerary = db.session.execute(stmt).scalar_one_or_none()

            if itinerary is None:
                raise ItineraryDoesNotExistError()

            user_id = session.get("user_id")

            if user_id is not None:
                stmt = select(ItineraryUser).where(
                    ItineraryUser.user_id == user_id,
                    ItineraryUser.itinerary_id == itinerary_id,
                )

                membership = db.session.execute(stmt).scalar_one_or_none()

                if membership:
                    if not UserRole.has_value(membership.role, allowed_roles):
                        raise UserNotAuthorisedError(message)

                    kwargs["access"] = ItineraryAccess(
                        itinerary_id=itinerary_id,
                        user_id=user_id,
                        role=membership.role,  # type: ignore
                        is_anonymous=False,
                        anonymous_access_code=None,
                    )

                    return f(*args, **kwargs)

            access_code = request.headers.get("X-Itinerary-Access-Code")

            if (
                itinerary.is_anonymous
                and access_code
                and secrets.compare_digest(
                    access_code,
                    itinerary.anonymous_access_code or "",
                )
            ):
                kwargs["access"] = ItineraryAccess(
                    itinerary_id=itinerary_id,
                    user_id=None,
                    role=UserRole.ADMIN.value,
                    is_anonymous=True,
                    anonymous_access_code=access_code,
                )

                return f(*args, **kwargs)

            raise ItineraryDoesNotExistError()

        return decorated_func

    return decorator

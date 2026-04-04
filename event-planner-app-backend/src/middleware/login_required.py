from functools import wraps
from flask import session
from ..utils.format_response import api_response


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return api_response(
                message="Not authorised. Please login",
                success=False,
                error="Not authorised. Please login",
                status_code=401,
            )

        kwargs["user_id"] = user_id
        return f(*args, **kwargs)

    return decorated_function

class AppError(Exception):
    status_code = 500
    default_message = "An unexpected error occurred."

    def __init__(self, message: str | None = None):
        self.message = message or self.default_message
        super().__init__(self.message)


class UserAlreadyExistsError(AppError):
    status_code = 409
    default_message = "A user with this email already exists."


class UserDoesNotExistError(AppError):
    status_code = 404
    default_message = "No user exists with this email."


class InvalidCredentialsError(AppError):
    status_code = 401
    default_message = "Invalid credentials."


class ItineraryDoesNotExistError(AppError):
    status_code = 404
    default_message = (
        "This itinerary or user does not exist, "
        "or this user is not a member of this itinerary."
    )


class UserNotAuthorisedError(AppError):
    status_code = 403
    default_message = "You are not authorised to complete this action."


class EventNotFoundError(AppError):
    status_code = 404
    default_message = "Event not found."


class InviteNotFoundError(AppError):
    status_code = 404
    default_message = "Invite not found."


class BadRequestError(AppError):
    status_code = 400
    default_message = "Bad request."


# TODO: remove and replace with specifc errors
class NotFoundError(AppError):
    status_code = 404
    default_message = "Item not found."

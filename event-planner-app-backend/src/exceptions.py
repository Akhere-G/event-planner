class UserAlreadyExistsError(Exception):
    def __init__(self, message="A user with this email already exists."):
        self.message = message
        self.status_code = 409
        super().__init__(self.message)


class UserDoesNotExistError(Exception):
    def __init__(self, message="No user exists with this email."):
        self.message = message
        self.status_code = 404
        super().__init__(self.message)


class InvalidCredentialsError(Exception):
    def __init__(self, message="Invalid Credentials."):
        self.message = message
        self.status_code = 401
        super().__init__(self.message)


class ItineraryDoesNotExistError(Exception):
    def __init__(
        self,
        message="This itinernary or user does not exist or this user is not a member of this itinerary.",
    ):
        self.message = message
        self.status_code = 404
        super().__init__(self.message)


class UserNotAuthorisedError(Exception):
    def __init__(self, message="You are not authorised to complete this action."):
        self.message = message
        self.status_code = 403
        super().__init__(self.message)


class EventNotFoundError(Exception):
    def __init__(self, message="Event not found."):
        self.message = message
        self.status_code = 404
        super().__init__(self.message)


class InviteNotFoundError(Exception):
    def __init__(self, message="Invite not found."):
        self.message = message
        self.status_code = 404
        super().__init__(self.message)


class BadRequestError(Exception):
    def __init__(self, message="Bad Request."):
        self.message = message
        self.status_code = 400
        super().__init__(self.message)


class NotFoundError(Exception):
    def __init__(self, message="Item Not Found."):
        self.message = message
        self.status_code = 404
        super().__init__(self.message)

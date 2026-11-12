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


class DemoUnavailableError(AppError):
    status_code = 404
    default_message = "Demo is temporarily unavailable. Please try again shortly."


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


class TemplateNotFoundError(AppError):
    status_code = 404
    default_message = "Template not found."


class BadRequestError(AppError):
    status_code = 400
    default_message = "Bad request."


# TODO: remove and replace with specifc errors
class NotFoundError(AppError):
    status_code = 404
    default_message = "Item not found."


class UnknownAiTaskTypeError(AppError):
    status_code = 404
    default_message = "Unknown AI task type."


class AiTaskNotFoundError(AppError):
    status_code = 404
    default_message = "AI task not found."


class ActiveAiTaskConflictError(AppError):
    status_code = 409
    default_message = "This is already being worked on. Please wait for it to finish."


class TooManyActiveAiTasksError(AppError):
    status_code = 429
    default_message = (
        "You have too many AI tasks running. Please wait for one to finish."
    )


class InvalidAiTaskStateError(AppError):
    status_code = 409
    default_message = "This AI task can no longer be changed."


class AiTaskQueueError(AppError):
    status_code = 503
    default_message = "Could not start this AI task. Please try again."


class AIProviderError(AppError, RuntimeError):
    """Every AI provider failed or timed out. Safe to retry."""

    status_code = 503
    default_message = "The AI service is temporarily unavailable. Please try again."


class AIResponseError(AppError, ValueError):
    """The AI answered, but not with usable output. Retrying rarely helps."""

    status_code = 502
    default_message = "The AI returned a response that could not be used."


class FlightProviderError(Exception):
    """A single flight provider failed to answer a search."""


class FlightSearchUnavailableError(AppError):
    status_code = 503
    default_message = "Flight search is temporarily unavailable. Please try again later."


class FxUnavailableError(AppError):
    status_code = 503
    default_message = (
        "Exchange rates are unavailable right now. Please try again shortly."
    )


class CalendarNotConfiguredError(AppError):
    status_code = 503
    default_message = "Google Calendar sync is not configured on this server."


class GoogleCalendarApiError(AppError):
    status_code = 502
    default_message = "Google Calendar could not be reached. Please try again."

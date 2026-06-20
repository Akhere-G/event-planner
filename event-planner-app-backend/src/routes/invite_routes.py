from flask import Blueprint, request
from ..middleware.login_required import login_required
from ..services.itineraries_service import get_itinerary_membership, is_authorised
from ..services.invite_service import (
    get_invites,
    create_invite,
    revoke_invite,
    join_itinerary,
)
from ..exceptions import (
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
    UserAlreadyExistsError,
    InviteNotFoundError,
    UserDoesNotExistError,
)
from ..utils.format_response import api_response
from ..schemas.invite_schema import InviteSchemaPrivate
from ..schemas.itinerary_schema import ItinerarySchema
from marshmallow import ValidationError

itinerary_invites_bp = Blueprint("invite", __name__)


@itinerary_invites_bp.route("")
@login_required
def get_invites_route(user_id: int, itinerary_id: int):
    schema = InviteSchemaPrivate(many=True)
    try:
        get_itinerary_membership(user_id, itinerary_id)
        result = get_invites(itinerary_id)
        invites = schema.dump(result)
        return api_response(
            data={"invites": invites},
            success=True,
            message="Fetched invites.",
            status_code=200,
        )
    except ItineraryDoesNotExistError as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@itinerary_invites_bp.route("", methods=["POST"])
@login_required
def create_invite_route(user_id: int, itinerary_id: int):
    schema = InviteSchemaPrivate()
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            message="You must be an admin to invite users.",
        )
        validated_invite = schema.load(request.json)
        validated_invite["itinerary_id"] = itinerary_id
        validated_invite["inviter_id"] = user_id
        validated_invite["created_by_id"] = user_id
        validated_invite["updated_by_id"] = user_id
        invite = create_invite(validated_invite)

        return api_response(
            data=schema.dump(invite),
            success=True,
            message="Created invite.",
            status_code=201,
        )
    except (
        ItineraryDoesNotExistError,
        UserNotAuthorisedError,
        UserAlreadyExistsError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error={"general": [err.message]},
            status_code=err.status_code,
        )
    except ValidationError as err:
        return api_response(
            message="Bad request.",
            success=False,
            error=err.messages,
            status_code=400,
        )


@itinerary_invites_bp.route("<int:invite_id>", methods=["DELETE"])
@login_required
def revoke_invite_route(user_id: int, itinerary_id: int, invite_id: int):
    schema = InviteSchemaPrivate()
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            message="You must be an admin to revoke invites.",
        )

        invite = revoke_invite(user_id, itinerary_id, invite_id)

        return api_response(
            data=schema.dump(invite),
            success=True,
            message="Revoked invite.",
            status_code=200,
        )
    except (
        ItineraryDoesNotExistError,
        UserNotAuthorisedError,
        InviteNotFoundError,
    ) as err:
        return api_response(
            message=err.message,
            success=False,
            error=err.message,
            status_code=err.status_code,
        )


@itinerary_invites_bp.route("/join/<token>")
def join_itinerary_route(user_id, token):
    try:
        schema = ItinerarySchema()
        itinerary = join_itinerary(user_id, token)
        return api_response(
            success=True,
            message="Joined itinerary",
            status_code=200,
            data=schema.dump(itinerary),
        )
    except (
        ItineraryDoesNotExistError,
        UserDoesNotExistError,
        UserAlreadyExistsError,
    ) as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )

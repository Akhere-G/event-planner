from flask import Blueprint, request

from ..middleware.login_required import login_required
from ..schemas.invite_schema import InviteSchemaPrivate
from ..services.invite_service import (
    create_invite,
    get_invites,
    revoke_invite,
)
from ..services.itineraries_service import is_authorised, is_user_in_itinerary
from ..utils.format_response import api_response

itinerary_invites_bp = Blueprint("invite", __name__)


@itinerary_invites_bp.route("")
@login_required
def get_invites_route(user_id: int, itinerary_id: int):
    schema = InviteSchemaPrivate(many=True)
    is_user_in_itinerary(user_id, itinerary_id)
    result = get_invites(itinerary_id)
    invites = schema.dump(result)
    return api_response(
        data={"invites": invites},
        success=True,
        message="Fetched invites.",
        status_code=200,
    )


@itinerary_invites_bp.route("", methods=["POST"])
@login_required
def create_invite_route(user_id: int, itinerary_id: int):
    schema = InviteSchemaPrivate()
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


@itinerary_invites_bp.route("<int:invite_id>", methods=["DELETE"])
@login_required
def revoke_invite_route(user_id: int, itinerary_id: int, invite_id: int):
    schema = InviteSchemaPrivate()
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

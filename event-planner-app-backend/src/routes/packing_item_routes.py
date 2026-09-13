from flask import Blueprint, request

from ..exceptions import BadRequestError, UserNotAuthorisedError
from ..extensions import limiter
from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..schemas.packing_item_schema import PackingItemSchema
from ..services import packing_item_service
from ..utils.format_response import api_response
from ..utils.rate_limit import get_user_or_ip

packing_item_bp = Blueprint("packing", __name__)


@packing_item_bp.route("", methods=["GET"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
)
def get_packing_items_route(itinerary_id: int, access: ItineraryAccess):
    schema = PackingItemSchema(many=True)

    packing_items = packing_item_service.get_packing_lists(access.user_id, itinerary_id)
    return api_response(
        success=True,
        data=schema.dump(packing_items),
        message="Fetched packing items.",
    )


@packing_item_bp.route("", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
    message="You must be an admin or an editor to create shared packing items",
)
def create_packing_item(itinerary_id: int, access: ItineraryAccess):
    schema = PackingItemSchema()
    packing_item = schema.load(request.json)
    if packing_item.get("is_shared") and not UserRole.has_value(
        access.role, [UserRole.ADMIN, UserRole.EDITOR]
    ):
        raise UserNotAuthorisedError(
            "You must be an admin or an editor to create shared packing items",
        )

    if not access.user_id and packing_item["is_shared"]:
        raise BadRequestError("Must be logged in to create personal packing items.")

    new_packing_item = packing_item_service.create_packing_item(
        access.user_id, itinerary_id, packing_item
    )
    return api_response(
        success=True,
        data=schema.dump(new_packing_item),
        message="Created packing item.",
    )


@packing_item_bp.route("/generate", methods=["POST"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR],
)
@limiter.limit("10 per minute", key_func=get_user_or_ip)
@limiter.limit("10 per minute")
def generate_packing_items_route(itinerary_id: int, access: ItineraryAccess):
    schema = PackingItemSchema(many=True)
    items = packing_item_service.generate_and_add_packing_items(
        access.user_id, itinerary_id
    )
    return api_response(
        success=True,
        data=schema.dump(items),
        message="Generated packing list.",
    )


@packing_item_bp.route("/<int:packing_item_id>", methods=["PATCH"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
    message="You must be an admin or an editor to edit shared packing items",
)
def update_packing_item(
    itinerary_id: int, access: ItineraryAccess, packing_item_id: int
):

    item = packing_item_service.get_packing_item(
        access.user_id, itinerary_id, packing_item_id
    )
    schema = PackingItemSchema(partial=True)
    packing_item_data = schema.load(request.json)

    if (
        item.is_shared or packing_item_data.get("is_shared")
    ) and not UserRole.has_value(access.role, [UserRole.ADMIN, UserRole.EDITOR]):
        raise UserNotAuthorisedError(
            "You must be an admin or an editor to edit shared packing items"
        )

    if not item.is_shared and item.owner_id != access.user_id:
        raise UserNotAuthorisedError("You cannot edit someone else's packing items.")

    result = packing_item_service.update_packing_item(
        access.user_id, itinerary_id, packing_item_id, packing_item_data
    )
    return api_response(
        success=True, data=schema.dump(result), message="Updated packing item."
    )


@packing_item_bp.route("/<int:packing_item_id>", methods=["DELETE"])
@itinerary_access_required(
    allowed_roles=[UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
    message="You must be an editor or admin to delete shared packing items.",
)
def delete_packing_item(
    itinerary_id: int, access: ItineraryAccess, packing_item_id: int
):
    item = packing_item_service.get_packing_item(
        access.user_id, itinerary_id, packing_item_id
    )
    if item.is_shared and not UserRole.has_value(
        access.role, [UserRole.ADMIN, UserRole.EDITOR]
    ):
        raise UserNotAuthorisedError(
            "You must be an editor or admin to delete shared packing items.",
        )
    elif item.owner_id and item.owner_id != access.user_id:
        raise UserNotAuthorisedError(
            "You cannot delete another user's personal packing item.",
        )
    deleted_id = packing_item_service.delete_packing_item(
        access.user_id, itinerary_id, packing_item_id
    )
    return api_response(success=True, data=deleted_id, message="Deleted packing item.")

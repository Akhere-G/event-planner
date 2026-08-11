from flask import Blueprint, request
from marshmallow import ValidationError

from ..exceptions import (
    ItineraryDoesNotExistError,
    NotFoundError,
    UserNotAuthorisedError,
)
from ..extensions import limiter
from ..middleware.login_required import login_required
from ..models import UserRole
from ..schemas.packing_item_schema import PackingItemSchema
from ..services import itineraries_service, packing_item_service
from ..utils.format_response import api_response

packing_item_bp = Blueprint("packing", __name__)


@packing_item_bp.route("", methods=["GET"])
@login_required
def get_packing_items_route(user_id: int, itinerary_id: int):
    schema = PackingItemSchema(many=True)
    try:
        itineraries_service.get_itinerary_membership(user_id, itinerary_id)
        packing_items = packing_item_service.get_packing_lists(user_id, itinerary_id)
        return api_response(
            success=True,
            data=schema.dump(packing_items),
            message="Fetched packing items.",
        )
    except ItineraryDoesNotExistError as err:
        return api_response(
            success=False, message=err.message, status_code=err.status_code
        )


@packing_item_bp.route("", methods=["POST"])
@login_required
def create_packing_item(user_id: int, itinerary_id: int):
    schema = PackingItemSchema()
    try:
        itineraries_service.get_itinerary_membership(user_id, itinerary_id)
        packing_item = schema.load(request.json)
        if packing_item.get("is_shared"):
            itineraries_service.is_authorised(
                user_id,
                itinerary_id,
                authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
                message="You must be an admin or an editor to create shared packing items",
            )

        new_packing_item = packing_item_service.create_packing_item(
            user_id, itinerary_id, packing_item
        )
        return api_response(
            success=True,
            data=schema.dump(new_packing_item),
            message="Created packing item.",
        )
    except (
        ItineraryDoesNotExistError,
        UserNotAuthorisedError,
    ) as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code,
        )
    except ValidationError as err:
        return api_response(
            success=False, error=err.messages, message=err.messages, status_code=400
        )


@packing_item_bp.route("/generate", methods=["POST"])
@login_required
@limiter.limit("10 per minute")
def generate_packing_items_route(user_id: int, itinerary_id: int):
    schema = PackingItemSchema(many=True)
    try:
        itineraries_service.get_itinerary_membership(user_id, itinerary_id)
        items = packing_item_service.generate_and_add_packing_items(
            user_id, itinerary_id
        )
        return api_response(
            success=True,
            data=schema.dump(items),
            message="Generated packing list.",
        )
    except (ItineraryDoesNotExistError, UserNotAuthorisedError) as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code,
        )
    except Exception as err:
        return api_response(
            success=False, error=str(err), message=str(err), status_code=500
        )


@packing_item_bp.route("/<int:packing_item_id>", methods=["PATCH"])
@login_required
def update_packing_item(user_id: int, itinerary_id: int, packing_item_id: int):
    try:
        itineraries_service.get_itinerary_membership(user_id, itinerary_id)

        item = packing_item_service.get_packing_item(
            user_id, itinerary_id, packing_item_id
        )
        schema = PackingItemSchema(partial=True)
        packing_item_data = schema.load(request.json)

        if item.is_shared or packing_item_data.get("is_shared"):
            itineraries_service.is_authorised(
                user_id,
                itinerary_id,
                [UserRole.ADMIN, UserRole.EDITOR],
                "You must be an admin or an editor to edit shared packing items",
            )
        if not item.is_shared and item.owner_id != user_id:
            raise UserNotAuthorisedError(
                "You cannot edit someone else's packing items."
            )

        result = packing_item_service.update_packing_item(
            user_id, itinerary_id, packing_item_id, packing_item_data
        )
        return api_response(
            success=True, data=schema.dump(result), message="Updated packing item."
        )

    except (NotFoundError, ItineraryDoesNotExistError, UserNotAuthorisedError) as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code,
        )
    except ValidationError as err:
        return api_response(success=False, error=err.messages, status_code=400)


@packing_item_bp.route("/<int:packing_item_id>", methods=["DELETE"])
@login_required
def delete_packing_item(user_id: int, itinerary_id: int, packing_item_id: int):
    try:
        itineraries_service.get_itinerary_membership(user_id, itinerary_id)
        item = packing_item_service.get_packing_item(
            user_id, itinerary_id, packing_item_id
        )
        if item.is_shared:
            itineraries_service.is_authorised(
                user_id,
                itinerary_id,
                [UserRole.ADMIN, UserRole.EDITOR],
                "You must be an editor or admin to delete shared packing items.",
            )
        elif item.owner_id and item.owner_id != user_id:
            itineraries_service.is_authorised(
                user_id,
                itinerary_id,
                [UserRole.ADMIN, UserRole.EDITOR],
                "You cannot delete another user's personal packing item.",
            )
        deleted_id = packing_item_service.delete_packing_item(
            user_id, itinerary_id, packing_item_id
        )
        return api_response(
            success=True, data=deleted_id, message="Deleted packing item."
        )
    except (ItineraryDoesNotExistError, UserNotAuthorisedError, NotFoundError) as err:
        return api_response(
            success=False,
            error=err.message,
            message=err.message,
            status_code=err.status_code if hasattr(err, "status_code") else 400,
        )

from flask import Blueprint, request
from ..middleware.login_required import login_required
from ..services.itineraries_service import get_itinerary_membership, is_authorised
from ..services.wishlist_service import (
    get_wishlists,
    create_category,
    create_wishlist_item,
    delete_wishlist_item,
    promote_wishlist_item,
    itinerary_contains_wishlist_item,
)
from ..schemas.wishlist_schema import WishlistCategorySchema, WishlistItemSchema
from ..schemas.event_schema import EventSchema
from ..schemas.itinerary_schema import UserRole
from ..utils.format_response import api_response
from ..exceptions import (
    BadRequestError,
    ItineraryDoesNotExistError,
    UserNotAuthorisedError,
)
from marshmallow import ValidationError
from datetime import datetime


wishlist_bp = Blueprint("wishlist", __name__)


@wishlist_bp.route("", methods=["GET"])
@login_required
def get_wishlists_route(user_id: int, itinerary_id: int):
    try:
        get_itinerary_membership(user_id, itinerary_id)
        results = get_wishlists(itinerary_id)
        schema = WishlistCategorySchema(many=True)
        return api_response(
            success=True,
            data=schema.dump(results),
            message="Fetched wishlist details.",
            status_code=200,
        )
    except (ItineraryDoesNotExistError, UserNotAuthorisedError) as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )


@wishlist_bp.route("/categories", methods=["POST"])
@login_required
def create_category_route(user_id: int, itinerary_id: int):
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
            message="You must be an admin or an editor to add categories.",
        )
        name = request.json.get("name")
        if not name or not name.strip():
            return api_response(
                success=False, error="Category name is required.", status_code=400
            )

        category = create_category(itinerary_id, name.strip())
        schema = WishlistCategorySchema()
        return api_response(
            success=True,
            data=schema.dump(category),
            message="Created wishlist category.",
            status_code=201,
        )
    except (UserNotAuthorisedError, ItineraryDoesNotExistError, BadRequestError) as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )


# TODO: Add update Wishlist route


@wishlist_bp.route("/items", methods=["POST"])
@login_required
def create_item_route(user_id: int, itinerary_id: int):
    schema = WishlistItemSchema()
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
            message="You must be an admin or an editor to add items.",
        )
        validated_data = schema.load(request.json)
        category_id = request.json.get("categoryId")
        if not category_id:
            return api_response(
                success=False, error="categoryId is required.", status_code=400
            )

        item = create_wishlist_item(itinerary_id, category_id, validated_data, user_id)
        return api_response(
            success=True,
            data=schema.dump(item),
            message="Created wishlist item.",
            status_code=201,
        )
    except ValidationError as err:
        return api_response(
            success=False, error=err.messages, message="Bad request.", status_code=400
        )
    except (UserNotAuthorisedError, ItineraryDoesNotExistError, BadRequestError) as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )


@wishlist_bp.route("/items/<int:item_id>", methods=["DELETE"])
@login_required
def delete_item_route(user_id: int, itinerary_id: int, item_id: int):
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
            message="You must be an admin or an editor to remove items.",
        )
        if not itinerary_contains_wishlist_item(itinerary_id, item_id):
            return api_response(
                success=False,
                error="Wishlist item does not exists",
                message="Wishlist item does not exist",
                status_code=404,
            )
        deleted_id = delete_wishlist_item(item_id)
        return api_response(
            success=True,
            data={"deletedId": deleted_id},
            message="Removed wishlist item.",
            status_code=200,
        )
    except (UserNotAuthorisedError, ItineraryDoesNotExistError, BadRequestError) as err:
        return api_response(
            success=False,
            message=err.message,
            error=err.message,
            status_code=err.status_code,
        )


# TODO: Add update Wishlist Item route


@wishlist_bp.route("/items/<int:item_id>/promote", methods=["POST"])
@login_required
def promote_item_route(user_id: int, itinerary_id: int, item_id: int):
    try:
        is_authorised(
            user_id=user_id,
            itinerary_id=itinerary_id,
            authorised_roles=[UserRole.ADMIN, UserRole.EDITOR],
            message="You must be an admin or an editor to schedule items.",
        )
        start_at_str = request.json.get("startAt")
        end_at_str = request.json.get("endAt")

        if not start_at_str or not end_at_str:
            return api_response(
                success=False,
                error="startAt and endAt datetimes are required.",
                status_code=400,
            )

        try:
            start_at = datetime.fromisoformat(start_at_str.replace("Z", "+00:00"))
            end_at = datetime.fromisoformat(end_at_str.replace("Z", "+00:00"))
        except ValueError:
            return api_response(
                success=False,
                error="Invalid date format. Use ISO 8601.",
                status_code=400,
            )

        event = promote_wishlist_item(itinerary_id, item_id, start_at, end_at, user_id)
        event_schema = EventSchema()
        return api_response(
            success=True,
            data=event_schema.dump(event),
            message="Promoted wishlist item to scheduled event.",
            status_code=200,
        )
    except (UserNotAuthorisedError, ItineraryDoesNotExistError, BadRequestError) as err:
        return api_response(
            success=False,
            message=getattr(err, "message", str(err)),
            error=getattr(err, "message", str(err)),
            status_code=getattr(err, "status_code", 400),
        )

from flask import Blueprint, request

from ..middleware.itinerary_access_required import (
    ItineraryAccess,
    itinerary_access_required,
)
from ..models import UserRole
from ..schemas.expense_schema import ExpenseSchema, SettlementSchema
from ..services import expense_service
from ..utils.format_response import api_response

expense_bp = Blueprint("expenses", __name__)

READ_ROLES = [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]
WRITE_ROLES = [UserRole.ADMIN, UserRole.EDITOR]
WRITE_MESSAGE = "You must be an admin or an editor to manage expenses."


@expense_bp.route("", methods=["GET"])
@itinerary_access_required(allowed_roles=READ_ROLES)
def get_expenses_route(itinerary_id: int, access: ItineraryAccess):
    return api_response(
        success=True,
        data=ExpenseSchema(many=True).dump(expense_service.get_expenses(itinerary_id)),
        message="Fetched expenses.",
    )


@expense_bp.route("", methods=["POST"])
@itinerary_access_required(allowed_roles=WRITE_ROLES, message=WRITE_MESSAGE)
def create_expense_route(itinerary_id: int, access: ItineraryAccess):
    schema = ExpenseSchema()
    data = schema.load(request.json)
    expense = expense_service.create_expense(
        access.user_id, access.role, itinerary_id, data
    )
    return api_response(
        success=True,
        data=schema.dump(expense),
        message="Created expense.",
        status_code=201,
    )


@expense_bp.route("/balances", methods=["GET"])
@itinerary_access_required(allowed_roles=READ_ROLES)
def get_balances_route(itinerary_id: int, access: ItineraryAccess):
    balances = expense_service.get_balances(itinerary_id)
    return api_response(
        success=True,
        data={
            "balances": [
                {**b, "net_gbp": float(b["net_gbp"])} for b in balances["balances"]
            ],
            "transfers": [
                {**t, "amount_gbp": float(t["amount_gbp"])}
                for t in balances["transfers"]
            ],
            "total_spent_gbp": float(balances["total_spent_gbp"]),
        },
        message="Fetched balances.",
    )


@expense_bp.route("/<int:expense_id>", methods=["PATCH"])
@itinerary_access_required(allowed_roles=WRITE_ROLES, message=WRITE_MESSAGE)
def update_expense_route(itinerary_id: int, access: ItineraryAccess, expense_id: int):
    schema = ExpenseSchema(partial=True)
    data = schema.load(request.json)
    expense = expense_service.update_expense(
        access.user_id, access.role, itinerary_id, expense_id, data
    )
    return api_response(
        success=True, data=schema.dump(expense), message="Updated expense."
    )


@expense_bp.route("/<int:expense_id>", methods=["DELETE"])
@itinerary_access_required(allowed_roles=WRITE_ROLES, message=WRITE_MESSAGE)
def delete_expense_route(itinerary_id: int, access: ItineraryAccess, expense_id: int):
    deleted_id = expense_service.delete_expense(
        access.user_id, access.role, itinerary_id, expense_id
    )
    return api_response(success=True, data=deleted_id, message="Deleted expense.")


@expense_bp.route("/settlements", methods=["GET"])
@itinerary_access_required(allowed_roles=READ_ROLES)
def get_settlements_route(itinerary_id: int, access: ItineraryAccess):
    return api_response(
        success=True,
        data=SettlementSchema(many=True).dump(
            expense_service.get_settlements(itinerary_id)
        ),
        message="Fetched settlements.",
    )


@expense_bp.route("/settlements", methods=["POST"])
@itinerary_access_required(allowed_roles=WRITE_ROLES, message=WRITE_MESSAGE)
def create_settlement_route(itinerary_id: int, access: ItineraryAccess):
    schema = SettlementSchema()
    data = schema.load(request.json)
    settlement = expense_service.create_settlement(
        access.user_id, access.role, itinerary_id, data
    )
    return api_response(
        success=True,
        data=schema.dump(settlement),
        message="Recorded settlement.",
        status_code=201,
    )


@expense_bp.route("/settlements/<int:settlement_id>", methods=["PATCH"])
@itinerary_access_required(allowed_roles=WRITE_ROLES, message=WRITE_MESSAGE)
def update_settlement_route(
    itinerary_id: int, access: ItineraryAccess, settlement_id: int
):
    schema = SettlementSchema(partial=True)
    data = schema.load(request.json)
    settlement = expense_service.update_settlement(
        access.user_id, access.role, itinerary_id, settlement_id, data
    )
    return api_response(
        success=True, data=schema.dump(settlement), message="Updated settlement."
    )


@expense_bp.route("/settlements/<int:settlement_id>", methods=["DELETE"])
@itinerary_access_required(allowed_roles=WRITE_ROLES, message=WRITE_MESSAGE)
def delete_settlement_route(
    itinerary_id: int, access: ItineraryAccess, settlement_id: int
):
    deleted_id = expense_service.delete_settlement(
        access.user_id, access.role, itinerary_id, settlement_id
    )
    return api_response(success=True, data=deleted_id, message="Deleted settlement.")

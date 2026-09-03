from flask import Blueprint, request

from ..middleware.login_required import login_required
from ..schemas.notification_schema import (
    NotificationResponseSchema,
    NotificationSubscriptionSchema,
)
from ..services.notification_service import (
    get_user_notifications,
    get_vapid_public_key,
    mark_all_notifications_read,
    mark_notification_read,
    subscribe_user,
    unsubscribe_user,
)
from ..utils.format_response import api_response

notification_bp = Blueprint("notification", __name__)


@notification_bp.route("/vapid-public-key", methods=["GET"])
def vapid_public_key_route():
    public_key = get_vapid_public_key()
    return api_response(
        data={"publicKey": public_key},
        success=True,
        message="VAPID public key retrieved.",
        status_code=200,
    )


@notification_bp.route("/subscribe", methods=["POST"])
@login_required
def subscribe_route(user_id: int):
    schema = NotificationSubscriptionSchema()
    data = schema.load(request.json or {})

    subscribe_user(
        user_id=user_id,
        endpoint=data["endpoint"],
        p256dh=data["keys"]["p256dh"],
        auth=data["keys"]["auth"],
    )

    return api_response(
        data={"subscribed": True},
        success=True,
        message="Successfully subscribed to push notifications.",
        status_code=200,
    )


@notification_bp.route("/unsubscribe", methods=["POST"])
@login_required
def unsubscribe_route(user_id: int):
    payload = request.json or {}
    endpoint = payload.get("endpoint")

    unsubscribe_user(user_id=user_id, endpoint=endpoint)

    return api_response(
        data={"unsubscribed": True},
        success=True,
        message="Unsubscribed from push notifications.",
        status_code=200,
    )


@notification_bp.route("", methods=["GET"])
@login_required
def get_notifications_route(user_id: int):
    notifications, unread_count = get_user_notifications(user_id=user_id)
    schema = NotificationResponseSchema(many=True)

    return api_response(
        data={
            "notifications": schema.dump(notifications),
            "unreadCount": unread_count,
        },
        success=True,
        message="Fetched notifications.",
        status_code=200,
    )


@notification_bp.route("/<int:notification_id>/read", methods=["PATCH"])
@login_required
def mark_read_route(user_id: int, notification_id: int):
    notification = mark_notification_read(user_id=user_id, notification_id=notification_id)
    schema = NotificationResponseSchema()

    return api_response(
        data=schema.dump(notification),
        success=True,
        message="Notification marked as read.",
        status_code=200,
    )


@notification_bp.route("/read-all", methods=["PATCH"])
@login_required
def mark_all_read_route(user_id: int):
    mark_all_notifications_read(user_id=user_id)

    return api_response(
        data={"updated": True},
        success=True,
        message="All notifications marked as read.",
        status_code=200,
    )

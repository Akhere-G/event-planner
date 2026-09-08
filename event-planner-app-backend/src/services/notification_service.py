import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

from pywebpush import WebPushException, webpush
from sqlalchemy import func, select

from ..exceptions import NotFoundError
from ..extensions import db
from ..models import Event, ItineraryUser, Notification, NotificationSubscription

logger = logging.getLogger(__name__)

DEFAULT_VAPID_PUBLIC_KEY = os.getenv(
    "VAPID_PUBLIC_KEY",
    "BIoMAfVOMDXb1EMepDcZ7-mhdH86N2cSbDVupelNjnjYmMCtpEx2aPCg_hojww-SMeLlpNWChzcBICGJEE74I2o",
)
DEFAULT_VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")
DEFAULT_VAPID_CLAIMS_SUB = os.getenv(
    "VAPID_CLAIMS_SUB", "mailto:admin@eventplanner.app"
)


def get_vapid_public_key() -> str:
    return os.getenv("VAPID_PUBLIC_KEY", DEFAULT_VAPID_PUBLIC_KEY)


def subscribe_user(
    user_id: int, endpoint: str, p256dh: str, auth: str
) -> NotificationSubscription:
    stmt = select(NotificationSubscription).where(
        NotificationSubscription.endpoint == endpoint
    )
    subscription = db.session.execute(stmt).scalar_one_or_none()

    if subscription:
        subscription.user_id = user_id
        subscription.p256dh = p256dh
        subscription.auth = auth
    else:
        subscription = NotificationSubscription(
            user_id=user_id,
            endpoint=endpoint,
            p256dh=p256dh,
            auth=auth,
        )
        db.session.add(subscription)

    db.session.commit()
    return subscription


def unsubscribe_user(user_id: int, endpoint: Optional[str] = None) -> bool:
    stmt = select(NotificationSubscription).where(
        NotificationSubscription.user_id == user_id
    )
    if endpoint:
        stmt = stmt.where(NotificationSubscription.endpoint == endpoint)

    subscriptions = db.session.execute(stmt).scalars().all()
    for sub in subscriptions:
        db.session.delete(sub)

    db.session.commit()
    return True


def get_user_notifications(
    user_id: int, limit: int = 50
) -> Tuple[List[Notification], int]:
    notifications_stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    notifications = list(db.session.execute(notifications_stmt).scalars().all())

    unread_stmt = (
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user_id, Notification.is_read.is_(False))
    )
    unread_count = db.session.execute(unread_stmt).scalar() or 0

    return notifications, unread_count


def mark_notification_read(user_id: int, notification_id: int) -> Notification:
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    )
    notification = db.session.execute(stmt).scalar_one_or_none()

    if not notification:
        raise NotFoundError("Notification not found.")

    notification.is_read = True
    db.session.commit()
    return notification


def mark_all_notifications_read(user_id: int) -> int:
    stmt = select(Notification).where(
        Notification.user_id == user_id,
        Notification.is_read.is_(False),
    )
    notifications = db.session.execute(stmt).scalars().all()
    count = 0
    for notif in notifications:
        notif.is_read = True
        count += 1

    db.session.commit()
    return count


def send_push_notification(
    user_id: int,
    title: str,
    message: str,
    link_url: Optional[str] = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        link_url=link_url,
        is_read=False,
    )
    db.session.add(notification)
    db.session.commit()

    private_key = DEFAULT_VAPID_PRIVATE_KEY
    if not private_key:
        logger.warning("VAPID_PRIVATE_KEY not set. Push dispatch skipped.")
        return notification

    stmt = select(NotificationSubscription).where(
        NotificationSubscription.user_id == user_id
    )
    subscriptions = db.session.execute(stmt).scalars().all()
    print(f"no. subscriptions {len(subscriptions)}")
    payload = json.dumps(
        {
            "title": title,
            "message": message,
            "url": link_url or "/",
        }
    )

    claims: Dict[str, str | int] = {"sub": DEFAULT_VAPID_CLAIMS_SUB}

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth,
                    },
                },
                data=payload,
                vapid_private_key=private_key,
                vapid_claims=claims,
            )
        except WebPushException as ex:
            logger.error(f"WebPush error for subscription {sub.id}: {ex}")
            if ex.response is not None and ex.response.status_code in [404, 410]:
                db.session.delete(sub)
                db.session.commit()
        except Exception as ex:
            logger.exception(f"Unexpected error sending push: {ex}")

    return notification


def check_upcoming_event_reminders(minutes_ahead: int = 30) -> int:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    future_window = now + timedelta(minutes=minutes_ahead)

    stmt = select(Event).where(Event.start_at >= now, Event.start_at <= future_window)
    upcoming_events = db.session.execute(stmt).scalars().all()
    print(now, future_window)
    print(f"upcoming events {len(upcoming_events)}")

    total_sent = 0
    for event in upcoming_events:
        time_diff = event.start_at - now
        mins_remaining = max(1, int(time_diff.total_seconds() / 60))
        suffix = "s" if mins_remaining > 1 else ""

        members_stmt = select(ItineraryUser).where(
            ItineraryUser.itinerary_id == event.itinerary_id
        )
        memberships = db.session.execute(members_stmt).scalars().all()
        print(f"No. memberships {len(memberships)}")

        title = f"Upcoming Event: {event.name}"
        message = f"Starting in {mins_remaining} minute{suffix}! Location: {event.address or 'N/A'}"
        url = f"/trips/{event.itinerary_id}"

        for member in memberships:
            send_push_notification(
                user_id=member.user_id,
                title=title,
                message=message,
                link_url=url,
            )
            total_sent += 1

    return total_sent

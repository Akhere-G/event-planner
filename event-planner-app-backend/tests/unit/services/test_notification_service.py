from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from src.exceptions import NotFoundError
from src.extensions import db
from src.models import Notification, NotificationSubscription
from src.services.notification_service import (
    check_upcoming_event_reminders,
    get_user_notifications,
    mark_all_notifications_read,
    mark_notification_read,
    send_push_notifications_bulk,
    subscribe_user,
    unsubscribe_user,
)
from tests.factories import EventFactory, ItineraryUserFactory, UserFactory


def test_subscribe_user_creates_new_subscription(app, admin_user):
    subscription = subscribe_user(
        admin_user.id, "https://push.example.com/1", "p256dh-key", "auth-key"
    )

    assert subscription.id is not None
    assert subscription.user_id == admin_user.id
    assert subscription.endpoint == "https://push.example.com/1"


def test_subscribe_user_updates_existing_subscription_for_same_endpoint(
    app, admin_user
):
    subscribe_user(admin_user.id, "https://push.example.com/1", "old-p256dh", "old-auth")
    updated = subscribe_user(
        admin_user.id, "https://push.example.com/1", "new-p256dh", "new-auth"
    )

    stmt = db.select(NotificationSubscription).where(
        NotificationSubscription.endpoint == "https://push.example.com/1"
    )
    all_matching = db.session.execute(stmt).scalars().all()

    assert len(all_matching) == 1
    assert updated.p256dh == "new-p256dh"


def test_unsubscribe_user_removes_subscriptions(app, admin_user):
    subscribe_user(admin_user.id, "https://push.example.com/1", "p256dh", "auth")

    result = unsubscribe_user(admin_user.id)

    assert result is True
    stmt = db.select(NotificationSubscription).where(
        NotificationSubscription.user_id == admin_user.id
    )
    assert db.session.execute(stmt).scalars().all() == []


def test_get_user_notifications_returns_unread_count(app, admin_user):
    with patch("src.services.notification_service.DEFAULT_VAPID_PRIVATE_KEY", ""):
        send_push_notifications_bulk(
            user_ids=[admin_user.id], title="Hi", message="There"
        )
        send_push_notifications_bulk(
            user_ids=[admin_user.id], title="Hi again", message="There again"
        )

    notifications, unread_count = get_user_notifications(admin_user.id)

    assert len(notifications) == 2
    assert unread_count == 2


def test_mark_notification_read_success(app, admin_user):
    with patch("src.services.notification_service.DEFAULT_VAPID_PRIVATE_KEY", ""):
        [notification] = send_push_notifications_bulk(
            user_ids=[admin_user.id], title="Hi", message="There"
        )

    updated = mark_notification_read(admin_user.id, notification.id)

    assert updated.is_read is True


def test_mark_notification_read_not_found_raises(app, admin_user):
    try:
        mark_notification_read(admin_user.id, 999999)
        assert False, "expected NotFoundError"
    except NotFoundError:
        pass


def test_mark_all_notifications_read(app, admin_user):
    with patch("src.services.notification_service.DEFAULT_VAPID_PRIVATE_KEY", ""):
        send_push_notifications_bulk(user_ids=[admin_user.id], title="A", message="1")
        send_push_notifications_bulk(user_ids=[admin_user.id], title="B", message="2")

    count = mark_all_notifications_read(admin_user.id)

    assert count == 2
    stmt = db.select(Notification).where(Notification.user_id == admin_user.id)
    assert all(n.is_read for n in db.session.execute(stmt).scalars().all())


def test_send_push_notifications_bulk_creates_one_notification_per_user(app):
    users = [UserFactory() for _ in range(3)]

    with patch("src.services.notification_service.DEFAULT_VAPID_PRIVATE_KEY", ""):
        notifications = send_push_notifications_bulk(
            user_ids=[u.id for u in users], title="Trip starting", message="Soon!"
        )

    assert len(notifications) == 3
    assert {n.user_id for n in notifications} == {u.id for u in users}


def test_send_push_notifications_bulk_skips_on_empty_user_list(app):
    assert send_push_notifications_bulk(user_ids=[], title="X", message="Y") == []


def test_check_upcoming_event_reminders_notifies_all_members(
    app, admin_user, itinerary, admin_itinerary_user
):
    other_member = UserFactory()
    ItineraryUserFactory(
        user=other_member,
        itinerary=itinerary,
        role="viewer",
        creator=admin_user,
    )

    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        start_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        end_at=datetime.now(timezone.utc) + timedelta(minutes=40),
    )

    with patch("src.services.notification_service.DEFAULT_VAPID_PRIVATE_KEY", ""):
        check_upcoming_event_reminders()

    admin_notifications, _ = get_user_notifications(admin_user.id)
    other_notifications, _ = get_user_notifications(other_member.id)
    assert len(admin_notifications) == 1
    assert len(other_notifications) == 1


def test_check_upcoming_event_reminders_ignores_far_future_events(
    app, admin_user, itinerary, admin_itinerary_user
):
    EventFactory(
        itinerary=itinerary,
        creator=admin_user,
        start_at=datetime.now(timezone.utc) + timedelta(days=5),
        end_at=datetime.now(timezone.utc) + timedelta(days=5, minutes=30),
    )

    with patch("src.services.notification_service.DEFAULT_VAPID_PRIVATE_KEY", ""):
        check_upcoming_event_reminders()

    notifications, _ = get_user_notifications(admin_user.id)
    assert notifications == []

import json
import logging
import os
import sys
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import delete, select

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SAMPLE_TRIP_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_demo_trip.json")

from src import create_app
from src.extensions import bcrypt, db
from src.models import (
    Accommodation,
    Event,
    Itinerary,
    ItineraryUser,
    Notification,
    NotificationSubscription,
    PackingItem,
    User,
    UserRole,
    Wishlist,
    WishlistItem,
    WishlistItemVote,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEMO_EMAIL = os.getenv("DEMO_USER_EMAIL", "demo@triptrack.uk")
DEMO_USERNAME = "Demo Explorer"
DEMO_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "demo-only-account")


def find_or_create_demo_user() -> User:
    """
    Find the demo user by its fixed email, or create it. Idempotent: safe to
    call on every run. Never touches any other user's row.
    """
    stmt = select(User).where(User.email == DEMO_EMAIL)
    user = db.session.execute(stmt).scalar_one_or_none()

    if user is None:
        user = User(
            username=DEMO_USERNAME,
            email=DEMO_EMAIL,
            password=bcrypt.generate_password_hash(DEMO_PASSWORD).decode("utf-8"),
            is_demo=True,
        )
        db.session.add(user)
        db.session.flush()
        logger.info(f"Created demo user id={user.id}")
    elif not user.is_demo:
        user.is_demo = True
        logger.info(f"Flagged existing user id={user.id} as is_demo")

    return user


def delete_demo_data(demo_user: User) -> None:
    """
    Delete only data owned/created by the demo user. Itineraries the demo
    user created are deleted outright, which cascades (at the DB level) to
    their events, accommodations, wishlists, wishlist items/votes, invites,
    itinerary_users, and packing_items. This never touches an itinerary the
    demo user merely joined, nor any row created by another user.
    """
    stmt = select(Itinerary).where(Itinerary.created_by_id == demo_user.id)
    demo_itineraries = db.session.execute(stmt).scalars().all()

    for itinerary in demo_itineraries:
        db.session.delete(itinerary)

    logger.info(f"Deleting {len(demo_itineraries)} demo-owned itinerary(ies)")

    db.session.execute(
        delete(Notification).where(Notification.user_id == demo_user.id)
    )
    db.session.execute(
        delete(NotificationSubscription).where(
            NotificationSubscription.user_id == demo_user.id
        )
    )

    db.session.flush()


def load_sample_trip_data() -> dict:
    with open(SAMPLE_TRIP_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def create_sample_trip(demo_user: User) -> Itinerary:
    """
    Recreate one realistic sample trip for the demo user, loaded from
    sample_demo_trip.json. No AI or Maps API calls so this stays fast,
    deterministic, and free to run.
    """
    data = load_sample_trip_data()

    today = date.today()
    start = today + timedelta(days=14)
    end = start + timedelta(days=data["itinerary"]["trip_length_days"])

    itinerary = Itinerary(
        name=data["itinerary"]["name"],
        destination=data["itinerary"]["destination"],
        latitude=data["itinerary"]["latitude"],
        longitude=data["itinerary"]["longitude"],
        description=data["itinerary"]["description"],
        timezone=data["itinerary"]["timezone"],
        start_date=start,
        end_date=end,
        created_by_id=demo_user.id,
        updated_by_id=demo_user.id,
    )
    db.session.add(itinerary)
    db.session.flush()

    db.session.add(
        ItineraryUser(
            itinerary_id=itinerary.id,
            user_id=demo_user.id,
            role=UserRole.ADMIN.value,
            created_by_id=demo_user.id,
            updated_by_id=demo_user.id,
        )
    )

    for event_data in data["events"]:
        day = start + timedelta(days=event_data["day_offset"])
        db.session.add(
            Event(
                itinerary_id=itinerary.id,
                name=event_data["name"],
                address=event_data["address"],
                latitude=event_data["latitude"],
                longitude=event_data["longitude"],
                category=event_data["category"],
                description=event_data.get("description"),
                start_at=datetime(
                    day.year, day.month, day.day, event_data["start_hour"], tzinfo=timezone.utc
                ),
                end_at=datetime(
                    day.year, day.month, day.day, event_data["end_hour"], tzinfo=timezone.utc
                ),
                created_by_id=demo_user.id,
                updated_by_id=demo_user.id,
            )
        )
    logger.info(f"Added {len(data['events'])} events")

    accommodation_data = data["accommodation"]
    db.session.add(
        Accommodation(
            itinerary_id=itinerary.id,
            name=accommodation_data["name"],
            address=accommodation_data["address"],
            latitude=accommodation_data["latitude"],
            longitude=accommodation_data["longitude"],
            description=accommodation_data["description"],
            start_date=start,
            end_date=end,
            created_by_id=demo_user.id,
            updated_by_id=demo_user.id,
        )
    )

    for wishlist_data in data["wishlists"]:
        wishlist = Wishlist(
            itinerary_id=itinerary.id,
            name=wishlist_data["name"],
            created_by_id=demo_user.id,
            updated_by_id=demo_user.id,
        )
        db.session.add(wishlist)
        db.session.flush()

        for item_data in wishlist_data["items"]:
            item = WishlistItem(
                wishlist_id=wishlist.id,
                name=item_data["name"],
                address=item_data.get("address"),
                description=item_data.get("description"),
                created_by_id=demo_user.id,
                updated_by_id=demo_user.id,
            )
            db.session.add(item)
            db.session.flush()

            if item_data.get("voted"):
                db.session.add(
                    WishlistItemVote(
                        wishlist_item_id=item.id,
                        user_id=demo_user.id,
                        is_thumbs_up=True,
                        created_by_id=demo_user.id,
                        updated_by_id=demo_user.id,
                    )
                )
    logger.info(f"Added {len(data['wishlists'])} wishlists")

    for item_data in data["packing_items"]["personal"]:
        db.session.add(
            PackingItem(
                itinerary_id=itinerary.id,
                owner_id=demo_user.id,
                name=item_data["name"],
                category=item_data["category"],
                is_checked=item_data["checked"],
                is_shared=False,
                checked_by_id=demo_user.id if item_data["checked"] else None,
                created_by_id=demo_user.id,
                updated_by_id=demo_user.id,
            )
        )

    for item_data in data["packing_items"]["group_gear"]:
        db.session.add(
            PackingItem(
                itinerary_id=itinerary.id,
                owner_id=None,
                name=item_data["name"],
                category=item_data["category"],
                is_checked=item_data["checked"],
                is_shared=True,
                checked_by_id=demo_user.id if item_data["checked"] else None,
                created_by_id=demo_user.id,
                updated_by_id=demo_user.id,
            )
        )
    logger.info(
        f"Added {len(data['packing_items']['personal'])} personal + "
        f"{len(data['packing_items']['group_gear'])} group packing items"
    )

    logger.info(f"Created sample itinerary id={itinerary.id} for demo user id={demo_user.id}")
    return itinerary


def reset_demo_data():
    app = create_app()
    with app.app_context():
        demo_user = find_or_create_demo_user()
        delete_demo_data(demo_user)
        create_sample_trip(demo_user)
        db.session.commit()
        logger.info(f"Demo data reset complete for user id={demo_user.id}")


if __name__ == "__main__":
    logger.info("Starting demo data reset...")
    reset_demo_data()
    logger.info("Demo data reset finished")

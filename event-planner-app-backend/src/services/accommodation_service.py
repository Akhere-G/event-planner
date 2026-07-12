from ..extensions import db
from ..models import Accommodation
from ..exceptions import BadRequestError, NotFoundError
from sqlalchemy import select
from ..utils.location_utils import get_place_details


def get_accommodations(itinerary_id: int):
    stmt = (
        select(Accommodation)
        .where(Accommodation.itinerary_id == itinerary_id)
        .order_by(Accommodation.start_date)
    )
    return db.session.execute(stmt).scalars().all()


def get_accommodation(itinerary_id: int, accommodation_id: int):
    stmt = select(Accommodation).where(
        Accommodation.itinerary_id == itinerary_id,
        Accommodation.id == accommodation_id,
    )
    return db.session.execute(stmt).scalar_one_or_none()


def create_accommodation(user_id: int, itinerary_id: int, accommodation_data: dict):
    start_date = accommodation_data["start_date"]
    end_date = accommodation_data["end_date"]
    if end_date < start_date:
        raise BadRequestError("end_date cannot be earlier than start_date")

    name = accommodation_data["name"]
    address = accommodation_data["address"]
    latitude = accommodation_data.get("latitude")
    longitude = accommodation_data.get("longitude")

    if latitude is None or longitude is None:
        location = get_place_details(name, address, "lodging")
        accommodation_data["latitude"] = location["latitude"]
        accommodation_data["longitude"] = location["longitude"]

    accommodation = Accommodation(
        itinerary_id=itinerary_id,
        name=accommodation_data.get("name"),
        address=accommodation_data.get("address"),
        latitude=accommodation_data.get("latitude"),
        longitude=accommodation_data.get("longitude"),
        description=accommodation_data.get("description"),
        start_date=start_date,
        end_date=end_date,
        created_by_id=user_id,
        updated_by_id=user_id,
    )
    db.session.add(accommodation)
    db.session.commit()
    return accommodation


def update_accommodation(
    itinerary_id: int, accommodation_id: int, user_id: int, accommodation_data: dict
):
    stmt = select(Accommodation).where(
        Accommodation.itinerary_id == itinerary_id,
        Accommodation.id == accommodation_id,
    )

    accommodation = db.session.execute(stmt).scalar_one_or_none()

    if not accommodation:
        raise NotFoundError("Accommodation not found.")

    start_date = accommodation_data.get("start_date", accommodation.start_date)
    end_date = accommodation_data.get("end_date", accommodation.end_date)
    if end_date < start_date:
        raise BadRequestError("end_date cannot be earlier than start_date")

    updatable_fields = [
        "name",
        "address",
        "latitude",
        "longitude",
        "description",
        "start_date",
        "end_date",
    ]
    for field in updatable_fields:
        if field in accommodation_data:
            setattr(accommodation, field, accommodation_data[field])

    accommodation.updated_by_id = user_id
    db.session.commit()
    return accommodation


def delete_accommodation(itinerary_id: int, accommodation_id: int):
    stmt = select(Accommodation).where(
        Accommodation.itinerary_id == itinerary_id,
        Accommodation.id == accommodation_id,
    )

    accommodation = db.session.execute(stmt).scalar_one_or_none()
    if not accommodation:
        raise NotFoundError("Accommodation not found.")

    db.session.delete(accommodation)
    db.session.commit()
    return accommodation_id

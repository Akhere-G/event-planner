import uuid
from collections.abc import Sequence
from typing import Any

from sqlalchemy import ColumnElement, func, or_, select
from sqlalchemy.engine import Row

from ..exceptions import TemplateNotFoundError
from ..extensions import db
from ..models import Itinerary, TripTemplate, User
from .template_snapshot_service import TripSpan, build_snapshot_ops


def _escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _public_filters(
    search: str | None, regions: Sequence[str]
) -> list[ColumnElement[bool]]:
    conditions = [TripTemplate.is_public.is_(True)]
    if regions:
        conditions.append(TripTemplate.region.in_(regions))
    if search and search.strip():
        pattern = f"%{_escape_like(search.strip())}%"
        conditions.append(
            or_(
                TripTemplate.destination.ilike(pattern, escape="\\"),
                TripTemplate.title.ilike(pattern, escape="\\"),
            )
        )
    return conditions


def get_public_template(slug: str) -> TripTemplate:
    template = db.session.execute(
        select(TripTemplate).where(
            TripTemplate.slug == slug, TripTemplate.is_public.is_(True)
        )
    ).scalar_one_or_none()
    if template is None:
        raise TemplateNotFoundError()
    return template


def get_author_name(template: TripTemplate) -> str | None:
    if template.author_id is None:
        return None
    return db.session.execute(
        select(User.username).where(User.id == template.author_id)
    ).scalar_one_or_none()


def list_templates(
    search: str | None, regions: Sequence[str], limit: int, offset: int
) -> tuple[list[Row[Any]], int]:
    """Public templates, most cloned first, each paired with its author's username."""
    conditions = _public_filters(search, regions)
    total = db.session.execute(
        select(func.count()).select_from(TripTemplate).where(*conditions)
    ).scalar_one()
    rows = db.session.execute(
        select(TripTemplate, User.username)
        .outerjoin(User, User.id == TripTemplate.author_id)
        .where(*conditions)
        .order_by(TripTemplate.clone_count.desc(), TripTemplate.id.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(rows), total


def list_template_pins(search: str | None, regions: Sequence[str]) -> list[Row[Any]]:
    """Just what the map needs, for every matching template."""
    return list(
        db.session.execute(
            select(
                TripTemplate.slug,
                TripTemplate.title,
                TripTemplate.destination,
                TripTemplate.region,
                TripTemplate.latitude,
                TripTemplate.longitude,
            )
            .where(*_public_filters(search, regions))
            .order_by(TripTemplate.id)
        ).all()
    )


def get_template_for_itinerary(itinerary_id: int) -> TripTemplate | None:
    return db.session.execute(
        select(TripTemplate).where(TripTemplate.itinerary_id == itinerary_id)
    ).scalar_one_or_none()


def publish_itinerary(
    itinerary_id: int,
    user_id: int,
    region: str,
    title: str | None,
    description: str | None,
) -> TripTemplate:
    """Publish a trip as a template, or refresh its template if it has one."""
    itinerary = db.session.get(Itinerary, itinerary_id)
    ops = build_snapshot_ops(itinerary)
    template = get_template_for_itinerary(itinerary_id)

    if template is None:
        template = TripTemplate(
            slug=uuid.uuid4().hex,
            itinerary_id=itinerary_id,
            author_id=user_id,
            title=title or itinerary.name,
            clone_count=0,
        )
        db.session.add(template)
    elif title:
        template.title = title

    if description is not None:
        template.description = description
    elif template.description is None:
        template.description = itinerary.description

    template.region = region
    template.destination = itinerary.destination
    template.latitude = itinerary.latitude
    template.longitude = itinerary.longitude
    template.timezone = itinerary.timezone
    template.duration_days = TripSpan.of(itinerary).days
    template.ops = ops
    template.is_public = True

    db.session.commit()
    return template


def unpublish_itinerary(itinerary_id: int) -> TripTemplate:
    template = get_template_for_itinerary(itinerary_id)
    if template is None:
        raise TemplateNotFoundError("This trip has not been published.")
    template.is_public = False
    db.session.commit()
    return template

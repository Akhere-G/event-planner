import json
from dataclasses import dataclass
from pathlib import Path

from marshmallow import ValidationError
from sqlalchemy import select

from ..extensions import db
from ..models import TripTemplate
from ..schemas.premade_template_schema import PremadeTemplate, PremadeTemplateSchema


@dataclass(frozen=True)
class SeedResult:
    created: int
    updated: int


def load_premade_templates(path: Path) -> list[PremadeTemplate]:
    """Read and validate a JSON list of premade templates, reporting every error."""
    raw = json.loads(path.read_text(encoding="utf-8"))
    schema = PremadeTemplateSchema()
    templates: list[PremadeTemplate] = []
    errors: dict[str, object] = {}
    seen: set[str] = set()

    for index, entry in enumerate(raw):
        label = entry.get("slug", f"#{index}")
        try:
            template = schema.load(entry)
        except ValidationError as err:
            errors[label] = err.messages
            continue
        if template.slug in seen:
            errors[label] = "Duplicate slug."
            continue
        seen.add(template.slug)
        templates.append(template)

    if errors:
        raise ValidationError(errors)
    return templates


def _apply(row: TripTemplate, template: PremadeTemplate) -> None:
    row.title = template.title
    row.description = template.description
    row.destination = template.destination
    row.region = template.region
    row.latitude = template.latitude
    row.longitude = template.longitude
    row.timezone = template.timezone
    row.duration_days = template.duration_days
    row.cover_image = template.cover_image
    row.ops = template.ops
    row.is_public = True


def seed_premade_templates(templates: list[PremadeTemplate]) -> SeedResult:
    """Upsert templates by slug. Re-running updates content and keeps clone counts."""
    created = updated = 0
    for template in templates:
        row = db.session.execute(
            select(TripTemplate).where(TripTemplate.slug == template.slug)
        ).scalar_one_or_none()
        if row is None:
            row = TripTemplate(slug=template.slug, clone_count=0)
            db.session.add(row)
            created += 1
        else:
            updated += 1
        _apply(row, template)

    db.session.commit()
    return SeedResult(created=created, updated=updated)

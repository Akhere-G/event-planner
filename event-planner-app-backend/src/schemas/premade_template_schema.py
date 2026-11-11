import re
from dataclasses import dataclass
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from marshmallow import (
    Schema,
    ValidationError,
    fields,
    post_load,
    validate,
    validates,
    validates_schema,
)

from .trip_template_schema import REGIONS, normalise_template_ops

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
MAX_PREMADE_DAYS = 30
COVER_IMAGE_PREFIX = "/template-images/"


@dataclass(frozen=True)
class PremadeTemplate:
    slug: str
    title: str
    description: str
    destination: str
    region: str
    latitude: float
    longitude: float
    timezone: str
    duration_days: int
    cover_image: str | None
    ops: list[dict[str, Any]]


def _check_offsets_fit(ops: list[dict[str, Any]], duration_days: int) -> None:
    last_day = duration_days - 1
    for index, op in enumerate(ops):
        data = op["data"]
        if op["entity"] == "event":
            fits = data["day_offset"] <= last_day and data["end_day_offset"] <= (
                duration_days
            )
        elif op["entity"] == "accommodation":
            fits = (
                data["start_day_offset"] <= last_day
                and data["end_day_offset"] <= duration_days
            )
        else:
            continue
        if not fits:
            raise ValidationError(
                f"Op {index} ({data['name']}) falls outside the {duration_days} days.",
                field_name="ops",
            )


class PremadeTemplateSchema(Schema):
    slug = fields.String(required=True, validate=validate.Length(min=1, max=160))
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    description = fields.String(
        required=True, validate=validate.Length(min=1, max=2000)
    )
    destination = fields.String(required=True, validate=validate.Length(min=1, max=255))
    region = fields.String(required=True, validate=validate.OneOf(REGIONS))
    latitude = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    longitude = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
    timezone = fields.String(required=True)
    duration_days = fields.Integer(
        required=True, validate=validate.Range(min=1, max=MAX_PREMADE_DAYS)
    )
    cover_image = fields.String(load_default=None, allow_none=True)
    ops = fields.List(fields.Dict(), required=True)

    @validates("slug")
    def validate_slug(self, value: str, **kwargs: Any) -> None:
        if not SLUG_PATTERN.match(value):
            raise ValidationError("Slugs use lowercase letters, digits and hyphens.")

    @validates("timezone")
    def validate_timezone(self, value: str, **kwargs: Any) -> None:
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError) as err:
            raise ValidationError("Unknown IANA timezone.") from err

    @validates("cover_image")
    def validate_cover_image(self, value: str | None, **kwargs: Any) -> None:
        if value is not None and not value.startswith(COVER_IMAGE_PREFIX):
            raise ValidationError(f"Cover images live under {COVER_IMAGE_PREFIX}.")

    @validates_schema
    def validate_ops(self, data: dict[str, Any], **kwargs: Any) -> None:
        try:
            ops = normalise_template_ops(data["ops"])
        except ValidationError as err:
            raise ValidationError(err.messages, field_name="ops") from err
        _check_offsets_fit(ops, data["duration_days"])

    @post_load
    def build(self, data: dict[str, Any], **kwargs: Any) -> PremadeTemplate:
        data["ops"] = normalise_template_ops(data["ops"])
        return PremadeTemplate(**data)

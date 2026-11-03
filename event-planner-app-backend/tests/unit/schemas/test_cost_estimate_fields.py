import pytest
from marshmallow import ValidationError
from src.schemas.accommodation_schema import AccommodationSchema
from src.schemas.event_schema import EventSchema
from src.schemas.wishlist_schema import WishlistItemSchema

EVENT = {
    "name": "Dinner",
    "address": "1 Rue Cler",
    "latitude": 48.85,
    "longitude": 2.3,
    "category": "Food",
    "start_at": "2026-08-21T18:00:00Z",
    "end_at": "2026-08-21T20:00:00Z",
}
ACCOMMODATION = {
    "name": "Hotel",
    "address": "2 Rue",
    "start_date": "2026-08-20",
    "end_date": "2026-08-22",
}
WISHLIST_ITEM = {"name": "Museum"}

CASES = [
    (EventSchema, EVENT),
    (AccommodationSchema, ACCOMMODATION),
    (WishlistItemSchema, WISHLIST_ITEM),
]


@pytest.mark.parametrize("schema, base", CASES)
def test_estimates_are_optional_and_nullable(schema, base):
    assert "estimated_cost_gbp" not in schema().load(base)
    loaded = schema().load({**base, "estimated_cost_gbp": None, "price_tier": None})
    assert loaded["estimated_cost_gbp"] is None
    assert loaded["price_tier"] is None


@pytest.mark.parametrize("schema, base", CASES)
def test_estimates_accept_camel_case_and_valid_values(schema, base):
    loaded = schema().load({**base, "estimatedCostGbp": 24.5, "priceTier": 3})
    assert loaded["estimated_cost_gbp"] == 24.5
    assert loaded["price_tier"] == 3


@pytest.mark.parametrize("schema, base", CASES)
def test_negative_cost_is_rejected(schema, base):
    with pytest.raises(ValidationError) as exc:
        schema().load({**base, "estimated_cost_gbp": -1})
    assert "estimated_cost_gbp" in exc.value.messages


@pytest.mark.parametrize("schema, base", CASES)
@pytest.mark.parametrize("tier", [0, 5, -1])
def test_price_tier_must_be_1_to_4(schema, base, tier):
    with pytest.raises(ValidationError) as exc:
        schema().load({**base, "price_tier": tier})
    assert "price_tier" in exc.value.messages

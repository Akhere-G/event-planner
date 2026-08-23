# tests/schemas/test_wishlist_schema.py

import pytest
from marshmallow import ValidationError
from src.schemas.wishlist_schema import (
    WishlistItemSchema,
    WishlistItemVoteSchema,
    WishlistSchema,
)


def test_wishlist_schema_loads_valid_data():
    result = WishlistSchema().load(
        {
            "itinerary_id": 1,
            "name": "Restaurants",
        }
    )

    assert result["itinerary_id"] == 1
    assert result["name"] == "Restaurants"


def test_wishlist_schema_requires_name():
    with pytest.raises(ValidationError) as exc_info:
        WishlistSchema().load({"itinerary_id": 1})

    assert "name" in exc_info.value.messages


def test_wishlist_item_schema_loads_valid_data():
    result = WishlistItemSchema().load(
        {
            "wishlist_id": 1,
            "name": "Le Jules Verne",
            "address": "Eiffel Tower",
            "latitude": 48.8584,
            "longitude": 2.2945,
            "description": "Restaurant",
            "place_id": "test-place-id",
        }
    )

    assert result["wishlist_id"] == 1
    assert result["name"] == "Le Jules Verne"
    assert result["address"] == "Eiffel Tower"
    assert result["latitude"] == 48.8584
    assert result["longitude"] == 2.2945
    assert result["description"] == "Restaurant"
    assert result["place_id"] == "test-place-id"


def test_wishlist_item_schema_requires_name():
    with pytest.raises(ValidationError) as exc_info:
        WishlistItemSchema().load({"wishlist_id": 1})

    assert "name" in exc_info.value.messages


def test_wishlist_item_schema_allows_optional_fields_to_be_none():
    result = WishlistItemSchema().load(
        {
            "wishlist_id": 1,
            "name": "Restaurant",
            "address": None,
            "latitude": None,
            "longitude": None,
            "description": None,
            "place_id": None,
        }
    )

    assert result["address"] is None
    assert result["latitude"] is None
    assert result["longitude"] is None
    assert result["description"] is None
    assert result["place_id"] is None


def test_wishlist_item_vote_schema_serialises_user(admin_user):
    result = WishlistItemVoteSchema().dump({"user": admin_user})

    assert result["user"]["id"] == admin_user.id
    assert result["user"]["username"] == admin_user.username
    assert result["user"]["email"] == admin_user.email


def test_wishlist_schema_serialises_items(wishlist):
    schema = WishlistSchema()

    result = schema.dump(wishlist)

    assert result["id"] == wishlist.id
    assert result["name"] == wishlist.name
    assert "items" in result
    assert isinstance(result["items"], list)


def test_wishlist_item_schema_serialises_votes(wishlist_item):
    schema = WishlistItemSchema()

    result = schema.dump(wishlist_item)

    assert "votes" in result
    assert isinstance(result["votes"], list)

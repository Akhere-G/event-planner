from typing import Any

from ..utils.location_utils import find_place_photo_url


def with_place_image(data: dict[str, Any], name: str, address: str) -> dict[str, Any]:
    """The data with image_url filled from the place's photo when none was given."""
    if data.get("image_url"):
        return data
    return {**data, "image_url": find_place_photo_url(name, address)}


def moves_without_image(data: dict[str, Any], current_address: str) -> bool:
    """Whether an update changes the address without choosing the new image."""
    new_address = data.get("address", current_address)
    return new_address != current_address and "image_url" not in data

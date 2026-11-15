from ..models import Itinerary, TripTemplate
from ..utils.unsplash_utils import find_destination_image


def fill_background_image(target: Itinerary | TripTemplate) -> None:
    """Set a photo of the target's destination, or clear it when none is found."""
    target.background_image = find_destination_image(target.destination)

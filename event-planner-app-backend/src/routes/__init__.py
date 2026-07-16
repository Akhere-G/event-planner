from .auth_routes import auth_bp
from .itinerary_routes import itinerary_bp
from .event_routes import event_bp
from .user_routes import user_bp
from .invite_routes import itinerary_invites_bp
from .user_invite_routes import user_invites_bp
from .ai_routes import ai_bp
from .wishlist_routes import wishlist_bp
from .accommodation_routes import accommodation_bp
from .packing_item_routes import packing_item_bp

__all__ = [
    "auth_bp",
    "itinerary_bp",
    "event_bp",
    "user_bp",
    "itinerary_invites_bp",
    "user_invites_bp",
    "ai_bp",
    "wishlist_bp",
    "accommodation_bp",
    "packing_item_bp",
]

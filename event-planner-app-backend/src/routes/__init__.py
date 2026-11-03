from .accommodation_routes import accommodation_bp
from .ai_routes import ai_bp
from .auth_routes import auth_bp
from .event_routes import event_bp
from .expense_routes import expense_bp
from .fx_routes import fx_bp
from .invite_routes import itinerary_invites_bp
from .itinerary_routes import itinerary_bp
from .me_routes import me_bp
from .notification_routes import notification_bp
from .packing_item_routes import packing_item_bp
from .user_invite_routes import user_invites_bp
from .user_routes import user_bp
from .wishlist_routes import wishlist_bp

__all__ = [
    "accommodation_bp",
    "ai_bp",
    "auth_bp",
    "event_bp",
    "expense_bp",
    "fx_bp",
    "itinerary_bp",
    "itinerary_invites_bp",
    "me_bp",
    "notification_bp",
    "packing_item_bp",
    "user_bp",
    "user_invites_bp",
    "wishlist_bp",
]


from .accommodation_routes import accommodation_bp
from .ai_routes import ai_bp
from .ai_task_routes import ai_task_bp, pending_ai_task_bp
from .auth_routes import auth_bp
from .change_set_routes import change_set_bp
from .event_routes import event_bp
from .expense_routes import expense_bp
from .flight_routes import flight_bp
from .invite_routes import itinerary_invites_bp
from .itinerary_routes import itinerary_bp
from .notification_routes import notification_bp
from .packing_item_routes import packing_item_bp
from .preferences_routes import preferences_bp
from .user_invite_routes import user_invites_bp
from .user_routes import user_bp
from .wishlist_routes import wishlist_bp

__all__ = [
    "accommodation_bp",
    "ai_bp",
    "ai_task_bp",
    "pending_ai_task_bp",
    "auth_bp",
    "change_set_bp",
    "event_bp",
    "expense_bp",
    "flight_bp",
    "itinerary_bp",
    "itinerary_invites_bp",
    "notification_bp",
    "packing_item_bp",
    "preferences_bp",
    "user_bp",
    "user_invites_bp",
    "wishlist_bp",
]

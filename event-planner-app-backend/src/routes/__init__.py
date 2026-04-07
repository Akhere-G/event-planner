from .auth_routes import auth_bp
from .itinerary_routes import itinerary_bp
from .event_routes import event_bp
from .user_routes import user_bp

__all__ = ["auth_bp", "itinerary_bp", "event_bp", "user_bp"]

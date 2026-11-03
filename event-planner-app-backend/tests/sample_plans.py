"""A canned whole-trip AI plan shared by the trip generation and builder tests."""

PLAN = {
    "events": [
        {
            "name": "Louvre",
            "description": "Museum",
            "address": "Rue de Rivoli, Paris",
            "start_at": "2026-08-01T10:00:00",
            "end_at": "2026-08-01T12:00:00",
            "category": "Museum",
            "reason": "Matches your museum interest.",
        },
        {  # outside the trip dates: dropped
            "name": "Elsewhere",
            "description": "x",
            "address": "y",
            "start_at": "2026-09-01T10:00:00",
            "end_at": "2026-09-01T12:00:00",
            "category": "Museum",
        },
        {  # end before start: dropped
            "name": "Bad",
            "description": "x",
            "address": "y",
            "start_at": "2026-08-02T12:00:00",
            "end_at": "2026-08-02T10:00:00",
            "category": "Museum",
        },
    ],
    "accommodations": [
        {
            "name": "Hotel Paris",
            "address": "1 Rue",
            "start_date": "2026-07-30",
            "end_date": "2026-08-03",
            "reason": "Central.",
        }
    ],
    "packing_items": [
        {"name": "Umbrella", "category": "Misc", "is_shared": True, "reason": "Showers."},
        {"name": 5},
    ],
    "wishlist_items": [{"name": "Seine cruise", "reason": "Relaxing."}],
}
PLACE = {"latitude": 48.86, "longitude": 2.33, "formatted_address": "Paris, France"}

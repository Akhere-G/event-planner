import json
from unittest.mock import patch

from src.ai_tasks.context import TaskContext
from src.ai_tasks.registry import get_handler

ITEMS = [
    {"name": "Rain jacket", "category": "Clothing", "is_shared": False},
    {"name": "First aid kit", "category": "Misc", "is_shared": True},
    {"name": 5, "category": "Misc", "is_shared": True},  # invalid: dropped
]


class Reports:
    def __init__(self):
        self.calls = []

    def report(self, text, current=None, total=None):
        self.calls.append(text)


def run_handler(itinerary, user_id):
    ctx = TaskContext(1, itinerary.id, user_id, {}, Reports())
    with patch(
        "src.services.ai_services.get_ai_response", return_value=json.dumps(ITEMS)
    ):
        return get_handler("generate_packing").run(ctx)


def test_items_become_packing_create_ops(itinerary):
    ops = run_handler(itinerary, user_id=7)

    assert [o["data"]["name"] for o in ops] == ["Rain jacket", "First aid kit"]
    assert all(o["op"] == "create" and o["entity"] == "packing_item" for o in ops)


def test_personal_items_stay_personal_for_a_signed_in_requester(itinerary):
    ops = run_handler(itinerary, user_id=7)

    assert [o["data"]["is_shared"] for o in ops] == [False, True]


def test_an_anonymous_requester_only_gets_shared_items(itinerary):
    ops = run_handler(itinerary, user_id=None)

    assert [o["data"]["is_shared"] for o in ops] == [True, True]

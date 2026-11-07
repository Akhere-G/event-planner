from src.utils.ai_output_validators import (
    extract_cost_estimate,
    validate_cost_estimates,
)


def test_extract_keeps_valid_values_and_rounds():
    assert extract_cost_estimate({"estimated_cost_gbp": 12.345, "price_tier": 2}) == {
        "estimated_cost_gbp": round(12.345, 2),
        "price_tier": 2,
    }


def test_extract_accepts_zero_cost():
    assert extract_cost_estimate({"estimated_cost_gbp": 0}) == {"estimated_cost_gbp": 0.0}


def test_extract_drops_bad_values_individually():
    assert extract_cost_estimate({"estimated_cost_gbp": -5, "price_tier": 3}) == {
        "price_tier": 3
    }
    assert extract_cost_estimate({"estimated_cost_gbp": "10", "price_tier": 9}) == {}
    assert extract_cost_estimate({"estimated_cost_gbp": True, "price_tier": True}) == {}
    assert extract_cost_estimate("nope") == {}


def test_validate_cost_estimates_filters_to_requested_items():
    requested = {("event", 1), ("accommodation", 2)}
    result = validate_cost_estimates(
        [
            {"entity": "event", "id": 1, "estimated_cost_gbp": 10, "reason": "r"},
            {"entity": "event", "id": 1, "estimated_cost_gbp": 99},  # duplicate
            {"entity": "event", "id": 7, "estimated_cost_gbp": 10},  # not requested
            {"entity": "accommodation", "id": 2},  # no usable estimate
            {"entity": "packing_item", "id": 2, "price_tier": 1},  # bad entity
            "junk",
        ],
        requested,
    )
    assert result == [
        {
            "entity": "event",
            "id": 1,
            "estimated_cost_gbp": 10.0,
            "reason": "r",
        }
    ]


def test_validate_cost_estimates_requires_a_list():
    import pytest

    with pytest.raises(ValueError):
        validate_cost_estimates({"a": 1}, set())

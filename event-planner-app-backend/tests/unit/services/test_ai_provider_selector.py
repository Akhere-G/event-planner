import pytest
from src.exceptions import AIProviderError
from src.services.ai_providers.selector import generate_with_fallback
from tests.fakes import FakeAiProvider


def test_returns_the_first_providers_answer():
    first = FakeAiProvider("first", text="from first")
    second = FakeAiProvider("second", text="from second")

    assert generate_with_fallback("prompt", [first, second]) == "from first"
    assert second.prompts == []


def test_falls_through_to_the_next_provider_when_one_fails():
    first = FakeAiProvider("first", error=RuntimeError("down"))
    second = FakeAiProvider("second", text="from second")

    assert generate_with_fallback("prompt", [first, second]) == "from second"
    assert first.prompts == ["prompt"]
    assert second.prompts == ["prompt"]


def test_falls_through_to_the_next_provider_on_an_empty_response():
    first = FakeAiProvider("first", text="")
    second = FakeAiProvider("second", text="from second")

    assert generate_with_fallback("prompt", [first, second]) == "from second"


def test_skips_an_unavailable_provider_without_calling_it():
    first = FakeAiProvider("first", text="from first", available=False)
    second = FakeAiProvider("second", text="from second")

    assert generate_with_fallback("prompt", [first, second]) == "from second"
    assert first.prompts == []


def test_tries_providers_in_the_order_given():
    first = FakeAiProvider("first", error=RuntimeError("down"))
    second = FakeAiProvider("second", text="")
    third = FakeAiProvider("third", text="from third")

    assert generate_with_fallback("prompt", [first, second, third]) == "from third"


@pytest.mark.parametrize(
    "providers",
    [
        [],
        [FakeAiProvider("off", available=False)],
        [FakeAiProvider("empty", text="")],
        [FakeAiProvider("broken", error=RuntimeError("down"))],
        [
            FakeAiProvider("broken", error=RuntimeError("down")),
            FakeAiProvider("empty", text=""),
            FakeAiProvider("off", available=False),
        ],
    ],
)
def test_raises_when_no_provider_answers(providers):
    with pytest.raises(AIProviderError):
        generate_with_fallback("prompt", providers)

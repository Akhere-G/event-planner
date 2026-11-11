from src.services.ai_providers import AiProviderFactory
from src.services.ai_providers.bedrock import BedrockProvider
from src.services.ai_providers.gemini import GeminiProvider
from src.services.ai_providers.groq import GroqProvider


def test_providers_are_tried_in_the_order_gemini_groq_bedrock():
    providers = AiProviderFactory.create_all()

    assert [type(provider) for provider in providers] == [
        GeminiProvider,
        GroqProvider,
        BedrockProvider,
    ]


def test_a_provider_added_to_the_registry_is_created(monkeypatch):
    class FourthProvider(GeminiProvider):
        name = "Fourth"

    monkeypatch.setattr(
        AiProviderFactory,
        "PROVIDERS",
        [*AiProviderFactory.PROVIDERS, FourthProvider],
    )

    assert type(AiProviderFactory.create_all()[-1]) is FourthProvider

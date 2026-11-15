from unittest.mock import MagicMock, patch

from src.models import BackgroundImage
from src.utils import unsplash_utils

PHOTO = {
    "urls": {"regular": "https://images.unsplash.com/photo-1"},
    "user": {"name": "Aiko", "links": {"html": "https://unsplash.com/@aiko"}},
    "links": {"download_location": "https://api.unsplash.com/photos/1/download"},
}


def _search_response(results: list[dict]) -> MagicMock:
    response = MagicMock()
    response.json.return_value = {"results": results}
    return response


def test_destination_image_is_the_first_result_with_its_credit():
    with patch.object(
        unsplash_utils.requests, "get", return_value=_search_response([PHOTO])
    ) as get:
        image = unsplash_utils.find_destination_image("Tokyo, Japan")

    assert image == BackgroundImage(
        url="https://images.unsplash.com/photo-1",
        credit_name="Aiko",
        credit_url="https://unsplash.com/@aiko",
    )
    assert get.call_args_list[0].kwargs["params"]["query"] == "Tokyo, Japan"
    assert get.call_args_list[1].args == (PHOTO["links"]["download_location"],)


def test_a_destination_without_photos_has_no_image():
    with patch.object(
        unsplash_utils.requests, "get", return_value=_search_response([])
    ):
        assert unsplash_utils.find_destination_image("Nowhere") is None


def test_unsplash_failures_have_no_image():
    with patch.object(unsplash_utils.requests, "get", side_effect=Exception("429")):
        assert unsplash_utils.find_destination_image("Tokyo") is None

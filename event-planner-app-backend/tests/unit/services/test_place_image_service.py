from src.services.place_image_service import moves_without_image, with_place_image


def test_a_given_image_is_kept(place_photos):
    place_photos["Louvre"] = "https://photo/louvre"
    data = {"image_url": "https://photo/mine"}

    assert with_place_image(data, "Louvre", "Paris") == data


def test_a_missing_image_is_looked_up(place_photos):
    place_photos["Louvre"] = "https://photo/louvre"

    data = with_place_image({"image_url": None}, "Louvre", "Paris")

    assert data["image_url"] == "https://photo/louvre"


def test_a_new_address_without_an_image_needs_one():
    assert moves_without_image({"address": "New St"}, "Old St")


def test_a_new_address_with_a_chosen_image_does_not():
    assert not moves_without_image({"address": "New St", "image_url": None}, "Old St")


def test_the_same_address_does_not():
    assert not moves_without_image({"address": "Old St"}, "Old St")
    assert not moves_without_image({"name": "Renamed"}, "Old St")

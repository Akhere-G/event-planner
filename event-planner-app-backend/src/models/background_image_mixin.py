from dataclasses import dataclass

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column


@dataclass(frozen=True)
class BackgroundImage:
    """A destination photo with the photographer credit Unsplash requires."""

    url: str
    credit_name: str
    credit_url: str


class BackgroundImageMixin:
    background_image_url: Mapped[str | None] = mapped_column(
        String(2048), nullable=True
    )
    background_image_credit_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    background_image_credit_url: Mapped[str | None] = mapped_column(
        String(2048), nullable=True
    )

    @property
    def background_image(self) -> BackgroundImage | None:
        if self.background_image_url is None:
            return None
        return BackgroundImage(
            url=self.background_image_url,
            credit_name=self.background_image_credit_name,
            credit_url=self.background_image_credit_url,
        )

    @background_image.setter
    def background_image(self, image: BackgroundImage | None) -> None:
        self.background_image_url = image.url if image else None
        self.background_image_credit_name = image.credit_name if image else None
        self.background_image_credit_url = image.credit_url if image else None

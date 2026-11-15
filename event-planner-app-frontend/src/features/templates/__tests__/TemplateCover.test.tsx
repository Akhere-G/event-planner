import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TemplateCover from "../components/TemplateCover";
import { summary } from "./fixtures";

const UNSPLASH_PHOTO = {
  backgroundImageUrl: "https://images.unsplash.com/paris",
  backgroundImageCreditName: "Amelie",
  backgroundImageCreditUrl: "https://unsplash.com/@amelie",
};

describe("TemplateCover", () => {
  it("prefers the curated cover and credits no one", () => {
    render(
      <TemplateCover
        template={summary({
          coverImage: "/template-images/paris.jpg",
          ...UNSPLASH_PHOTO,
        })}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/template-images/paris.jpg",
    );
    expect(screen.queryByText(/Photo by/)).not.toBeInTheDocument();
  });

  it("falls back to the Unsplash photo with its photographer credit", () => {
    render(<TemplateCover template={summary(UNSPLASH_PHOTO)} />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://images.unsplash.com/paris",
    );
    expect(screen.getByRole("link", { name: "Amelie" })).toHaveAttribute(
      "href",
      "https://unsplash.com/@amelie?utm_source=triptrack&utm_medium=referral",
    );
  });
});

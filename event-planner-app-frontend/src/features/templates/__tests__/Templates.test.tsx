import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import Templates from "../../../pages/Templates";
import type { TemplatePin } from "../types";
import { ok, pin, summary } from "./fixtures";

vi.mock("../components/TemplatePinsMap", () => ({
  default: ({ pins }: { pins: TemplatePin[] }) => (
    <div data-testid="map">{pins.map((p) => p.slug).join(",")}</div>
  ),
}));

const PARIS = summary();
const TOKYO = summary({
  slug: "tokyo-1-week-itinerary",
  title: "Tokyo in a week",
  destination: "Tokyo, Japan",
  region: "Asia",
  durationDays: 7,
});

function setup() {
  const api = mockApi({
    "GET /templates": (request: Request) => {
      const regions = new URL(request.url).searchParams.get("regions");
      const templates = [PARIS, TOKYO].filter(
        (t) => !regions || regions.split(",").includes(t.region),
      );
      return ok({ templates, total: templates.length, hasMore: false });
    },
    "GET /templates/pins": ok([
      pin(),
      pin({
        slug: TOKYO.slug,
        title: TOKYO.title,
        destination: TOKYO.destination,
        region: "Asia",
      }),
    ]),
  });
  renderWithProviders(<Templates />, { route: "/templates" });
  return api;
}

describe("Templates page", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("lists every template and pins them all on the map", async () => {
    setup();

    expect(await screen.findByText("Paris in 4 days")).toBeVisible();
    expect(screen.getByText("Tokyo in a week")).toBeVisible();
    expect(await screen.findByText(/paris-4-days.*tokyo-1-week/)).toBeVisible();
  });

  it("offers a toggle per region that has templates, with counts", async () => {
    setup();

    expect(
      await screen.findByRole("button", { name: /Asia/ }),
    ).toHaveTextContent("Asia1");
    expect(screen.getByRole("button", { name: /Europe/ })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Oceania/ }),
    ).not.toBeInTheDocument();
  });

  it("filters the list and the map by the selected regions", async () => {
    const user = userEvent.setup();
    const { requests } = setup();
    await screen.findByText("Tokyo in a week");

    await user.click(screen.getByRole("button", { name: /Asia/ }));

    expect(await screen.findByRole("button", { name: /Asia/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await vi.waitFor(() =>
      expect(screen.queryByText("Paris in 4 days")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("map")).toHaveTextContent(
      "tokyo-1-week-itinerary",
    );
    expect(screen.getByTestId("map")).not.toHaveTextContent("paris");
    expect(requests.some((r) => r.path === "/templates")).toBe(true);
  });

  it("shows everything again when the last region is deselected", async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByText("Tokyo in a week");

    await user.click(screen.getByRole("button", { name: /Asia/ }));
    await vi.waitFor(() =>
      expect(screen.queryByText("Paris in 4 days")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: /Asia/ }));

    expect(await screen.findByText("Paris in 4 days")).toBeVisible();
  });
});

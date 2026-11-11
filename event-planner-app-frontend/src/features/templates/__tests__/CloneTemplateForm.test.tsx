import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import CloneTemplateForm from "../components/CloneTemplateForm";
import { detail, ok } from "./fixtures";

function setup(routes: Record<string, unknown> = {}) {
  const api = mockApi(routes);
  renderWithProviders(
    <>
      <Toaster />
      <Routes>
        <Route
          path="/templates/:slug/clone"
          element={<CloneTemplateForm template={detail()} />}
        />
        <Route path="/trips/:tripId" element={<p>Trip page</p>} />
      </Routes>
    </>,
    { route: "/templates/paris-4-days-itinerary/clone" },
  );
  return api;
}

describe("CloneTemplateForm", () => {
  it("clones onto the chosen start date and opens the new trip", async () => {
    const user = userEvent.setup();
    const { requests } = setup({
      "POST /templates/paris-4-days-itinerary/clone": ok({
        id: 42,
        name: "Paris in 4 days",
        startDate: "2027-03-27",
        endDate: "2027-03-30",
      }),
    });

    const input = screen.getByLabelText("Start date");
    await user.clear(input);
    await user.type(input, "2027-03-27");
    expect(await screen.findByText(/Ends on Tue 30 Mar 2027/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Trip page")).toBeInTheDocument();
    expect(requests[0].body).toEqual({ startDate: "2027-03-27" });
    expect(await screen.findByText(/Created "Paris in 4 days"/)).toBeVisible();
  });

  it("requires a start date without calling the API", async () => {
    const user = userEvent.setup();
    const { requests } = setup();

    await user.clear(screen.getByLabelText("Start date"));
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Start date is required.")).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it("shows the API error in a toast and stays on the form", async () => {
    const user = userEvent.setup();
    setup({
      "POST /templates/paris-4-days-itinerary/clone": new Response(
        JSON.stringify({ success: false, message: "Template not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      ),
    });

    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Template not found.")).toBeVisible();
    expect(screen.queryByText("Trip page")).not.toBeInTheDocument();
  });
});

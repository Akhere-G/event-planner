import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { Route, Routes } from "react-router";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockFetchError, mockFetchOnce } from "../../../test-utils/mockFetch";
import CloneTemplateModal from "../components/CloneTemplateModal";

function renderModal(onOpenChange = vi.fn()) {
  renderWithProviders(
    <>
      <Toaster />
      <Routes>
        <Route
          path="/templates/paris"
          element={
            <CloneTemplateModal
              open
              onOpenChange={onOpenChange}
              slug="paris"
              title="Paris in 3 days"
              durationDays={3}
            />
          }
        />
        <Route path="/trips/:id" element={<p>Trip page</p>} />
      </Routes>
    </>,
    { route: "/templates/paris" },
  );
  return { onOpenChange };
}

describe("CloneTemplateModal", () => {
  it("clones with the chosen start date and opens the new trip", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchOnce(
      { success: true, data: { id: 42, name: "Paris in 3 days" } },
      201,
    );
    const { onOpenChange } = renderModal();

    const input = screen.getByLabelText("Start date");
    await user.clear(input);
    await user.type(input, "2027-01-10");
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Trip page")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toContain("/templates/paris/clone");
    expect(await request.json()).toEqual({ startDate: "2027-01-10" });
    expect(
      await screen.findByText(/Created "Paris in 3 days"/),
    ).toBeInTheDocument();
  });

  it("requires a start date", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchOnce({ success: true });
    renderModal();

    await user.clear(screen.getByLabelText("Start date"));
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(
      await screen.findByText("Start date is required."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the API error in a toast and stays open", async () => {
    const user = userEvent.setup();
    mockFetchError("Template not found.", 404);
    const { onOpenChange } = renderModal();

    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Template not found.")).toBeInTheDocument();
    await waitFor(() => expect(onOpenChange).not.toHaveBeenCalledWith(false));
  });
});

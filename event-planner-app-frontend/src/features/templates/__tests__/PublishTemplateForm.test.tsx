import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import type { Trip } from "../../trips/types";
import PublishTemplateForm from "../components/PublishTemplateForm";
import type { PublishStatus } from "../types";
import { ok } from "./fixtures";

const TRIP = { id: 5, name: "Paris weekend", description: "Sunny" } as Trip;

function setup(status: PublishStatus, routes: Record<string, unknown> = {}) {
  const api = mockApi(routes);
  const onDone = vi.fn();
  renderWithProviders(
    <>
      <Toaster />
      <Dialog open>
        <DialogContent>
          <PublishTemplateForm trip={TRIP} status={status} onDone={onDone} />
        </DialogContent>
      </Dialog>
    </>,
  );
  return { ...api, onDone };
}

describe("PublishTemplateForm", () => {
  it("requires a region before publishing", async () => {
    const user = userEvent.setup();
    const { requests } = setup({ isPublished: false });

    await user.click(screen.getByRole("button", { name: "Publish" }));

    expect(await screen.findByText("Choose a region.")).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it("publishes the trip with its region and details", async () => {
    const user = userEvent.setup();
    const { requests, onDone } = setup(
      { isPublished: false },
      { "POST /itineraries/5/publish": ok({ isPublished: true, slug: "abc" }) },
    );

    await user.selectOptions(screen.getByLabelText("Region"), "Europe");
    await user.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(requests[0].body).toEqual({
      title: "Paris weekend",
      description: "Sunny",
      region: "Europe",
    });
    expect(await screen.findByText("Template published.")).toBeVisible();
  });

  it("offers to unpublish a published trip", async () => {
    const user = userEvent.setup();
    const { requests, onDone } = setup(
      {
        isPublished: true,
        slug: "abc",
        region: "Europe",
        title: "Paris weekend",
        cloneCount: 2,
      },
      { "DELETE /itineraries/5/publish": ok({ isPublished: false }) },
    );

    expect(screen.getByLabelText("Region")).toHaveValue("Europe");
    await user.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(requests[0].method).toBe("DELETE");
    expect(await screen.findByText("Template unpublished.")).toBeVisible();
  });
});

import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import TaskProgressCards from "../components/TaskProgressCards";
import { aiTask, ok } from "./fixtures";

function setup(tasks: ReturnType<typeof aiTask>[], extra = {}) {
  const api = mockApi({ "GET /itineraries/5/ai-tasks": ok(tasks), ...extra });
  renderWithProviders(
    <>
      <Toaster />
      <TaskProgressCards tripId={5} />
    </>,
  );
  return api;
}

describe("TaskProgressCards", () => {
  it("shows what a running task is doing", async () => {
    setup([
      aiTask({
        status: "running",
        progressText: "Optimising day",
        progressCurrent: 2,
        progressTotal: 4,
      }),
    ]);

    expect(await screen.findByText("Optimising days")).toBeInTheDocument();
    expect(screen.getByText("Optimising day 2/4")).toBeInTheDocument();
  });

  it("says a queued task is waiting", async () => {
    setup([aiTask({ status: "queued" })]);

    expect(await screen.findByText("Waiting to start")).toBeInTheDocument();
  });

  it("cancels a running task", async () => {
    const user = userEvent.setup();
    const { requests } = setup([aiTask({ status: "running" })], {
      "POST /itineraries/5/ai-tasks/1/cancel": ok({}),
    });

    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    await screen.findByText("Optimise days cancelled.");
    expect(requests.some((r) => r.path.endsWith("/cancel"))).toBe(true);
  });

  it("offers retry and dismiss for a failed task", async () => {
    const user = userEvent.setup();
    const { requests } = setup(
      [aiTask({ status: "failed", errorMessage: "The AI service was unavailable." })],
      { "POST /itineraries/5/ai-tasks/1/retry": ok({}) },
    );

    expect(
      await screen.findByText("The AI service was unavailable."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("Optimise days started again.");
    expect(requests.some((r) => r.path.endsWith("/retry"))).toBe(true);
  });

  it("lets the user come back to a proposal they postponed", async () => {
    setup([aiTask({ status: "ready", opCount: 3 })]);

    expect(await screen.findByText("Optimise days is ready")).toBeInTheDocument();
    expect(screen.getByText("3 changes to review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument();
  });

  it("renders nothing when there are no tasks", async () => {
    const { fetchMock } = setup([]);

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalled();
    expect(screen.queryByRole("list", { name: "AI tasks" })).not.toBeInTheDocument();
  });
});

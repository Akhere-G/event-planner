import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OptimiseDayForm from "../components/OptimiseDayForm";
import type { Event } from "../../events/types";
import { aiTask } from "./fixtures";

const event = (id: number, name: string, day: string): Event => ({
  id,
  name,
  address: "",
  latitude: 0,
  longitude: 0,
  startAt: `${day} 10:00`,
  endAt: `${day} 11:00`,
  category: "general",
});

const EVENTS = [
  event(1, "Louvre", "2026-08-02"),
  event(2, "Eiffel Tower", "2026-08-03"),
];

function setup(onSubmit = vi.fn(), onCancel = vi.fn()) {
  render(
    <OptimiseDayForm
      tripStart="2026-08-01"
      tripEnd="2026-08-03"
      initialDate="2026-08-02"
      events={EVENTS}
      defaultPace="balanced"
      onCancel={onCancel}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, onCancel, user: userEvent.setup() };
}

const openMoreOptions = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: /More options/ }));

describe("OptimiseDayForm", () => {
  it("starts with the clicked day, minimise travel and the trip's pace", async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole("button", { name: "Optimise" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({
      dates: ["2026-08-02"],
      goals: ["minimise_travel"],
      pace: "balanced",
      dayStart: null,
      dayEnd: null,
      lockedEventIds: [],
      allowAddRemove: false,
      instructions: "",
    });
  });

  it("supports several non-consecutive days", async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Day 1,/ }));
    await user.click(screen.getByRole("button", { name: /^Day 3,/ }));
    await user.click(screen.getByRole("button", { name: /^Day 2,/ })); // untick
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].dates).toEqual(["2026-08-01", "2026-08-03"]);
  });

  it("needs at least one day", async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Day 2,/ }));
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    expect(await screen.findByText("Choose at least one day.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sends goals, window, locks, add/remove and instructions", async () => {
    const { onSubmit, user } = setup();

    await openMoreOptions(user);
    await user.click(screen.getByRole("checkbox", { name: /Respect opening hours/ }));
    await user.type(screen.getByLabelText("Day starts"), "09:00");
    await user.type(screen.getByLabelText("Day ends"), "21:00");
    await user.click(screen.getByRole("checkbox", { name: /Louvre/ }));
    await user.click(screen.getByRole("switch", { name: "Allow event changes" }));
    await user.type(screen.getByLabelText(/Anything else/), "Long lunch please");
    await user.click(screen.getByRole("button", { name: "Relaxed" }));
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({
      dates: ["2026-08-02"],
      goals: ["minimise_travel", "respect_opening_hours"],
      pace: "relaxed",
      dayStart: "09:00",
      dayEnd: "21:00",
      lockedEventIds: [1],
      allowAddRemove: true,
      instructions: "Long lunch please",
    });
  });

  it("only offers events from the chosen days to lock", async () => {
    const { user } = setup();

    await openMoreOptions(user);
    expect(screen.queryByRole("checkbox", { name: /Eiffel Tower/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: /^Day 3,/ }));

    expect(screen.getByRole("checkbox", { name: /Eiffel Tower/ })).toBeInTheDocument();
  });

  it("drops locks for days that were unticked afterwards", async () => {
    const { onSubmit, user } = setup();

    await openMoreOptions(user);
    await user.click(screen.getByRole("button", { name: /^Day 3,/ }));
    await user.click(screen.getByRole("checkbox", { name: /Eiffel Tower/ }));
    await user.click(screen.getByRole("button", { name: /^Day 3,/ }));
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].lockedEventIds).toEqual([]);
  });

  it("rejects a day that ends before it starts", async () => {
    const { onSubmit, user } = setup();

    await openMoreOptions(user);
    await user.type(screen.getByLabelText("Day starts"), "18:00");
    await user.type(screen.getByLabelText("Day ends"), "09:00");
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    expect(
      await screen.findByText("The day must end after it starts."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("selects and clears every day", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Select all" }));
    expect(screen.getByText("3 of 3 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("0 of 3 selected")).toBeInTheDocument();
  });

  it("summarises the request and counts the options set", async () => {
    const { user } = setup();

    expect(
      screen.getByText(/Optimising 1 day · Minimise travel · balanced pace/),
    ).toBeInTheDocument();
    expect(screen.getByText("1 set")).toBeInTheDocument();

    await openMoreOptions(user);
    await user.click(screen.getByRole("checkbox", { name: /Louvre/ }));

    expect(screen.getByText("Locked: 1")).toBeInTheDocument();
    expect(screen.getByText("2 set")).toBeInTheDocument();
    expect(screen.getByText(/1 event locked/)).toBeInTheDocument();
  });

  it("warns when the AI may add or remove events", async () => {
    const { user } = setup();

    await openMoreOptions(user);
    expect(screen.queryByText(/You'll review every change/)).toBeNull();
    await user.click(screen.getByRole("switch", { name: "Allow event changes" }));

    expect(screen.getByText(/You'll review every change/)).toBeInTheDocument();
  });

  it("disables days that already have an optimise task running", () => {
    render(
      <OptimiseDayForm
        tripStart="2026-08-01"
        tripEnd="2026-08-03"
        initialDate="2026-08-02"
        events={EVENTS}
        tasks={[
          aiTask({
            type: "optimise_day",
            status: "running",
            params: { dates: ["2026-08-03"] },
          }),
        ]}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /^Day 3,/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^Day 1,/ })).toBeEnabled();
  });

  it("cancels without submitting", async () => {
    const { onSubmit, onCancel, user } = setup();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

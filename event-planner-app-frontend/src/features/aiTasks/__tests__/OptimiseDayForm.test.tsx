import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OptimiseDayForm, {
  OPTIMISE_FORM_ID,
} from "../components/OptimiseDayForm";
import type { Event } from "../../events/types";

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

function setup(onSubmit = vi.fn()) {
  render(
    <>
      <OptimiseDayForm
        tripStart="2026-08-01"
        tripEnd="2026-08-03"
        initialDate="2026-08-02"
        events={EVENTS}
        defaultPace="balanced"
        onSubmit={onSubmit}
      />
      <button type="submit" form={OPTIMISE_FORM_ID}>
        Optimise
      </button>
    </>,
  );
  return { onSubmit, user: userEvent.setup() };
}

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

    await user.click(screen.getByRole("button", { name: /Day 1 ·/ }));
    await user.click(screen.getByRole("button", { name: /Day 3 ·/ }));
    await user.click(screen.getByRole("button", { name: /Day 2 ·/ })); // untick
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].dates).toEqual(["2026-08-01", "2026-08-03"]);
  });

  it("needs at least one day", async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole("button", { name: /Day 2 ·/ }));
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    expect(await screen.findByText("Choose at least one day.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sends goals, window, locks, add/remove and instructions", async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole("checkbox", { name: /Respect opening hours/ }));
    await user.type(screen.getByLabelText("Day starts"), "09:00");
    await user.type(screen.getByLabelText("Day ends"), "21:00");
    await user.click(screen.getByRole("checkbox", { name: /Louvre/ }));
    await user.click(screen.getByRole("checkbox", { name: /add or remove events/ }));
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

    expect(screen.queryByRole("checkbox", { name: /Eiffel Tower/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: /Day 3 ·/ }));

    expect(screen.getByRole("checkbox", { name: /Eiffel Tower/ })).toBeInTheDocument();
  });

  it("drops locks for days that were unticked afterwards", async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole("button", { name: /Day 3 ·/ }));
    await user.click(screen.getByRole("checkbox", { name: /Eiffel Tower/ }));
    await user.click(screen.getByRole("button", { name: /Day 3 ·/ }));
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].lockedEventIds).toEqual([]);
  });

  it("rejects a day that ends before it starts", async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText("Day starts"), "18:00");
    await user.type(screen.getByLabelText("Day ends"), "09:00");
    await user.click(screen.getByRole("button", { name: "Optimise" }));

    expect(
      await screen.findByText("The day must end after it starts."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

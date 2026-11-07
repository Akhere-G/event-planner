import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import mapReducer, {
  syncDays,
  toggleDayOpen,
} from "../../maps/service/mapSlice";
import type { Day, Event } from "../types";
import { getDaysWithFilter, mergeDays } from "../utils";

const event = (id: number, startAt: string): Event => ({
  id,
  name: `Event ${id}`,
  address: "",
  latitude: 0,
  longitude: 0,
  startAt,
  endAt: startAt,
  category: "food",
});

const day = (date: string, overrides: Partial<Day> = {}): Day => ({
  date,
  events: [],
  day: 1,
  show: true,
  isOpen: false,
  ...overrides,
});

describe("mergeDays", () => {
  it("keeps open and hidden state for days that still exist", () => {
    const existing = [
      day("2026-08-01", { isOpen: true }),
      day("2026-08-02", { show: false }),
    ];
    const incoming = [day("2026-08-01"), day("2026-08-02")];

    const merged = mergeDays(existing, incoming);

    expect(merged[0].isOpen).toBe(true);
    expect(merged[1].show).toBe(false);
  });

  it("takes events from the incoming days", () => {
    const added = event(1, "2026-08-01 10:00");
    const merged = mergeDays(
      [day("2026-08-01", { isOpen: true })],
      [day("2026-08-01", { events: [added] })],
    );

    expect(merged[0].events).toEqual([added]);
    expect(merged[0].isOpen).toBe(true);
  });

  it("uses incoming defaults for days it has not seen", () => {
    const merged = mergeDays(
      [day("2026-08-01")],
      [day("2026-08-01"), day("2026-08-02", { isOpen: true })],
    );

    expect(merged[1].isOpen).toBe(true);
  });

  it("drops days that no longer exist", () => {
    const merged = mergeDays(
      [day("2026-08-01"), day("2026-08-02")],
      [day("2026-08-01")],
    );

    expect(merged.map((d) => d.date)).toEqual(["2026-08-01"]);
  });

  it("returns the same object for days whose events did not change", () => {
    const shared = event(1, "2026-08-01 10:00");
    const existing = [day("2026-08-01", { events: [shared], isOpen: true })];

    const merged = mergeDays(existing, [
      day("2026-08-01", { events: [shared] }),
    ]);

    expect(merged[0]).toBe(existing[0]);
  });
});

describe("syncDays", () => {
  const makeStore = () => configureStore({ reducer: { map: mapReducer } });
  const build = (events: Event[]) =>
    getDaysWithFilter(events, "2026-08-01", "2026-08-03", "2026-08-01");

  it("applies new events without collapsing a day the user opened", () => {
    const store = makeStore();
    store.dispatch(syncDays(build([])));
    store.dispatch(toggleDayOpen("2026-08-02"));
    store.dispatch(toggleDayOpen("2026-08-01"));

    store.dispatch(syncDays(build([event(1, "2026-08-02 09:00")])));

    const { days } = store.getState().map;
    expect(days.map((d) => d.isOpen)).toEqual([false, true, false]);
    expect(days[1].events).toHaveLength(1);
  });
});

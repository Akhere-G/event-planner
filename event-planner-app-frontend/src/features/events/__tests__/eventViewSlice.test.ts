import { afterEach, describe, expect, it, vi } from "vitest";

const importSlice = async () => {
  vi.resetModules();
  return import("../service/eventViewSlice");
};

describe("eventViewSlice", () => {
  afterEach(() => localStorage.clear());

  it("defaults to the detailed view", async () => {
    const { eventViewSlice } = await importSlice();

    expect(eventViewSlice.getInitialState().mode).toBe("detailed");
  });

  it("starts from the stored view", async () => {
    localStorage.setItem("eventViewMode", "compact");
    const { eventViewSlice } = await importSlice();

    expect(eventViewSlice.getInitialState().mode).toBe("compact");
  });

  it("remembers the chosen view", async () => {
    const { eventViewSlice, setEventViewMode } = await importSlice();

    const state = eventViewSlice.reducer(
      { mode: "detailed" },
      setEventViewMode("compact"),
    );

    expect(state.mode).toBe("compact");
    expect(localStorage.getItem("eventViewMode")).toBe("compact");
  });
});

import { describe, expect, it } from "vitest";
import { dayLabel, durationLabel, toggleRegion } from "../utils";

describe("template utils", () => {
  it("labels zero-based day offsets from day 1", () => {
    expect(dayLabel(0)).toBe("Day 1");
    expect(dayLabel(6)).toBe("Day 7");
  });

  it("pluralises durations", () => {
    expect(durationLabel(1)).toBe("1 day");
    expect(durationLabel(4)).toBe("4 days");
  });

  it("adds a region that is not selected and removes one that is", () => {
    expect(toggleRegion([], "Asia")).toEqual(["Asia"]);
    expect(toggleRegion(["Asia"], "Europe")).toEqual(["Asia", "Europe"]);
    expect(toggleRegion(["Asia", "Europe"], "Asia")).toEqual(["Europe"]);
  });
});

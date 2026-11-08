import { describe, expect, it } from "vitest";
import {
  activeTaskForDay,
  describeOptimiseRequest,
  isActive,
  progressFraction,
  taskDays,
} from "../utils";
import { aiTask } from "./fixtures";

describe("aiTask utils", () => {
  it("treats queued and running as active", () => {
    expect(isActive(aiTask({ status: "queued" }))).toBe(true);
    expect(isActive(aiTask({ status: "running" }))).toBe(true);
    expect(isActive(aiTask({ status: "ready" }))).toBe(false);
  });

  it("knows which days each kind of task works on", () => {
    expect(
      taskDays(aiTask({ type: "fill_day", params: { date: "2026-08-02" } })),
    ).toEqual(["2026-08-02"]);
    expect(
      taskDays(aiTask({ params: { dates: ["2026-08-01", "2026-08-03"] } })),
    ).toEqual(["2026-08-01", "2026-08-03"]);
    expect(taskDays(aiTask({ type: "generate_trip", params: {} }))).toEqual([]);
  });

  it("finds the running task that covers a day", () => {
    const tasks = [
      aiTask({ id: 1, params: { dates: ["2026-08-01"] } }),
      aiTask({ id: 2, params: { dates: ["2026-08-02", "2026-08-03"] } }),
      aiTask({ id: 3, status: "ready", params: { dates: ["2026-08-04"] } }),
    ];

    expect(activeTaskForDay(tasks, "optimise_day", "2026-08-03")?.id).toBe(2);
    expect(activeTaskForDay(tasks, "optimise_day", "2026-08-04")).toBeUndefined();
    expect(activeTaskForDay(tasks, "fill_day", "2026-08-03")).toBeUndefined();
  });

  it("works out progress only when there is a total", () => {
    expect(progressFraction(aiTask())).toBeNull();
    expect(
      progressFraction(aiTask({ progressCurrent: 1, progressTotal: 4 })),
    ).toBe(0.25);
  });
});

describe("describeOptimiseRequest", () => {
  const base = {
    dayCount: 1,
    goalLabels: ["Minimise travel"],
    pace: "",
    dayStart: "",
    dayEnd: "",
    lockedCount: 0,
    allowAddRemove: false,
  };

  it("summarises the basics", () => {
    expect(describeOptimiseRequest(base)).toBe(
      "Optimising 1 day · Minimise travel",
    );
  });

  it("pluralises and lists what is set", () => {
    expect(
      describeOptimiseRequest({
        ...base,
        dayCount: 3,
        goalLabels: ["Minimise travel", "Group by neighbourhood"],
        pace: "relaxed",
        dayStart: "09:00",
        dayEnd: "",
        lockedCount: 2,
        allowAddRemove: true,
      }),
    ).toBe(
      "Optimising 3 days · Minimise travel + Group by neighbourhood · relaxed pace · 09:00–any · 2 events locked · may add or remove events",
    );
  });

  it("copes with no days and no goals, and counts many goals", () => {
    expect(
      describeOptimiseRequest({ ...base, dayCount: 0, goalLabels: [] }),
    ).toBe("No days chosen · No specific goal");
    expect(
      describeOptimiseRequest({ ...base, goalLabels: ["a", "b", "c"] }),
    ).toBe("Optimising 1 day · 3 goals");
  });
});

import { describe, expect, it } from "vitest";
import type { Event } from "../../events/types";
import type { ChangeOp } from "../types";
import { describeChangeOp, summariseApplied } from "../utils";

const timezone = "Europe/Paris";

const existing: Event = {
  id: 7,
  name: "Louvre",
  address: "Rue de Rivoli",
  latitude: 48.86,
  longitude: 2.33,
  startAt: "2026-08-20 10:00",
  endAt: "2026-08-20 12:00",
  category: "Museum",
};

describe("describeChangeOp", () => {
  it("describes a created event in the trip timezone", () => {
    const op: ChangeOp = {
      op: "create",
      entity: "event",
      data: {
        name: "Dinner",
        address: "1 Rue Cler",
        startAt: "2026-08-20T17:00:00Z",
        endAt: "2026-08-20T19:00:00Z",
      },
    };

    expect(describeChangeOp(op, [], timezone)).toEqual({
      title: "Dinner",
      detail: "19:00–21:00 · 1 Rue Cler",
    });
  });

  it("shows the old and new times for an updated event", () => {
    const op: ChangeOp = {
      op: "update",
      entity: "event",
      id: 7,
      data: {
        startAt: "2026-08-20T07:00:00Z",
        endAt: "2026-08-20T09:00:00Z",
      },
    };

    expect(describeChangeOp(op, [existing], timezone)).toEqual({
      title: "Louvre",
      before: "10:00–12:00",
      detail: "09:00–11:00",
    });
  });

  it("names a deleted event from the trip", () => {
    const op: ChangeOp = { op: "delete", entity: "event", id: 7, data: {} };

    expect(describeChangeOp(op, [existing], timezone)).toEqual({
      title: "Louvre",
      detail: "10:00–12:00",
    });
  });

  it("falls back to a generic title when the target is unknown", () => {
    const op: ChangeOp = {
      op: "delete",
      entity: "packing_item",
      id: 3,
      data: {},
    };

    expect(describeChangeOp(op, [], timezone).title).toBe("Packing item #3");
  });

  it("describes wishlist items with their wishlist", () => {
    const op: ChangeOp = {
      op: "create",
      entity: "wishlist_item",
      data: { name: "Eiffel Tower" },
    };

    expect(describeChangeOp(op, [], timezone)).toEqual({
      title: "Eiffel Tower",
      detail: "AI ideas",
    });
  });
});

describe("summariseApplied", () => {
  it("lists only the non-zero counts", () => {
    expect(summariseApplied({ created: 2, updated: 0, deleted: 1 })).toBe(
      "Changes applied: 2 added, 1 removed.",
    );
  });

  it("handles an empty result", () => {
    expect(summariseApplied({ created: 0, updated: 0, deleted: 0 })).toBe(
      "No changes.",
    );
  });
});

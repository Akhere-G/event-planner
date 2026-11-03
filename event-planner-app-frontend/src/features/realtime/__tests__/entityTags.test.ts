import { describe, expect, it } from "vitest";
import { entitiesToTags } from "../entityTags";

describe("entitiesToTags", () => {
  it("maps events to the trip tag", () => {
    expect(entitiesToTags(["event"], 7)).toEqual([{ type: "Trips", id: 7 }]);
  });

  it("maps accommodation, packing and wishlist to their list tags", () => {
    expect(entitiesToTags(["accommodation", "packing", "wishlist"], 7)).toEqual(
      ["Accommodations", "PackingItem", "Wishlists"],
    );
  });

  it("maps flights to the per-trip flights tag", () => {
    expect(entitiesToTags(["flight"], 7)).toEqual([{ type: "Flights", id: 7 }]);
  });

  it("dedupes tags shared by several entities", () => {
    expect(entitiesToTags(["event", "itinerary"], 3)).toEqual([
      { type: "Trips", id: 3 },
    ]);
  });

  it("ignores entities it does not know yet", () => {
    expect(entitiesToTags(["expense", "unknown"], 3)).toEqual([]);
  });
});

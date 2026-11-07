import { describe, expect, it } from "vitest";
import { entitiesToTags, userEntitiesToTags } from "../entityTags";

describe("entitiesToTags", () => {
  it("maps events to the trip's events tag", () => {
    expect(entitiesToTags(["event"], 7)).toEqual([{ type: "Events", id: 7 }]);
  });

  it("maps itinerary changes to the trip tag", () => {
    expect(entitiesToTags(["itinerary"], 7)).toEqual([
      { type: "Trips", id: 7 },
    ]);
  });

  it("maps accommodation, packing and wishlist to their list tags", () => {
    expect(entitiesToTags(["accommodation", "packing", "wishlist"], 7)).toEqual(
      ["Accommodations", "PackingItem", "Wishlists"],
    );
  });

  it("maps wishlist items and votes to the wishlist tag", () => {
    expect(entitiesToTags(["wishlist_item", "wishlist_item_vote"], 7)).toEqual([
      "Wishlists",
    ]);
  });

  it("maps flights to the trip's flights tag", () => {
    expect(entitiesToTags(["flight"], 7)).toEqual([{ type: "Flights", id: 7 }]);
  });

  it("maps invites to the invites list", () => {
    expect(entitiesToTags(["invite"], 7)).toEqual([
      { type: "Invites", id: "LIST" },
    ]);
  });

  it("maps membership changes to the trip and the users list", () => {
    expect(entitiesToTags(["itinerary_user"], 7)).toEqual([
      { type: "Trips", id: 7 },
      { type: "Users", id: "LIST" },
    ]);
  });

  it("dedupes tags shared by several entities", () => {
    expect(entitiesToTags(["itinerary_user", "itinerary"], 3)).toEqual([
      { type: "Trips", id: 3 },
      { type: "Users", id: "LIST" },
    ]);
  });

  it("ignores entities it does not know yet", () => {
    expect(entitiesToTags(["expense"], 3)).toEqual([]);
  });
});

describe("userEntitiesToTags", () => {
  it("refreshes invites when one arrives or changes", () => {
    expect(userEntitiesToTags(["invite"], [4])).toEqual([
      { type: "Invites", id: "LIST" },
    ]);
  });

  it("refreshes the trip list and each affected trip on membership changes", () => {
    expect(userEntitiesToTags(["itinerary_user"], [4, 9])).toEqual([
      { type: "Trips", id: "LIST" },
      { type: "Trips", id: 4 },
      { type: "Trips", id: 9 },
    ]);
  });

  it("combines invite and membership changes from accepting an invite", () => {
    expect(userEntitiesToTags(["invite", "itinerary_user"], [4])).toEqual([
      { type: "Invites", id: "LIST" },
      { type: "Trips", id: "LIST" },
      { type: "Trips", id: 4 },
    ]);
  });

  it("ignores unknown entities", () => {
    expect(userEntitiesToTags(["flight"], [4])).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  apiErrorMessage,
  connectResultMessage,
  isTripSynced,
  tripSyncLabel,
} from "../utils";

describe("isTripSynced", () => {
  it("is true only for trips the user has switched on", () => {
    const status = { connected: true, syncedTripIds: [3, 8] };

    expect(isTripSynced(status, 8)).toBe(true);
    expect(isTripSynced(status, 4)).toBe(false);
  });

  it("is false before the status has loaded", () => {
    expect(isTripSynced(undefined, 3)).toBe(false);
  });
});

describe("connectResultMessage", () => {
  it("only announces a successful connection", () => {
    expect(connectResultMessage("connected")).toBe(
      "Google Calendar connected.",
    );
    expect(connectResultMessage(null)).toBeNull();
    expect(connectResultMessage("other")).toBeNull();
  });
});

describe("apiErrorMessage", () => {
  it("prefers the API message and otherwise uses the fallback", () => {
    expect(apiErrorMessage({ data: { message: "Nope" } }, "Fallback")).toBe(
      "Nope",
    );
    expect(apiErrorMessage(new Error("x"), "Fallback")).toBe("Fallback");
  });
});

describe("tripSyncLabel", () => {
  it("tells users to connect first, then offers to toggle", () => {
    expect(tripSyncLabel({ connected: false, syncedTripIds: [] }, 1)).toMatch(
      /Connect Google Calendar/,
    );
    expect(tripSyncLabel({ connected: true, syncedTripIds: [] }, 1)).toBe(
      "Sync with Google Calendar",
    );
    expect(tripSyncLabel({ connected: true, syncedTripIds: [1] }, 1)).toBe(
      "Stop syncing with Google Calendar",
    );
  });
});

import { describe, expect, it } from "vitest";
import { isTripSynced, parseConnectResult, tripSyncLabel } from "../utils";

describe("parseConnectResult", () => {
  it("accepts the two results the backend redirects with", () => {
    expect(parseConnectResult("connected")).toBe("connected");
    expect(parseConnectResult("failed")).toBe("failed");
  });

  it("ignores anything else", () => {
    expect(parseConnectResult(null)).toBeNull();
    expect(parseConnectResult("other")).toBeNull();
  });
});

describe("isTripSynced", () => {
  const status = { connected: true, syncedTripIds: [3, 7] };

  it("is true only for trips in the synced list", () => {
    expect(isTripSynced(status, 3)).toBe(true);
    expect(isTripSynced(status, 4)).toBe(false);
  });

  it("is false while the status is loading", () => {
    expect(isTripSynced(undefined, 3)).toBe(false);
  });
});

describe("tripSyncLabel", () => {
  it("offers the opposite of the current state", () => {
    expect(tripSyncLabel(false)).toBe("Sync to Google Calendar");
    expect(tripSyncLabel(true)).toBe("Stop syncing to Google Calendar");
  });
});

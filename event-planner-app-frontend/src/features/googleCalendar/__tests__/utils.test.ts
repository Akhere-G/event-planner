import { describe, expect, it } from "vitest";
import { connectResultMessage, isTripSynced } from "../utils";

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

import { describe, expect, it } from "vitest";
import { createEvents } from "ics";
import { flightSchema } from "../schemas/flightSchema";
import { getFlightsForDay, localInputToUtc, utcToLocalInput } from "../utils";
import { buildFlightCalendarEvents } from "../../trips/utils";
import type { Flight } from "../types";

const flight: Flight = {
  id: 1,
  itineraryId: 1,
  airline: "British Airways",
  flightNumber: "BA117",
  departureAirport: "LHR",
  arrivalAirport: "JFK",
  departureTimezone: "Europe/London",
  arrivalTimezone: "America/New_York",
  departAt: "2026-08-01T22:30:00Z",
  arriveAt: "2026-08-02T06:15:00Z",
  bookingRef: "ABC123",
  seat: "12A",
  notes: null,
  travellers: [],
};

const validForm = {
  airline: "British Airways",
  flightNumber: "ba117",
  departureAirport: "lhr",
  arrivalAirport: "jfk",
  departureTimezone: "Europe/London",
  arrivalTimezone: "America/New_York",
  departAt: "2026-08-01T10:00",
  arriveAt: "2026-08-01T13:00",
};

describe("flightSchema", () => {
  it("accepts a valid flight and normalises codes to upper case", async () => {
    const result = await flightSchema.validate(validForm);
    expect(result.flightNumber).toBe("BA117");
    expect(result.departureAirport).toBe("LHR");
  });

  it("rejects bad IATA codes", async () => {
    await expect(
      flightSchema.validate({ ...validForm, departureAirport: "LONDON" }),
    ).rejects.toThrow(/IATA/);
  });

  it("rejects identical airports", async () => {
    await expect(
      flightSchema.validate({ ...validForm, arrivalAirport: "LHR" }),
    ).rejects.toThrow(/differ/);
  });

  it("rejects unknown timezones", async () => {
    await expect(
      flightSchema.validate({ ...validForm, arrivalTimezone: "Mars/Base" }),
    ).rejects.toThrow(/IANA/);
  });

  it("compares arrival and departure across timezones", async () => {
    // 10:00 London (09:00Z) vs 04:00 New York (08:00Z): arrives before departing.
    await expect(
      flightSchema.validate({ ...validForm, arriveAt: "2026-08-01T04:00" }),
    ).rejects.toThrow(/after departure/);
    // 05:00 New York is 09:00Z, not strictly after departure.
    await expect(
      flightSchema.validate({ ...validForm, arriveAt: "2026-08-01T05:00" }),
    ).rejects.toThrow(/after departure/);
    await expect(
      flightSchema.validate({ ...validForm, arriveAt: "2026-08-01T06:00" }),
    ).resolves.toBeTruthy();
  });
});

describe("flight time helpers", () => {
  it("round-trips local airport time through UTC", () => {
    const utc = localInputToUtc("2026-08-01T10:00", "Europe/London");
    expect(utc).toBe("2026-08-01T09:00:00.000Z");
    expect(utcToLocalInput(utc, "Europe/London")).toBe("2026-08-01T10:00");
  });

  it("places a flight on its departure and arrival days in airport time", () => {
    // 22:30Z is 23:30 in London on 1 Aug; 06:15Z is 02:15 in New York on 2 Aug.
    expect(getFlightsForDay([flight], "2026-08-01")).toHaveLength(1);
    expect(getFlightsForDay([flight], "2026-08-02")).toHaveLength(1);
    expect(getFlightsForDay([flight], "2026-08-03")).toHaveLength(0);
  });
});

describe("buildFlightCalendarEvents", () => {
  it("emits UTC start and end times in the ICS output", () => {
    const { error, value } = createEvents(buildFlightCalendarEvents([flight]));
    expect(error).toBeFalsy();
    expect(value).toContain("DTSTART:20260801T223000Z");
    expect(value).toContain("DTEND:20260802T061500Z");
    expect(value).toContain("SUMMARY:BA117 LHR → JFK");
  });
});

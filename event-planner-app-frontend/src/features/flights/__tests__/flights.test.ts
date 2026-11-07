import { describe, expect, it } from "vitest";
import { createEvents } from "ics";
import { flightSearchSchema } from "../schemas/flightSchema";
import {
  directFlightSummary,
  flightExpensePrefill,
  formatGbp,
  getFlightsForDay,
} from "../utils";
import { buildFlightCalendarEvents } from "../../trips/utils";
import type { Flight } from "../types";

const flight: Flight = {
  id: 1,
  itineraryId: 1,
  airline: "BA",
  flightNumber: "117",
  departureAirport: "LHR",
  arrivalAirport: "JFK",
  departureTimezone: "Europe/London",
  arrivalTimezone: "America/New_York",
  departureLatitude: 51.47,
  departureLongitude: -0.4543,
  arrivalLatitude: 40.6413,
  arrivalLongitude: -73.7781,
  departAt: "2026-08-01T22:30:00Z",
  arriveAt: "2026-08-02T06:15:00Z",
  departureAirportName: "Heathrow Airport",
  departureCity: "London",
  arrivalAirportName: "John F Kennedy International Airport",
  arrivalCity: "New York",
  travelClass: "Economy",
  luggage: ["1 cabin bag included"],
  extras: ["Average legroom (31 in)"],
  purchaseUrl: "https://www.google.com/travel/flights",
  airlineLogo: null,
  notes: null,
};

const validForm = {
  origin: ["LHR", "LGW"],
  destination: ["JFK"],
  departureDate: "2026-08-01",
};

describe("flightSearchSchema", () => {
  it("accepts departure airports, arrival airports, and a date", async () => {
    const result = await flightSearchSchema.validate(validForm);
    expect(result.origin).toEqual(["LHR", "LGW"]);
    expect(result.destination).toEqual(["JFK"]);
  });

  it("requires a departure airport", async () => {
    await expect(
      flightSearchSchema.validate({ ...validForm, origin: [] }),
    ).rejects.toThrow(/Required/);
  });

  it("requires an arrival airport", async () => {
    await expect(
      flightSearchSchema.validate({ ...validForm, destination: [] }),
    ).rejects.toThrow(/Required/);
  });

  it("rejects a malformed date", async () => {
    await expect(
      flightSearchSchema.validate({ ...validForm, departureDate: "1 Aug" }),
    ).rejects.toThrow(/valid departure date/);
  });
});

describe("flight time helpers", () => {
  it("places a flight on its departure and arrival days in airport time", () => {
    // 22:30Z is 23:30 in London on 1 Aug; 06:15Z is 02:15 in New York on 2 Aug.
    expect(getFlightsForDay([flight], "2026-08-01")).toHaveLength(1);
    expect(getFlightsForDay([flight], "2026-08-02")).toHaveLength(1);
    expect(getFlightsForDay([flight], "2026-08-03")).toHaveLength(0);
  });
});

describe("flight display helpers", () => {
  it("formats prices in whole pounds", () => {
    expect(formatGbp(57)).toBe("£57");
    expect(formatGbp(1234)).toBe("£1,234");
  });

  it("summarises a direct flight with its luggage notes", () => {
    expect(directFlightSummary([])).toBe("Direct flight");
    expect(directFlightSummary(["1 cabin bag included"])).toBe(
      "Direct flight · 1 cabin bag included",
    );
  });
});

describe("flightExpensePrefill", () => {
  it("links the flight and uses its code, route and local departure date", () => {
    expect(flightExpensePrefill(flight)).toEqual({
      flightId: 1,
      description: "BA117 · LHR → JFK",
      category: "transport",
      spentOn: "2026-08-01",
    });
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

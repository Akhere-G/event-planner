import { describe, expect, it } from "vitest";
import { convertToGbp } from "../utils";

const rates = { EUR: 1.25, JPY: 200 };

describe("convertToGbp", () => {
  it("divides by the rate, as rates are quoted from GBP", () => {
    expect(convertToGbp(100, "EUR", rates)).toBeCloseTo(80);
    expect(convertToGbp(1000, "JPY", rates)).toBeCloseTo(5);
  });

  it("leaves GBP alone, even before rates have loaded", () => {
    expect(convertToGbp(10, "GBP", undefined)).toBe(10);
  });

  it("returns null when there is no rate", () => {
    expect(convertToGbp(10, "EUR", undefined)).toBeNull();
    expect(convertToGbp(10, "SEK", rates)).toBeNull();
  });
});

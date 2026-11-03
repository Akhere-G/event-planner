import { describe, expect, it } from "vitest";
import { formatInHomeCurrency, formatMoney, gbpTo, toGbp } from "../utils";

const rates = { EUR: 1.2, USD: 1.25, JPY: 190 };

describe("currency utils", () => {
  it("converts between GBP and a foreign currency", () => {
    expect(gbpTo(100, "EUR", rates)).toBeCloseTo(120);
    expect(toGbp(120, "EUR", rates)).toBeCloseTo(100);
    expect(gbpTo(10, "GBP", undefined)).toBe(10);
  });

  it("returns null when the rate is missing", () => {
    expect(gbpTo(10, "EUR", undefined)).toBeNull();
    expect(toGbp(10, "SEK", rates)).toBeNull();
  });

  it("formats in the right currency", () => {
    expect(formatMoney(1234.5, "GBP")).toBe("£1,234.50");
    expect(formatMoney(30, "EUR")).toContain("30.00");
  });
});

describe("formatInHomeCurrency", () => {
  it("is plain GBP for a GBP home currency", () => {
    expect(formatInHomeCurrency(100, "GBP", rates)).toBe("£100.00");
  });

  it("shows the home currency with the GBP figure alongside", () => {
    const text = formatInHomeCurrency(100, "EUR", rates);
    expect(text).toContain("120.00");
    expect(text).toContain("(≈ £100.00)");
  });

  it("falls back to GBP while rates are loading", () => {
    expect(formatInHomeCurrency(100, "EUR", undefined)).toBe("£100.00");
  });

  it("falls back to GBP when the home rate is missing", () => {
    expect(formatInHomeCurrency(100, "SEK", rates)).toBe("£100.00");
  });
});

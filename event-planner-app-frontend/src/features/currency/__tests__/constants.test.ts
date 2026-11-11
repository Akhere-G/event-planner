import { describe, expect, it } from "vitest";
import {
  BASE_CURRENCY,
  CURRENCY_CODES,
  currencyOptions,
  isCurrencyCode,
} from "../constants";

describe("currency constants", () => {
  it("accepts supported codes only", () => {
    expect(isCurrencyCode("EUR")).toBe(true);
    expect(isCurrencyCode("eur")).toBe(false);
    expect(isCurrencyCode("BGN")).toBe(false);
    expect(isCurrencyCode(null)).toBe(false);
  });

  it("includes the base currency", () => {
    expect(CURRENCY_CODES).toContain(BASE_CURRENCY);
  });

  it("names each option after its code", () => {
    expect(currencyOptions).toHaveLength(CURRENCY_CODES.length);
    expect(currencyOptions.find((o) => o.value === "EUR")?.name).toBe(
      "EUR – Euro",
    );
  });
});

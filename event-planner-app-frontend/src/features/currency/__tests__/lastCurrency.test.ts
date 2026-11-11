import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getLastCurrency,
  lastCurrencyStorageKey,
  saveLastCurrency,
} from "../lastCurrency";

afterEach(() => vi.restoreAllMocks());

describe("last used currency", () => {
  it("defaults to GBP when nothing is stored", () => {
    expect(getLastCurrency()).toBe("GBP");
  });

  it("returns the saved currency", () => {
    saveLastCurrency("EUR");
    expect(getLastCurrency()).toBe("EUR");
  });

  it.each(["XXX", "eur", "BGN", ""])("ignores the stored value %j", (value) => {
    localStorage.setItem(lastCurrencyStorageKey, value);
    expect(getLastCurrency()).toBe("GBP");
  });

  it("falls back to GBP when storage cannot be read", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getLastCurrency()).toBe("GBP");
  });

  it("does not throw when storage cannot be written", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => saveLastCurrency("EUR")).not.toThrow();
  });
});

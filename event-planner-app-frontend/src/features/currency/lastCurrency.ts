import { BASE_CURRENCY, isCurrencyCode, type CurrencyCode } from "./constants";

export const lastCurrencyStorageKey = "lastExpenseCurrency";

/** The currency last used on a money form, or GBP if there is none we trust. */
export const getLastCurrency = (): CurrencyCode => {
  try {
    const stored = localStorage.getItem(lastCurrencyStorageKey);
    return isCurrencyCode(stored) ? stored : BASE_CURRENCY;
  } catch {
    return BASE_CURRENCY;
  }
};

export const saveLastCurrency = (currency: CurrencyCode) => {
  try {
    localStorage.setItem(lastCurrencyStorageKey, currency);
  } catch {
    // Storage can be blocked; remembering the currency is only a convenience.
  }
};

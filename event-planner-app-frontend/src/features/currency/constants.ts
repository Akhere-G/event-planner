export const CURRENCY_CODES = [
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RON",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "USD",
  "ZAR",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const BASE_CURRENCY: CurrencyCode = "GBP";

export const isCurrencyCode = (value: unknown): value is CurrencyCode =>
  CURRENCY_CODES.some((code) => code === value);

const currencyNames = new Intl.DisplayNames("en", { type: "currency" });

export const currencyOptions = CURRENCY_CODES.map((code) => ({
  name: `${code} – ${currencyNames.of(code) ?? code}`,
  value: code,
}));

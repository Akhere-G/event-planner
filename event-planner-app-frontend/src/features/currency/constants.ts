export const CURRENCIES = [
  { code: "AUD", name: "Australian dollar" },
  { code: "BGN", name: "Bulgarian lev" },
  { code: "BRL", name: "Brazilian real" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "CHF", name: "Swiss franc" },
  { code: "CNY", name: "Chinese yuan" },
  { code: "CZK", name: "Czech koruna" },
  { code: "DKK", name: "Danish krone" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British pound" },
  { code: "HKD", name: "Hong Kong dollar" },
  { code: "HUF", name: "Hungarian forint" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "ILS", name: "Israeli shekel" },
  { code: "INR", name: "Indian rupee" },
  { code: "ISK", name: "Icelandic króna" },
  { code: "JPY", name: "Japanese yen" },
  { code: "KRW", name: "South Korean won" },
  { code: "MXN", name: "Mexican peso" },
  { code: "MYR", name: "Malaysian ringgit" },
  { code: "NOK", name: "Norwegian krone" },
  { code: "NZD", name: "New Zealand dollar" },
  { code: "PHP", name: "Philippine peso" },
  { code: "PLN", name: "Polish złoty" },
  { code: "RON", name: "Romanian leu" },
  { code: "SEK", name: "Swedish krona" },
  { code: "SGD", name: "Singapore dollar" },
  { code: "THB", name: "Thai baht" },
  { code: "TRY", name: "Turkish lira" },
  { code: "USD", name: "US dollar" },
  { code: "ZAR", name: "South African rand" },
] as const;

export const currencyCodes: string[] = CURRENCIES.map((c) => c.code);

export const currencyOptions = CURRENCIES.map((c) => ({
  name: `${c.code} – ${c.name}`,
  value: c.code,
}));

export const DEFAULT_CURRENCY = "GBP";

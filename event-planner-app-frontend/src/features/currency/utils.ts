import { DEFAULT_CURRENCY } from "./constants";

export type Rates = Record<string, number>;

export const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    amount,
  );

/** Rates are quoted as "1 GBP = rate X". */
export const gbpTo = (
  amountGbp: number,
  currency: string,
  rates: Rates | undefined,
): number | null => {
  if (currency === DEFAULT_CURRENCY) return amountGbp;
  const rate = rates?.[currency];
  return rate ? amountGbp * rate : null;
};

export const toGbp = (
  amount: number,
  currency: string,
  rates: Rates | undefined,
): number | null => {
  if (currency === DEFAULT_CURRENCY) return amount;
  const rate = rates?.[currency];
  return rate ? amount / rate : null;
};

/**
 * Shows a GBP total in the home currency, with the GBP figure alongside.
 * Falls back to plain GBP while rates load or when the rate is missing.
 */
export const formatInHomeCurrency = (
  amountGbp: number,
  homeCurrency: string,
  rates: Rates | undefined,
) => {
  const gbp = formatMoney(amountGbp, DEFAULT_CURRENCY);
  if (homeCurrency === DEFAULT_CURRENCY) return gbp;
  const home = gbpTo(amountGbp, homeCurrency, rates);
  return home === null ? gbp : `${formatMoney(home, homeCurrency)} (≈ ${gbp})`;
};

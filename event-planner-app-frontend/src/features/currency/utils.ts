import { BASE_CURRENCY } from "./constants";
import type { Rates } from "./types";

/** What an amount is worth in GBP, or null when there is no rate for it yet. */
export const convertToGbp = (
  amount: number,
  currency: string,
  rates: Rates | undefined,
): number | null => {
  if (currency === BASE_CURRENCY) return amount;
  const rate = rates?.[currency];
  return rate ? amount / rate : null;
};

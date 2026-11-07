import { useCheckUserQuery } from "../auth/services/authApiSlice";
import { DEFAULT_CURRENCY } from "./constants";
import { useGetRatesQuery } from "./services/currencyApiSlice";
import { formatInHomeCurrency, formatMoney, toGbp } from "./utils";

/** Formats GBP totals in the user's home currency. */
export default function useMoney() {
  const { data: user } = useCheckUserQuery();
  const homeCurrency = user?.data?.homeCurrency ?? DEFAULT_CURRENCY;
  const { data: ratesData, isLoading: isLoadingRates } = useGetRatesQuery(
    undefined,
    { skip: homeCurrency === DEFAULT_CURRENCY },
  );
  const rates = ratesData?.data.rates;

  return {
    homeCurrency,
    rates,
    isLoadingRates,
    /** Format a GBP amount for display. */
    format: (amountGbp: number) =>
      formatInHomeCurrency(amountGbp, homeCurrency, rates),
    /** Format an amount in the currency it was actually paid in. */
    formatOriginal: (amount: number, currency: string) =>
      formatMoney(amount, currency),
    /** Estimate of what an amount in `currency` is worth in GBP right now. */
    estimateGbp: (amount: number, currency: string) =>
      toGbp(amount, currency, rates),
  };
}

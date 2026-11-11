/** Rates are quoted as "1 GBP = rate units of the currency". */
export type Rates = Record<string, number>;

export interface RatesResponse {
  base: string;
  rates: Rates;
}

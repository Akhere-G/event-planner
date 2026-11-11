import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import { BASE_CURRENCY } from "../constants";
import type { RatesResponse } from "../types";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export const currencyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRates: builder.query<ApiResponse<RatesResponse>, void>({
      query: () => ({ url: "/fx/rates", params: { base: BASE_CURRENCY } }),
      keepUnusedDataFor: ONE_DAY_SECONDS,
    }),
  }),
});

export const { useGetRatesQuery } = currencyApiSlice;

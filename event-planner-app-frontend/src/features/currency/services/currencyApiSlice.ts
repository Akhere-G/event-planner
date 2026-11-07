import { apiSlice } from "../../api/apiSlice";
import { authApi, type AuthResponse } from "../../auth/services/authApiSlice";

interface RatesResponse {
  data: { base: string; rates: Record<string, number> };
}

export const currencyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRates: builder.query<RatesResponse, string | void>({
      query: (base = "GBP") => ({ url: "/fx/rates", params: { base } }),
      keepUnusedDataFor: 60 * 60 * 24,
    }),
    updateHomeCurrency: builder.mutation<AuthResponse, string>({
      query: (homeCurrency) => ({
        url: "/users/me",
        method: "PATCH",
        body: { homeCurrency },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData("checkUser", undefined, (draft) => {
              if (draft.data) draft.data.homeCurrency = data.data.homeCurrency;
            }),
          );
        } catch {
          // the caller shows the error toast
        }
      },
    }),
  }),
});

export const { useGetRatesQuery, useUpdateHomeCurrencyMutation } = currencyApi;

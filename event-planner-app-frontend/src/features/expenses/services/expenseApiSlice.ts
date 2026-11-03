import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { ExpenseFormValues, SettlementFormValues } from "../schema";
import type { Balances, Expense, Settlement } from "../types";

type ExpensePayload = Omit<ExpenseFormValues, "link" | "participantIds"> & {
  participantIds?: number[];
};

export const expenseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<ApiResponse<Expense[]>, number>({
      query: (tripId) => `/itineraries/${tripId}/expenses`,
      providesTags: (_r, _e, tripId) => [{ type: "Expenses", id: tripId }],
    }),
    getBalances: builder.query<ApiResponse<Balances>, number>({
      query: (tripId) => `/itineraries/${tripId}/expenses/balances`,
      providesTags: (_r, _e, tripId) => [
        { type: "Expenses", id: tripId },
        { type: "Settlements", id: tripId },
      ],
    }),
    getSettlements: builder.query<ApiResponse<Settlement[]>, number>({
      query: (tripId) => `/itineraries/${tripId}/expenses/settlements`,
      providesTags: (_r, _e, tripId) => [{ type: "Settlements", id: tripId }],
    }),
    addExpense: builder.mutation<
      ApiResponse<Expense>,
      { tripId: number; expense: ExpensePayload }
    >({
      query: ({ tripId, expense }) => ({
        url: `/itineraries/${tripId}/expenses`,
        method: "POST",
        body: expense,
      }),
      invalidatesTags: (_r, _e, { tripId }) => [
        { type: "Expenses", id: tripId },
      ],
    }),
    updateExpense: builder.mutation<
      ApiResponse<Expense>,
      { tripId: number; expenseId: number; expense: Partial<ExpensePayload> }
    >({
      query: ({ tripId, expenseId, expense }) => ({
        url: `/itineraries/${tripId}/expenses/${expenseId}`,
        method: "PATCH",
        body: expense,
      }),
      invalidatesTags: (_r, _e, { tripId }) => [
        { type: "Expenses", id: tripId },
      ],
    }),
    deleteExpense: builder.mutation<
      ApiResponse<number>,
      { tripId: number; expenseId: number }
    >({
      query: ({ tripId, expenseId }) => ({
        url: `/itineraries/${tripId}/expenses/${expenseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { tripId }) => [
        { type: "Expenses", id: tripId },
      ],
    }),
    addSettlement: builder.mutation<
      ApiResponse<Settlement>,
      { tripId: number; settlement: SettlementFormValues }
    >({
      query: ({ tripId, settlement }) => ({
        url: `/itineraries/${tripId}/expenses/settlements`,
        method: "POST",
        body: settlement,
      }),
      invalidatesTags: (_r, _e, { tripId }) => [
        { type: "Settlements", id: tripId },
      ],
    }),
    deleteSettlement: builder.mutation<
      ApiResponse<number>,
      { tripId: number; settlementId: number }
    >({
      query: ({ tripId, settlementId }) => ({
        url: `/itineraries/${tripId}/expenses/settlements/${settlementId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { tripId }) => [
        { type: "Settlements", id: tripId },
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetBalancesQuery,
  useGetSettlementsQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useAddSettlementMutation,
  useDeleteSettlementMutation,
} = expenseApiSlice;

import { apiSlice } from "../../api/apiSlice";
import type { PackingitemSchema } from "../schema";
import type { PackingItem } from "../types";

export const packingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackingItems: builder.query<{ data: PackingItem[] }, { tripId: number }>(
      {
        query: ({ tripId }) => ({
          url: `/itineraries/${tripId}/packing_items`,
        }),
      },
    ),
    addPackingItem: builder.mutation<
      { data: PackingItem },
      { packingItem: PackingitemSchema; tripId: number }
    >({
      query: ({ packingItem, tripId }) => ({
        url: `/itineraries/${tripId}/packing_items`,
        method: "POST",
        body: packingItem,
      }),
    }),
  }),
});

export const { useGetPackingItemsQuery, useAddPackingItemMutation } =
  packingApiSlice;

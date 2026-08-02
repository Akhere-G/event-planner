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
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({
                  type: "PackingItem" as const,
                  id,
                })),
                { type: "PackingItem", id: "LIST" },
              ]
            : [{ type: "PackingItem", id: "LIST" }],
      }
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
      invalidatesTags: [{ type: "PackingItem", id: "LIST" }],
    }),
    updatePackingItem: builder.mutation<
      { data: PackingItem },
      { tripId: number; itemId: number; updates: Partial<PackingItem> }
    >({
      query: ({ tripId, itemId, updates }) => ({
        url: `/itineraries/${tripId}/packing_items/${itemId}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (_result, _error, { itemId }) => [
        { type: "PackingItem", id: itemId },
        { type: "PackingItem", id: "LIST" },
      ],
    }),
    deletePackingItem: builder.mutation<
      { data: number },
      { tripId: number; itemId: number }
    >({
      query: ({ tripId, itemId }) => ({
        url: `/itineraries/${tripId}/packing_items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "PackingItem", id: "LIST" }],
    }),
    generatePackingItems: builder.mutation<
      { data: PackingItem[] },
      { tripId: number }
    >({
      query: ({ tripId }) => ({
        url: `/itineraries/${tripId}/packing_items/generate`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "PackingItem", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPackingItemsQuery,
  useAddPackingItemMutation,
  useUpdatePackingItemMutation,
  useDeletePackingItemMutation,
  useGeneratePackingItemsMutation,
} = packingApiSlice;

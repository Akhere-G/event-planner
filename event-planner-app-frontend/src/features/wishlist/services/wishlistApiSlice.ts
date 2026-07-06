import { apiSlice } from "../../api/apiSlice";
import type {
  Wishlist as Wishlist,
  CreateWishlistPayload,
  CreateWishlistItemPayload,
  DeleteWishlistItemPayload,
  PromoteWishlistItemPayload,
  ApiResponse,
  WishlistItem,
  UpdateWishlistPayload,
} from "../types";
import type { Event } from "../../events/types";

export const wishlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlists: builder.query<ApiResponse<Wishlist[]>, number>({
      query: (tripId) => `/itineraries/${tripId}/wishlists`,
      providesTags: ["Wishlists"],
    }),
    createWishlist: builder.mutation<
      ApiResponse<Wishlist>,
      CreateWishlistPayload
    >({
      query: ({ tripId, name }) => ({
        url: `/itineraries/${tripId}/wishlists`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Wishlists"],
    }),
    updateWishlist: builder.mutation<
      ApiResponse<Wishlist>,
      UpdateWishlistPayload
    >({
      query: ({ tripId, wishlistId, name }) => ({
        url: `/itineraries/${tripId}/wishlists/${wishlistId}`,
        method: "PATCH",
        body: { name },
      }),
    }),
    createWishlistItem: builder.mutation<
      ApiResponse<WishlistItem>,
      CreateWishlistItemPayload
    >({
      query: ({ tripId, ...itemData }) => ({
        url: `/itineraries/${tripId}/wishlists/${itemData.wishlistId}/items`,
        method: "POST",
        body: itemData,
      }),
      invalidatesTags: ["Wishlists"],
    }),
    deleteWishlistItem: builder.mutation<
      ApiResponse<{ deletedId: number }>,
      DeleteWishlistItemPayload
    >({
      query: ({ tripId, wishlistId, itemId }) => ({
        url: `/itineraries/${tripId}/wishlists/${wishlistId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlists"],
    }),
    promoteWishlistItem: builder.mutation<
      ApiResponse<Event>,
      PromoteWishlistItemPayload
    >({
      query: ({ tripId, wishlistId, itemId, startAt, endAt }) => ({
        url: `/itineraries/${tripId}/wishlists/${wishlistId}/items/${itemId}/promote`,
        method: "POST",
        body: { startAt, endAt },
      }),
      invalidatesTags: ["Wishlists", "Events", "Trips"],
    }),
  }),
});

export const {
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useUpdateWishlistMutation,
  useCreateWishlistItemMutation,
  useDeleteWishlistItemMutation,
  usePromoteWishlistItemMutation,
} = wishlistApiSlice;

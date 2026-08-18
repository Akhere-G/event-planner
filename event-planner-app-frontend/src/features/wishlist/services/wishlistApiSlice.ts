import { apiSlice } from "../../api/apiSlice";
import type {
  Wishlist as Wishlist,
  CreateWishlistPayload,
  CreateWishlistItemPayload,
  UpdateWishlistItemPayload,
  DeleteWishlistItemPayload,
  DeleteWishlistPayload,
  PromoteWishlistItemPayload,
  WishlistItem,
  UpdateWishlistPayload,
  VoteForWishlistItemPayload,
} from "../types";
import type { Event } from "../../events/types";
import type { ApiResponse } from "../../api/types";

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
      invalidatesTags: ["Wishlists"],
    }),
    deleteWishlist: builder.mutation<
      ApiResponse<{ deletedId: number }>,
      DeleteWishlistPayload
    >({
      query: ({ tripId, wishlistId }) => ({
        url: `/itineraries/${tripId}/wishlists/${wishlistId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlists"],
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
    updateWishlistItem: builder.mutation<
      ApiResponse<WishlistItem>,
      UpdateWishlistItemPayload
    >({
      query: ({ tripId, wishlistId, itemId, ...itemData }) => ({
        url: `/itineraries/${tripId}/wishlists/${wishlistId}/items/${itemId}`,
        method: "PATCH",
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
    voteForWishlistItem: builder.mutation<
      ApiResponse<void>,
      VoteForWishlistItemPayload
    >({
      query: ({ tripId, wishlistId, wishlistItemId, vote }) => ({
        url: `/itineraries/${tripId}/wishlists/${wishlistId}/items/${wishlistItemId}/vote`,
        method: "POST",
        body: { vote },
      }),
      invalidatesTags: ["Wishlists"],
    }),
  }),
});

export const {
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useUpdateWishlistMutation,
  useDeleteWishlistMutation,
  useCreateWishlistItemMutation,
  useUpdateWishlistItemMutation,
  useDeleteWishlistItemMutation,
  usePromoteWishlistItemMutation,
  useVoteForWishlistItemMutation,
} = wishlistApiSlice;

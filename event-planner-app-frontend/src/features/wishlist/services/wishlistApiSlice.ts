import { apiSlice } from "../../api/apiSlice";
import type {
  WishlistCategory,
  CreateCategoryPayload,
  CreateWishlistItemPayload,
  DeleteWishlistItemPayload,
  PromoteWishlistItemPayload,
  ApiResponse,
  WishlistItem,
} from "../types";
import type { Event } from "../../events/types";

export const wishlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlists: builder.query<ApiResponse<WishlistCategory[]>, number>({
      query: (itineraryId) => `/itineraries/${itineraryId}/wishlist`,
      providesTags: ["Wishlists"],
    }),
    createCategory: builder.mutation<
      ApiResponse<WishlistCategory>,
      CreateCategoryPayload
    >({
      query: ({ itineraryId, name }) => ({
        url: `/itineraries/${itineraryId}/wishlist/categories`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Wishlists"],
    }),
    createWishlistItem: builder.mutation<
      ApiResponse<WishlistItem>,
      CreateWishlistItemPayload
    >({
      query: ({ itineraryId, ...itemData }) => ({
        url: `/itineraries/${itineraryId}/wishlist/items`,
        method: "POST",
        body: itemData,
      }),
      invalidatesTags: ["Wishlists"],
    }),
    deleteWishlistItem: builder.mutation<
      ApiResponse<{ deletedId: number }>,
      DeleteWishlistItemPayload
    >({
      query: ({ itineraryId, itemId }) => ({
        url: `/itineraries/${itineraryId}/wishlist/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlists"],
    }),
    promoteWishlistItem: builder.mutation<
      ApiResponse<Event>,
      PromoteWishlistItemPayload
    >({
      query: ({ itineraryId, itemId, startAt, endAt }) => ({
        url: `/itineraries/${itineraryId}/wishlist/items/${itemId}/promote`,
        method: "POST",
        body: { startAt, endAt },
      }),
      invalidatesTags: ["Wishlists", "Events", "Trips"],
    }),
  }),
});

export const {
  useGetWishlistsQuery,
  useCreateCategoryMutation,
  useCreateWishlistItemMutation,
  useDeleteWishlistItemMutation,
  usePromoteWishlistItemMutation,
} = wishlistApiSlice;

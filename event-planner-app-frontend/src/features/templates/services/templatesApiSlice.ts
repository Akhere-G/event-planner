import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type {
  ClonedTrip,
  PublishStatus,
  TemplateDetail,
  TemplateList,
} from "../types";

export const templatesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<
      ApiResponse<TemplateList>,
      { search?: string; limit: number; offset: number }
    >({
      query: ({ search, limit, offset }) => ({
        url: "/templates",
        params: { search: search || undefined, limit, offset },
      }),
      providesTags: [{ type: "Templates", id: "LIST" }],
    }),
    getTemplate: builder.query<ApiResponse<TemplateDetail>, string>({
      query: (slug) => `/templates/${slug}`,
      providesTags: (_, __, slug) => [{ type: "Templates", id: slug }],
    }),
    getPublishStatus: builder.query<ApiResponse<PublishStatus>, number>({
      query: (tripId) => `/itineraries/${tripId}/publish`,
      providesTags: (_, __, tripId) => [
        { type: "Templates", id: `trip-${tripId}` },
      ],
    }),
    publishTrip: builder.mutation<
      ApiResponse<PublishStatus>,
      { tripId: number; title?: string; description?: string }
    >({
      query: ({ tripId, ...body }) => ({
        url: `/itineraries/${tripId}/publish`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { tripId }) => [
        { type: "Templates", id: `trip-${tripId}` },
        { type: "Templates", id: "LIST" },
      ],
    }),
    unpublishTrip: builder.mutation<ApiResponse<PublishStatus>, number>({
      query: (tripId) => ({
        url: `/itineraries/${tripId}/publish`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, tripId) => [
        { type: "Templates", id: `trip-${tripId}` },
        { type: "Templates", id: "LIST" },
      ],
    }),
    cloneTemplate: builder.mutation<
      ApiResponse<ClonedTrip>,
      { slug: string; startDate: string }
    >({
      query: ({ slug, startDate }) => ({
        url: `/templates/${slug}/clone`,
        method: "POST",
        body: { startDate },
      }),
      invalidatesTags: (_, __, { slug }) => [
        { type: "Trips", id: "LIST" },
        { type: "Templates", id: slug },
        { type: "Templates", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useGetPublishStatusQuery,
  usePublishTripMutation,
  useUnpublishTripMutation,
  useCloneTemplateMutation,
} = templatesApi;

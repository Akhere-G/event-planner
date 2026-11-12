import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import type { TemplateRegion } from "../constants";
import type {
  ClonedTrip,
  PublishStatus,
  TemplateDetail,
  TemplateFilters,
  TemplateList,
  TemplatePin,
} from "../types";

interface TemplateListArgs extends TemplateFilters {
  limit: number;
  offset: number;
}

function filterParams({ search, regions }: TemplateFilters) {
  return {
    search: search || undefined,
    regions: regions.length > 0 ? regions.join(",") : undefined,
  };
}

export const templatesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<ApiResponse<TemplateList>, TemplateListArgs>({
      query: ({ limit, offset, ...filters }) => ({
        url: "/templates",
        params: { ...filterParams(filters), limit, offset },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${JSON.stringify(filterParams(queryArgs))}`,
      merge: (currentCache, newPage, { arg }) => {
        if (arg.offset === 0) {
          currentCache.data = newPage.data;
          return;
        }
        currentCache.data.templates.push(...newPage.data.templates);
        currentCache.data.hasMore = newPage.data.hasMore;
        currentCache.data.total = newPage.data.total;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.offset !== previousArg?.offset,
      providesTags: [{ type: "Templates", id: "LIST" }],
    }),
    getTemplatePins: builder.query<ApiResponse<TemplatePin[]>, TemplateFilters>(
      {
        query: (filters) => ({
          url: "/templates/pins",
          params: filterParams(filters),
        }),
        providesTags: [{ type: "Templates", id: "LIST" }],
      },
    ),
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
      {
        tripId: number;
        region: TemplateRegion;
        title?: string;
        description?: string;
      }
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
  useGetTemplatePinsQuery,
  useGetTemplateQuery,
  useGetPublishStatusQuery,
  usePublishTripMutation,
  useUnpublishTripMutation,
  useCloneTemplateMutation,
} = templatesApi;

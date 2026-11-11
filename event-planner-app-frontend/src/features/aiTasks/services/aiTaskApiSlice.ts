import { apiSlice } from "../../api/apiSlice";
import type { ApiResponse } from "../../api/types";
import { expenseDependentTags } from "../../expenses/tags";
import type {
  AcceptAiTaskResult,
  AiTask,
  AiTaskDetail,
  AiTaskParams,
  AiTaskType,
} from "../types";

const tripTasksUrl = (tripId: number) => `/itineraries/${tripId}/ai-tasks`;

export const aiTaskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTripAiTasks: builder.query<ApiResponse<AiTask[]>, number>({
      query: (tripId) => tripTasksUrl(tripId),
      providesTags: (result) => [
        { type: "AiTasks", id: "LIST" },
        ...(result?.data ?? []).map(({ id }) => ({
          type: "AiTasks" as const,
          id,
        })),
      ],
    }),
    getPendingAiTasks: builder.query<ApiResponse<AiTask[]>, number>({
      query: (tripId) => `${tripTasksUrl(tripId)}/pending`,
      providesTags: [{ type: "AiTasks", id: "LIST" }],
    }),
    getAiTask: builder.query<
      ApiResponse<AiTaskDetail>,
      { tripId: number; taskId: number }
    >({
      query: ({ tripId, taskId }) => `${tripTasksUrl(tripId)}/${taskId}`,
      providesTags: (_, __, { taskId }) => [{ type: "AiTasks", id: taskId }],
    }),
    createAiTask: builder.mutation<
      ApiResponse<AiTask>,
      {
        tripId: number;
        type: AiTaskType;
        params?: AiTaskParams[AiTaskType];
      }
    >({
      query: ({ tripId, type, params }) => ({
        url: `${tripTasksUrl(tripId)}/${type}`,
        method: "POST",
        body: params ?? {},
      }),
      invalidatesTags: [{ type: "AiTasks", id: "LIST" }],
    }),
    cancelAiTask: builder.mutation<
      ApiResponse<AiTask>,
      { tripId: number; taskId: number }
    >({
      query: ({ tripId, taskId }) => ({
        url: `${tripTasksUrl(tripId)}/${taskId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "AiTasks", id: "LIST" }],
    }),
    retryAiTask: builder.mutation<
      ApiResponse<AiTask>,
      { tripId: number; taskId: number }
    >({
      query: ({ tripId, taskId }) => ({
        url: `${tripTasksUrl(tripId)}/${taskId}/retry`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "AiTasks", id: "LIST" }],
    }),
    rejectAiTask: builder.mutation<
      ApiResponse<AiTask>,
      { tripId: number; taskId: number }
    >({
      query: ({ tripId, taskId }) => ({
        url: `${tripTasksUrl(tripId)}/${taskId}/reject`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "AiTasks", id: "LIST" }],
    }),
    acceptAiTask: builder.mutation<
      ApiResponse<AcceptAiTaskResult>,
      { tripId: number; taskId: number; opIndexes: number[] }
    >({
      query: ({ tripId, taskId, opIndexes }) => ({
        url: `${tripTasksUrl(tripId)}/${taskId}/accept`,
        method: "POST",
        body: { opIndexes },
      }),
      invalidatesTags: (_, __, { tripId }) => [
        { type: "AiTasks", id: "LIST" },
        { type: "Trips", id: "LIST" },
        { type: "Trips", id: tripId },
        { type: "Events", id: tripId },
        "Accommodations",
        "Wishlists",
        { type: "PackingItem", id: "LIST" },
        { type: "Settlements", id: tripId },
        ...expenseDependentTags(tripId),
      ],
    }),
  }),
});

export const {
  useGetTripAiTasksQuery,
  useGetPendingAiTasksQuery,
  useGetAiTaskQuery,
  useCreateAiTaskMutation,
  useCancelAiTaskMutation,
  useRetryAiTaskMutation,
  useRejectAiTaskMutation,
  useAcceptAiTaskMutation,
} = aiTaskApiSlice;

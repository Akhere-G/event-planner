import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
const baseUrl = import.meta.env.VITE_API_URL || "/api";

const baseQuery = fetchBaseQuery({ baseUrl, credentials: "include" });

const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (
    result.error?.status === 429 &&
    !result.meta?.request.url.endsWith("/api/notifications")
  ) {
    toast.error("Sorry, too many requests. Please try again soon.", {
      id: "rate-limit",
    });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    "Trips",
    "Events",
    "Invites",
    "Users",
    "Wishlists",
    "Accommodations",
    "PackingItem",
    "Notifications",
  ],

  endpoints: () => ({}),
});

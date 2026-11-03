import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
const baseUrl = import.meta.env.VITE_API_URL || "/api";
console.log(import.meta.env.VITE_API_URL);
const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
  prepareHeaders: (headers) => {
    const anonymousTrip = localStorage.getItem(anonymousAccessCodeStorageKey);

    if (anonymousTrip) {
      const { anonymousAccessCode } = JSON.parse(anonymousTrip);

      headers.set("X-Itinerary-Access-Code", anonymousAccessCode);
    }
  },
});

export const anonymousAccessCodeStorageKey = "anonymousAccessCode";

/** Keeps the access code of a trip made while logged out, so it can be reopened. */
export function rememberAnonymousTrip(
  tripId: number,
  anonymousAccessCode: string,
) {
  localStorage.setItem(
    anonymousAccessCodeStorageKey,
    JSON.stringify({ anonymousAccessCode, tripId }),
  );
}

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

export const tagTypes = [
  "Trips",
  "Events",
  "Invites",
  "Users",
  "Wishlists",
  "Accommodations",
  "PackingItem",
  "Notifications",
  "Preferences",
];
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes,

  endpoints: () => ({}),
});

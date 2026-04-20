import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseUrl =
  import.meta.env.VITE_API_URL ||
  "https://triptrackapp-752853711822.europe-west2.run.app//api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl, credentials: "include" }),
  tagTypes: ["Trips", "Events", "Invites"],
  endpoints: () => ({}),
});

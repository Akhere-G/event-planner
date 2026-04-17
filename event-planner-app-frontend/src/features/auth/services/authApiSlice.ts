import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginSchema, RegisterSchema } from "../schemas/authSchema";
import { apiSlice } from "../../api/apiSlice";

const baseUrl = import.meta.env.VITE_API_URL;

export interface AuthResponse {
  message: string;
  data: { userId: number };
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<AuthResponse, RegisterSchema>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    loginUser: builder.mutation<AuthResponse, LoginSchema>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    checkUser: builder.query<AuthResponse, void>({
      query: () => ({ url: "/auth/check" }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useCheckUserQuery,
} = authApi;

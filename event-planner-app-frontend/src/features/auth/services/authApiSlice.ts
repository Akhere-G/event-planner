import type { LoginSchema, RegisterSchema } from "../schemas/authSchema";
import { apiSlice, tagTypes } from "../../api/apiSlice";
import type { User } from "../../users/types";

export interface AuthResponse {
  message: string;
  data: User;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<AuthResponse, RegisterSchema>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: tagTypes,
    }),
    loginUser: builder.mutation<AuthResponse, LoginSchema>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: tagTypes,
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: tagTypes,
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
  useLogoutUserMutation,
} = authApi;

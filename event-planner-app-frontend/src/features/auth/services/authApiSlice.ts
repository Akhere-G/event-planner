import type { LoginSchema, RegisterSchema } from "../schemas/authSchema";
import { apiSlice } from "../../api/apiSlice";

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
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
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
  useLogoutUserMutation,
} = authApi;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  userId: number | null;
  isAuthenticated: boolean;
  isDemo: boolean;
}

const initialState: AuthState = {
  userId: null,
  isAuthenticated: false,
  isDemo: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ id: number; isDemo?: boolean }>,
    ) => {
      state.userId = action.payload.id;
      state.isAuthenticated = true;
      state.isDemo = !!action.payload.isDemo;
    },
    logOut: (state) => {
      state.userId = null;
      state.isAuthenticated = false;
      state.isDemo = false;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.userId;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsDemo = (state: { auth: AuthState }) => state.auth.isDemo;

import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./features/auth/services/authApiSlice";
import { authSlice } from "./features/auth/services/authSlice";
import { tripsApi } from "./features/trips/services/tripsApiSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [authSlice.name]: authSlice.reducer,
    [tripsApi.reducerPath]: tripsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([authApi.middleware, tripsApi.middleware]),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

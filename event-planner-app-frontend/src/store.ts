import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/services/authSlice";
import { apiSlice } from "./features/api/apiSlice";
import { modalSlice } from "./features/modal/modalSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authSlice.name]: authSlice.reducer,
    [modalSlice.name]: modalSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([apiSlice.middleware]),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

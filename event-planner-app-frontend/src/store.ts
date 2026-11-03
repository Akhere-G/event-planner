import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/services/authSlice";
import { apiSlice } from "./features/api/apiSlice";
import { themeSlice } from "./features/theme/themeSlice";
import { mapSlice } from "./features/maps/service/mapSlice";
import { realtimeSlice } from "./features/realtime/realtimeSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authSlice.name]: authSlice.reducer,
    [themeSlice.name]: themeSlice.reducer,
    [mapSlice.name]: mapSlice.reducer,
    [realtimeSlice.name]: realtimeSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([apiSlice.middleware]),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

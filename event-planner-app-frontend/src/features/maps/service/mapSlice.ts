import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Day, Event } from "../../events/types";
import type { EventSearchResult, Route } from "../types";

interface MapState {
  searchEvents: EventSearchResult[];
  searchIndex: number;
  selectedEvent: Event | null;
  days: Day[];
  routes: Route[] | null;
  isMapView: boolean;
  currentRouteIndex: number;
}

const initialState: MapState = {
  searchEvents: [],
  searchIndex: 0,
  selectedEvent: null,
  days: [],
  routes: null,
  isMapView: false,
  currentRouteIndex: 0,
};

type UpdateFunc = (event: EventSearchResult) => EventSearchResult;
export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setDays: (state, action: PayloadAction<Day[]>) => {
      state.days = action.payload;
    },
    setSearchEvents: (state, action: PayloadAction<EventSearchResult[]>) => {
      state.searchEvents = action.payload;
      state.searchIndex = 0; // Reset index on new search
    },
    updateSearchEvents: (state, action: PayloadAction<UpdateFunc>) => {
      state.searchEvents = state.searchEvents.map(action.payload);
    },
    setSearchIndex: (state, action: PayloadAction<number>) => {
      state.searchIndex = action.payload;
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    markEventAsAdded: (state) => {
      const current = state.searchEvents[state.searchIndex];
      if (current) {
        state.searchEvents[state.searchIndex].isAdded = true;
      }
    },
    clearSearchEvents: (state) => {
      state.searchEvents = [];
      state.searchIndex = 0;
    },
    setRoutes: (state, action: PayloadAction<Route[] | null>) => {
      state.currentRouteIndex = 0;
      state.routes = action.payload;
      state.isMapView = true;
    },
    updateRouteMode: (
      state,
      action: PayloadAction<{ index: number; mode: string }>,
    ) => {
      if (state.routes) {
        state.routes[action.payload.index].mode = action.payload.mode;
      }
    },
    setRouteIndex: (state, action: PayloadAction<number>) => {
      state.currentRouteIndex = action.payload;
    },
    setIsMapView: (state, action: PayloadAction<boolean>) => {
      state.isMapView = action.payload;
    },
  },
});

export const {
  setDays,
  setSearchEvents,
  setSearchIndex,
  setSelectedEvent,
  markEventAsAdded,
  clearSearchEvents,
  updateSearchEvents,
  setRoutes,
  updateRouteMode,
  setRouteIndex,
  setIsMapView,
} = mapSlice.actions;

export default mapSlice.reducer;

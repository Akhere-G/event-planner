import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Day, Event } from "../../events/types";
import type { EventSearchResult, Route } from "../types";
import type { WishlistItem } from "../../wishlist/types";
import type { Accommodation } from "../../accommodations/types";

interface MapState {
  searchEvents: EventSearchResult[];
  searchIndex: number;
  selectedEvent: Event | null;
  selectedAccommodation: Accommodation | null;
  selectedWishlistItem: WishlistItem | null;
  days: Day[];
  routes: Route[] | null;
  isMapView: boolean;
  currentRouteIndex: number;
  showWishlist: boolean;
  hiddenWishlistIds: number[];
}

const initialState: MapState = {
  searchEvents: [],
  searchIndex: 0,
  selectedEvent: null,
  selectedAccommodation: null,
  selectedWishlistItem: null,
  days: [],
  routes: null,
  isMapView: false,
  currentRouteIndex: 0,
  showWishlist: true,
  hiddenWishlistIds: [],
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
    setSelectedAccommodation: (
      state,
      action: PayloadAction<Accommodation | null>,
    ) => {
      state.selectedAccommodation = action.payload;
    },
    setSelectedWishlistItem: (
      state,
      action: PayloadAction<WishlistItem | null>,
    ) => {
      state.selectedWishlistItem = action.payload;
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
      if (action.payload) {
        state.isMapView = true;
      }
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
    toggleWishlist: (state) => {
      state.showWishlist = !state.showWishlist;
    },
    toggleWishlistId: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const idx = state.hiddenWishlistIds.indexOf(id);
      if (idx === -1) {
        state.hiddenWishlistIds.push(id);
      } else {
        state.hiddenWishlistIds.splice(idx, 1);
      }
    },
  },
});

export const {
  setDays,
  setSearchEvents,
  setSearchIndex,
  setSelectedEvent,
  setSelectedAccommodation,
  setSelectedWishlistItem,
  markEventAsAdded,
  clearSearchEvents,
  updateSearchEvents,
  setRoutes,
  updateRouteMode,
  setRouteIndex,
  setIsMapView,
  toggleWishlist,
  toggleWishlistId,
} = mapSlice.actions;

export default mapSlice.reducer;

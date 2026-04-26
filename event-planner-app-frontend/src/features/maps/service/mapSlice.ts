import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Day, Event, EventSearchResult } from "../../events/types";

interface MapState {
  searchEvents: EventSearchResult[];
  searchIndex: number;
  selectedEvent: Event | null;
  days: Day[];
}

const initialState: MapState = {
  searchEvents: [],
  searchIndex: 0,
  selectedEvent: null,
  days: [],
};

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
    clearSearch: (state) => {
      state.searchEvents = [];
      state.searchIndex = 0;
    },
  },
});

export const {
  setDays,
  setSearchEvents,
  setSearchIndex,
  setSelectedEvent,
  markEventAsAdded,
  clearSearch,
} = mapSlice.actions;

export default mapSlice.reducer;

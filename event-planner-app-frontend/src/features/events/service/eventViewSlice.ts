import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type EventViewMode = "detailed" | "compact";

export const eventViewStorageKey = "eventViewMode";

const loadViewMode = (): EventViewMode => {
  try {
    return localStorage.getItem(eventViewStorageKey) === "compact"
      ? "compact"
      : "detailed";
  } catch {
    return "detailed";
  }
};

const saveViewMode = (mode: EventViewMode) => {
  try {
    localStorage.setItem(eventViewStorageKey, mode);
  } catch {
    // Storage can be blocked; remembering the view is only a convenience.
  }
};

interface EventViewState {
  mode: EventViewMode;
}

const initialState: EventViewState = { mode: loadViewMode() };

export const eventViewSlice = createSlice({
  name: "eventView",
  initialState,
  reducers: {
    setEventViewMode: (state, action: PayloadAction<EventViewMode>) => {
      state.mode = action.payload;
      saveViewMode(action.payload);
    },
  },
});

export const { setEventViewMode } = eventViewSlice.actions;

export const selectIsCompactView = (state: { eventView: EventViewState }) =>
  state.eventView.mode === "compact";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PresenceUser } from "./types";

interface RealtimeState {
  presence: PresenceUser[];
  /** Latest change made by someone else; `seq` makes repeats distinguishable. */
  remoteChange: { entities: string[]; seq: number } | null;
}

const initialState: RealtimeState = {
  presence: [],
  remoteChange: null,
};

export const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    setPresence: (state, action: PayloadAction<PresenceUser[]>) => {
      state.presence = action.payload;
    },
    remoteChanged: (state, action: PayloadAction<string[]>) => {
      state.remoteChange = {
        entities: action.payload,
        seq: (state.remoteChange?.seq ?? 0) + 1,
      };
    },
    resetRealtime: () => initialState,
  },
});

export const { setPresence, remoteChanged, resetRealtime } =
  realtimeSlice.actions;

import type { ChangeOp, ChatHistoryMessage } from "../ai/types";
import type { PreferencesInput } from "../trips/schemas/preferencesSchema";
import type { Trip } from "../trips/types";

export type DraftTrip = Pick<
  Trip,
  | "name"
  | "destination"
  | "latitude"
  | "longitude"
  | "description"
  | "startDate"
  | "endDate"
>;

export interface TripDraft {
  trip: DraftTrip;
  preferences: Partial<PreferencesInput>;
  timezone: string;
  ops: ChangeOp[];
}

interface BuilderReplyBase {
  reply: string;
}

export interface BuilderQuestion extends BuilderReplyBase {
  missing: string[];
  preferencesSoFar: Record<string, unknown>;
  draft?: undefined;
}

export interface BuilderDraftReply extends BuilderReplyBase {
  draft: TripDraft;
}

export type TripBuilderReply = BuilderQuestion | BuilderDraftReply;

export interface TripBuilderChatRequest {
  message: string;
  history: ChatHistoryMessage[];
}

export type CreateFromDraftRequest = Pick<
  TripDraft,
  "trip" | "preferences" | "ops"
>;

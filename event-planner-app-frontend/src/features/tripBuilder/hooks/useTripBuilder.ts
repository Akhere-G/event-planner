import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import type { ChatMessage } from "../../../components";
import { rememberAnonymousTrip } from "../../api/apiSlice";
import { isApiError } from "../../api/utils";
import {
  useCreateTripFromDraftMutation,
  useSendBuilderMessageMutation,
} from "../services/tripBuilderApiSlice";
import type { TripDraft } from "../types";

const HISTORY_LIMIT = 10;

export default function useTripBuilder() {
  const posthog = usePostHog();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<TripDraft | null>(null);
  const [sendMessage, { isLoading: isSending }] =
    useSendBuilderMessageMutation();
  const [createFromDraft, { isLoading: isCreating }] =
    useCreateTripFromDraftMutation();

  const addMessage = (role: ChatMessage["role"], content: string) =>
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, role, content },
    ]);

  const send = async (text: string) => {
    const history = messages
      .slice(-HISTORY_LIMIT)
      .map(({ role, content }) => ({ role, content }));
    addMessage("user", text);
    setDraft(null);
    try {
      const { data } = await sendMessage({ message: text, history }).unwrap();
      addMessage("assistant", data.reply);
      if (data.draft) setDraft(data.draft);
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not get a response from the AI.");
      }
    }
  };

  const create = async () => {
    if (!draft) return;
    const { trip, preferences, ops } = draft;
    try {
      const { data } = await createFromDraft({
        trip,
        preferences,
        ops,
      }).unwrap();
      if (data.anonymousAccessCode) {
        rememberAnonymousTrip(data.id, data.anonymousAccessCode);
      }
      posthog?.capture("trip_created", {
        trip_id: data.id,
        source: "ai_builder",
      });
      toast.success("Trip created.");
      navigate(`/trips/${data.id}`);
    } catch (err) {
      posthog?.captureException(err);
      toast.error(
        isApiError(err) ? err.data.message : "Could not create the trip.",
      );
    }
  };

  return {
    messages,
    draft,
    isSending,
    isCreating,
    send,
    create,
    keepRefining: () => setDraft(null),
  };
}

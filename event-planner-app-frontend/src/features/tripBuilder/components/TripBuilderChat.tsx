import { ChatThread } from "../../../components";
import useTripBuilder from "../hooks/useTripBuilder";
import { STARTER_PROMPTS } from "../utils";
import TripDraftPreview from "./TripDraftPreview";

export default function TripBuilderChat({ disabled }: { disabled?: boolean }) {
  const { messages, draft, isSending, isCreating, send, create, keepRefining } =
    useTripBuilder();

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="btn-secondary text-sm"
              disabled={disabled}
              onClick={() => void send(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      <ChatThread
        className="h-96 border border-surface-border rounded-xl"
        messages={messages}
        onSend={(text) => void send(text)}
        isSending={isSending}
        disabled={disabled || isCreating}
        label="Describe your trip"
        placeholder="e.g. A week in Lisbon for two in June"
        emptyMessage="Tell me where and when you want to go, and who is coming. I'll draft a plan you can review."
      />
      {draft && (
        <TripDraftPreview
          draft={draft}
          isCreating={isCreating}
          onCreate={() => void create()}
          onRefine={keepRefining}
        />
      )}
    </div>
  );
}

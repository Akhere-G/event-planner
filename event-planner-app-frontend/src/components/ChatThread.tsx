import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatThreadProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isSending?: boolean;
  disabled?: boolean;
  label: string;
  placeholder?: string;
  emptyMessage?: string;
  maxLength?: number;
  className?: string;
}

export default function ChatThread({
  messages,
  onSend,
  isSending = false,
  disabled = false,
  label,
  placeholder = "Type a message…",
  emptyMessage,
  maxLength = 1000,
  className = "",
}: ChatThreadProps) {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length, isSending]);

  const trimmed = draft.trim();
  const canSend = trimmed.length > 0 && !isSending && !disabled;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div className={`flex flex-col min-h-0 h-full ${className}`}>
      <div
        role="log"
        aria-label={label}
        aria-live="polite"
        className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-4"
      >
        {messages.length === 0 && emptyMessage && (
          <p className="text-sm text-text-secondary">{emptyMessage}</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap wrap-break-word ${
              message.role === "user"
                ? "self-end bg-brand-primary text-text-inverse"
                : "self-start bg-surface-muted text-text-primary"
            }`}
          >
            <span className="sr-only">
              {message.role === "user" ? "You: " : "Assistant: "}
            </span>
            {message.content}
          </div>
        ))}
        {isSending && (
          <div
            role="status"
            className="self-start bg-surface-muted text-text-secondary rounded-2xl px-3 py-2 text-sm flex items-center gap-1"
          >
            <span className="sr-only">Assistant is typing</span>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                aria-hidden="true"
                className="size-1.5 rounded-full bg-text-secondary animate-bounce"
                style={{ animationDelay: `${dot * 150}ms` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 items-end p-4 border-t border-surface-border"
      >
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <textarea
          id={inputId}
          rows={2}
          value={draft}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          className="resize-none flex-1"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="btn-primary h-11 w-11 rounded-xl flex items-center justify-center disabled:opacity-50"
        >
          <SendHorizontal size={18} />
        </button>
      </form>
    </div>
  );
}

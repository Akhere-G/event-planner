import { useEffect, useRef, type ReactNode } from "react";
import ChatComposer from "./ChatComposer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatThreadProps<TMessage extends ChatMessage> {
  messages: TMessage[];
  onSend: (text: string) => Promise<void>;
  isSending: boolean;
  renderAction?: (message: TMessage) => ReactNode;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  maxLength?: number;
}

const BUBBLE_CLASSES: Record<ChatMessage["role"], string> = {
  user: "self-end bg-brand-primary text-text-inverse",
  assistant: "self-start bg-surface-muted text-text-primary",
};

const SPEAKER_LABELS: Record<ChatMessage["role"], string> = {
  user: "You: ",
  assistant: "Assistant: ",
};

function TypingIndicator() {
  return (
    <div
      role="status"
      className="flex w-fit items-center gap-1 self-start rounded-xl bg-surface-muted px-3 py-3"
    >
      <span className="sr-only">Assistant is typing</span>
      <span className="size-1.5 animate-bounce rounded-full bg-text-secondary" />
      <span className="size-1.5 animate-bounce rounded-full bg-text-secondary [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-text-secondary [animation-delay:300ms]" />
    </div>
  );
}

export default function ChatThread<TMessage extends ChatMessage>({
  messages,
  onSend,
  isSending,
  renderAction,
  label = "Conversation",
  placeholder = "Type a message",
  emptyMessage = "No messages yet.",
  maxLength = 500,
}: ChatThreadProps<TMessage>) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        role="log"
        aria-live="polite"
        aria-label={label}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
      >
        {messages.length === 0 && (
          <p className="text-sm text-text-secondary">{emptyMessage}</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex max-w-[85%] flex-col gap-2 ${message.role === "user" ? "self-end" : "self-start"}`}
          >
            <p
              className={`whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${BUBBLE_CLASSES[message.role]}`}
            >
              <span className="sr-only">{SPEAKER_LABELS[message.role]}</span>
              {message.content}
            </p>
            {renderAction?.(message)}
          </div>
        ))}
        {isSending && <TypingIndicator />}
        <div ref={endRef} />
      </div>
      <ChatComposer
        onSend={onSend}
        isSending={isSending}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}

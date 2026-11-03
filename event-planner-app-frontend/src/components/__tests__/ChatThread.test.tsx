import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatThread, { type ChatMessage } from "../ChatThread";

const messages: ChatMessage[] = [
  { id: "1", role: "user", content: "Move dinner to 7pm" },
  { id: "2", role: "assistant", content: "Sure, here is the change." },
];

describe("ChatThread", () => {
  it("renders messages in an accessible log", () => {
    render(<ChatThread messages={messages} onSend={vi.fn()} label="Chat" />);

    const log = screen.getByRole("log", { name: "Chat" });
    expect(log).toHaveTextContent("Move dinner to 7pm");
    expect(log).toHaveTextContent("Sure, here is the change.");
  });

  it("shows the empty message when there are no messages", () => {
    render(
      <ChatThread
        messages={[]}
        onSend={vi.fn()}
        label="Chat"
        emptyMessage="Say hello"
      />,
    );
    expect(screen.getByText("Say hello")).toBeInTheDocument();
  });

  it("sends the trimmed text on click and clears the input", async () => {
    const onSend = vi.fn();
    render(<ChatThread messages={[]} onSend={onSend} label="Chat" />);

    const input = screen.getByRole("textbox", { name: "Chat" });
    await userEvent.type(input, "  hello  ");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSend).toHaveBeenCalledWith("hello");
    expect(input).toHaveValue("");
  });

  it("sends on Enter but not Shift+Enter", async () => {
    const onSend = vi.fn();
    render(<ChatThread messages={[]} onSend={onSend} label="Chat" />);

    await userEvent.type(
      screen.getByRole("textbox"),
      "one{Shift>}{Enter}{/Shift}two",
    );
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith("one\ntwo");
  });

  it("disables send for blank input and while sending, and shows typing", async () => {
    const { rerender } = render(
      <ChatThread messages={[]} onSend={vi.fn()} label="Chat" />,
    );
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(
      <ChatThread messages={[]} onSend={vi.fn()} label="Chat" isSending />,
    );
    await userEvent.type(screen.getByRole("textbox"), "hi");
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Assistant is typing");
  });
});

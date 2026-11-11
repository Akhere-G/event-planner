import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatThread, { type ChatMessage } from "../ChatThread";

const MESSAGES: ChatMessage[] = [
  { id: "1", role: "user", content: "Move dinner to 7pm" },
  { id: "2", role: "assistant", content: "Done, it is now at 7pm." },
];

function setup(
  props: Partial<React.ComponentProps<typeof ChatThread>> = {},
  onSend = vi.fn().mockResolvedValue(undefined),
) {
  render(
    <ChatThread messages={[]} onSend={onSend} isSending={false} {...props} />,
  );
  return { onSend, user: userEvent.setup() };
}

describe("ChatThread", () => {
  it("shows the conversation in a log with who said what", () => {
    setup({ messages: MESSAGES, label: "Edit chat" });

    const log = screen.getByRole("log", { name: "Edit chat" });
    expect(log).toHaveTextContent("You: Move dinner to 7pm");
    expect(log).toHaveTextContent("Assistant: Done, it is now at 7pm.");
  });

  it("shows the empty message until there is a conversation", () => {
    setup({ emptyMessage: "Ask me anything." });

    expect(screen.getByText("Ask me anything.")).toBeInTheDocument();
  });

  it("sends the trimmed message from the button and clears the box", async () => {
    const { onSend, user } = setup();
    const box = screen.getByRole("textbox", { name: "Message" });

    await user.type(box, "  Add a museum  ");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(onSend).toHaveBeenCalledWith("Add a museum"));
    expect(box).toHaveValue("");
  });

  it("sends on Enter but starts a new line on Shift+Enter", async () => {
    const { onSend, user } = setup();
    const box = screen.getByRole("textbox", { name: "Message" });

    await user.type(box, "one{Shift>}{Enter}{/Shift}two");
    expect(onSend).not.toHaveBeenCalled();
    expect(box).toHaveValue("one\ntwo");

    await user.type(box, "{Enter}");
    await waitFor(() => expect(onSend).toHaveBeenCalledWith("one\ntwo"));
  });

  it("can send several messages in a row", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <ChatThread messages={[]} onSend={onSend} isSending={false} />,
    );
    const box = screen.getByRole("textbox", { name: "Message" });

    await user.type(box, "first{Enter}");
    rerender(<ChatThread messages={[]} onSend={onSend} isSending />);
    rerender(<ChatThread messages={[]} onSend={onSend} isSending={false} />);
    await user.type(box, "second{Enter}");

    await waitFor(() => expect(onSend).toHaveBeenCalledWith("second"));
  });

  it("cannot send a blank message", async () => {
    const { user } = setup();

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "   ");
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("rejects a message over the limit", async () => {
    const { onSend, user } = setup({ maxLength: 5 });

    await user.type(screen.getByRole("textbox"), "too long{Enter}");

    expect(
      await screen.findByText("Keep it under 5 characters."),
    ).toBeVisible();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows a typing indicator and disables sending while waiting", async () => {
    const { user } = setup({ isSending: true });

    expect(screen.getByRole("status")).toHaveTextContent("Assistant is typing");
    await user.type(screen.getByRole("textbox"), "More");
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("renders an action under a message", () => {
    setup({
      messages: MESSAGES,
      renderAction: (message) =>
        message.role === "assistant" ? <button>Review</button> : null,
    });

    expect(screen.getAllByRole("button", { name: "Review" })).toHaveLength(1);
  });
});

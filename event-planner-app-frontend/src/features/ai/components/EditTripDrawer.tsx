import { useRef, useState } from "react";
import { usePostHog } from "@posthog/react";
import { TASK_ICONS } from "../../aiTasks/utils";
import { toast } from "sonner";
import { ChatThread } from "../../../components";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../../../components/ui/sheet";
import { isApiError } from "../../api/utils";
import { ProposalReviewModal } from "../../aiTasks/components";
import type { Trip } from "../../trips/types";
import {
  MAX_EDIT_HISTORY_MESSAGES,
  MAX_EDIT_MESSAGE_LENGTH,
} from "../constants";
import { useProposeTripEditMutation } from "../services/aiApiSlice";
import type { ChatHistoryMessage, EditMessage } from "../types";
import ReviewChangesAction from "./ReviewChangesAction";

export default function EditTripDrawer({ trip }: { trip: Trip }) {
  const posthog = usePostHog();
  const [proposeTripEdit, { isLoading }] = useProposeTripEditMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<EditMessage[]>([]);
  const [reviewTaskId, setReviewTaskId] = useState<number | null>(null);
  const [decidedTaskIds, setDecidedTaskIds] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const nextMessageId = useRef(0);

  const newMessage = (
    role: EditMessage["role"],
    content: string,
    proposal?: Pick<EditMessage, "taskId" | "opCount">,
  ): EditMessage => ({
    id: String(nextMessageId.current++),
    role,
    content,
    ...proposal,
  });

  const handleSend = async (text: string) => {
    const history: ChatHistoryMessage[] = [];
    for (const { role, content } of messages.slice(
      -MAX_EDIT_HISTORY_MESSAGES,
    )) {
      history.push({ role, content });
    }
    setMessages((current) => [...current, newMessage("user", text)]);

    try {
      const { data } = await proposeTripEdit({
        tripId: trip.id,
        message: text,
        history,
      }).unwrap();
      const proposal = data.task
        ? { taskId: data.task.id, opCount: data.task.opCount }
        : undefined;
      setMessages((current) => [
        ...current,
        newMessage("assistant", data.reply, proposal),
      ]);
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not get a reply. Please try again.");
      }
    }
  };

  const closeReview = (decided: boolean) => {
    if (decided && reviewTaskId !== null) {
      setDecidedTaskIds((current) => new Set(current).add(reviewTaskId));
    }
    setReviewTaskId(null);
  };

  const renderAction = ({ taskId, opCount }: EditMessage) => {
    if (taskId === undefined || opCount === undefined) return null;
    return (
      <ReviewChangesAction
        opCount={opCount}
        isDecided={decidedTaskIds.has(taskId)}
        onReview={() => setReviewTaskId(taskId)}
      />
    );
  };

  return (
    <>
      <button
        type="button"
        className="btn-secondary inline-flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <TASK_ICONS.edit_trip className="size-4" />
        Ask AI to edit
      </button>
      {/* Hidden while reviewing, so the review dialog is not stacked on top of it. */}
      <Sheet open={isOpen && reviewTaskId === null} onOpenChange={setIsOpen}>
        <SheetContent>
          <div className="flex flex-col gap-1 pr-8">
            <SheetTitle>Ask AI to edit</SheetTitle>
            <SheetDescription>
              Describe a change. Nothing is saved until you review and apply it.
            </SheetDescription>
          </div>
          <ChatThread
            messages={messages}
            onSend={handleSend}
            isSending={isLoading}
            renderAction={renderAction}
            label="Edit conversation"
            placeholder="e.g. Move dinner to 7pm"
            emptyMessage="Try “Move dinner to 7pm” or “Swap day 3's museum for something outdoors”."
            maxLength={MAX_EDIT_MESSAGE_LENGTH}
          />
        </SheetContent>
      </Sheet>
      {reviewTaskId !== null && (
        <ProposalReviewModal
          tripId={trip.id}
          taskId={reviewTaskId}
          onClose={closeReview}
        />
      )}
    </>
  );
}

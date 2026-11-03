import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { ChatThread, type ChatMessage } from "../../../components";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import { usePreviewTripEditMutation } from "../services/aiApiSlice";
import type { ChangeOp } from "../types";
import ChangePreviewModal from "./ChangePreviewModal";

const HISTORY_LIMIT = 10;

export default function EditTripDrawer({ trip }: { trip: Trip }) {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingOps, setPendingOps] = useState<ChangeOp[] | null>(null);
  const [previewTripEdit, { isLoading }] = usePreviewTripEditMutation();

  const addMessage = (role: ChatMessage["role"], content: string) =>
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, role, content },
    ]);

  const handleSend = async (text: string) => {
    const history = messages
      .slice(-HISTORY_LIMIT)
      .map(({ role, content }) => ({ role, content }));
    addMessage("user", text);
    try {
      const result = await previewTripEdit({
        tripId: trip.id,
        message: text,
        history,
      }).unwrap();
      const { reply, ops } = result.data;
      addMessage("assistant", reply);
      if (ops.length > 0) setPendingOps(ops);
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not get a response from the AI.");
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary flex items-center gap-2 px-4 h-11 rounded-xl w-full justify-center"
      >
        <Sparkles size={16} aria-hidden="true" />
        Ask AI to edit
      </button>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs" />
          <DialogPrimitive.Popup className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-md bg-surface text-text-primary border-l border-surface-border shadow-xl outline-none">
            <div className="flex items-center justify-between p-4 border-b border-surface-border">
              <div>
                <DialogPrimitive.Title className="font-semibold">
                  Ask AI to edit
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-text-secondary">
                  Describe a change. You review it before anything is saved.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                aria-label="Close"
                className="btn-menu p-2 rounded-md"
              >
                <X size={18} />
              </DialogPrimitive.Close>
            </div>
            <ChatThread
              messages={messages}
              onSend={handleSend}
              isSending={isLoading}
              label="Describe the change you want"
              placeholder="e.g. Move dinner to 7pm"
              emptyMessage={`Try "move dinner to 7pm" or "swap day 3's museum for something outdoors".`}
            />
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {pendingOps && (
        <ChangePreviewModal
          open
          onOpenChange={(next) => !next && setPendingOps(null)}
          tripId={trip.id}
          timezone={trip.timezone}
          ops={pendingOps}
          events={trip.events}
          title="Review AI changes"
          onApplied={() => {
            addMessage("assistant", "Done. Those changes have been applied.");
            setPendingOps(null);
          }}
        />
      )}
    </>
  );
}

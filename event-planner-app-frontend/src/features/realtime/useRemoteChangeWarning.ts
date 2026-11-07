import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "../../store";

/**
 * While an edit modal is open, warn when someone else changes the same kind of
 * item. Saving still overwrites theirs (last write wins), so the toast tells
 * the user to review before saving.
 */
export default function useRemoteChangeWarning(entity: string, isOpen: boolean) {
  const remoteChange = useSelector((state: RootState) => state.realtime.remoteChange);
  const seenSeq = useRef(remoteChange?.seq ?? 0);

  useEffect(() => {
    if (!remoteChange || remoteChange.seq === seenSeq.current) return;
    seenSeq.current = remoteChange.seq;

    if (isOpen && remoteChange.entities.includes(entity)) {
      toast.warning(
        `Someone else just changed this ${entity}. Close and reopen to see their update; saving will overwrite it.`,
        { id: `remote-change-${entity}` },
      );
    }
  }, [remoteChange, isOpen, entity]);
}

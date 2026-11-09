interface ProposalFooterProps {
  selectedCount: number;
  /** Applicable suggestions the user chose not to apply. */
  skippedCount: number;
  unavailableCount: number;
  isBusy: boolean;
  onDecideLater: () => void;
  onReject: () => void;
  onApply: () => void;
}

export default function ProposalFooter({
  selectedCount,
  skippedCount,
  unavailableCount,
  isBusy,
  onDecideLater,
  onReject,
  onApply,
}: ProposalFooterProps) {
  const notes = [`${skippedCount} skipped`];
  if (unavailableCount > 0) {
    notes.push(
      `${unavailableCount} unavailable ${unavailableCount === 1 ? "suggestion" : "suggestions"} won't be applied`,
    );
  }

  return (
    <footer className="flex flex-col gap-3 border-t border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-text-primary">{selectedCount} selected</p>
        <p className="text-xs text-text-secondary">{notes.join(" · ")}</p>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button className="btn-secondary" disabled={isBusy} onClick={onDecideLater}>
          Decide later
        </button>
        <button className="btn-error" disabled={isBusy} onClick={onReject}>
          Reject all
        </button>
        <button
          className="btn-primary px-4"
          disabled={isBusy || selectedCount === 0}
          onClick={onApply}
        >
          {selectedCount === 0
            ? "Select changes"
            : `Apply ${selectedCount} ${selectedCount === 1 ? "change" : "changes"}`}
        </button>
      </div>
    </footer>
  );
}

import { ClipboardCheck } from "lucide-react";

interface ReviewChangesActionProps {
  opCount: number;
  isDecided: boolean;
  onReview: () => void;
}

export default function ReviewChangesAction({
  opCount,
  isDecided,
  onReview,
}: ReviewChangesActionProps) {
  if (isDecided) {
    return <p className="text-xs text-text-secondary">Reviewed</p>;
  }

  return (
    <button
      type="button"
      className="btn-secondary inline-flex w-fit items-center gap-2"
      onClick={onReview}
    >
      <ClipboardCheck className="size-4" />
      Review {opCount} {opCount === 1 ? "change" : "changes"}
    </button>
  );
}

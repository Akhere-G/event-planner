import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import { canUserEdit } from "../../users/utils";
import { usePreviewCostEstimatesMutation } from "../services/aiApiSlice";
import type { ChangeOp } from "../types";
import ChangePreviewModal from "./ChangePreviewModal";

export default function EstimateCostsButton({ trip }: { trip: Trip }) {
  const posthog = usePostHog();
  const [previewCostEstimates, { isLoading }] =
    usePreviewCostEstimatesMutation();
  const [ops, setOps] = useState<ChangeOp[] | null>(null);

  if (!canUserEdit(trip.role)) return null;

  const handleEstimate = async () => {
    try {
      const { data } = await previewCostEstimates({ tripId: trip.id }).unwrap();
      if (!data.ops.length) {
        toast.info("Everything in this trip already has a cost estimate.");
        return;
      }
      setOps(data.ops);
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not estimate costs.");
      }
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn-secondary flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
        onClick={handleEstimate}
        disabled={isLoading}
      >
        {isLoading ? (
          <LoaderCircle className="animate-spin" size={16} />
        ) : (
          <Sparkles className="text-brand-primary" size={16} />
        )}
        Estimate costs
      </button>
      {ops && (
        <ChangePreviewModal
          open
          onOpenChange={(open) => !open && setOps(null)}
          tripId={trip.id}
          timezone={trip.timezone}
          ops={ops}
          events={trip.events}
          title="Review cost estimates"
        />
      )}
    </>
  );
}

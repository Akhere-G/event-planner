import { StateGate } from "../../../components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import type { Trip } from "../../trips/types";
import { useGetPublishStatusQuery } from "../services/templatesApiSlice";
import PublishTemplateForm from "./PublishTemplateForm";

interface PublishTemplateModalProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublishTemplateModal({
  trip,
  open,
  onOpenChange,
}: PublishTemplateModalProps) {
  const { data, isLoading, isError } = useGetPublishStatusQuery(trip.id);
  const status = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>
            {status?.isPublished ? "Update template" : "Publish as template"}
          </DialogTitle>
        </DialogHeader>
        <StateGate
          loadingStateProps={{ isLoading, message: "Checking template..." }}
          errorStateProps={{ isError, message: "Failed to load template." }}
        >
          {status && (
            <PublishTemplateForm
              trip={trip}
              status={status}
              onDone={() => onOpenChange(false)}
            />
          )}
        </StateGate>
      </DialogContent>
    </Dialog>
  );
}

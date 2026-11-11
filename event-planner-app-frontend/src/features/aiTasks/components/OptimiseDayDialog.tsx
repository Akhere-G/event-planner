import { TASK_ICONS } from "../utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../components/ui/dialog";
import OptimiseDayForm from "./OptimiseDayForm";

type OptimiseDayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & Omit<React.ComponentProps<typeof OptimiseDayForm>, "onCancel">;

export default function OptimiseDayDialog({
  open,
  onOpenChange,
  ...form
}: OptimiseDayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden p-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full! max-sm:translate-y-0 max-sm:rounded-b-none sm:w-[min(92vw,680px)]"
      >
        <header className="flex items-center gap-3 bg-brand-primary p-4 pr-12 text-text-inverse">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-text-inverse/20">
            <TASK_ICONS.optimise_day size={20} />
          </span>
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-lg font-semibold">
              Optimise your days
            </DialogTitle>
            <DialogDescription className="text-text-inverse/80">
              Tell the AI what a better itinerary looks like.
            </DialogDescription>
          </div>
        </header>
        <OptimiseDayForm {...form} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

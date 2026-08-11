import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmText?: string;
  confirmAction?: () => void;
  confirmBtnClasses?: string;
  children?: React.ReactNode;
  confirmButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  hideButtons?: boolean;
  description?: string;
}

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  confirmText = "Delete",
  confirmAction,
  confirmBtnClasses = "btn-error",
  children,
  confirmButtonProps,
  hideButtons = false,
  description,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vh] w-[90vh] max-h-[90vh] overflow-hidden flex flex-col bg-surface text-left border-brand-primary/80">
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle className="title text-text-inverse">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-text-inverse/80">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="overflow-scroll max-h-[70vh] flex-1">{children}</div>

        {!hideButtons && (
          <DialogFooter className="mt-4 p-4 -mx-4 -mb-4 rounded-b-xl border-t bg-muted/50">
            <button
              className="btn-secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <Button
              onClick={confirmAction}
              className={confirmBtnClasses + " py-5"}
              {...confirmButtonProps}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

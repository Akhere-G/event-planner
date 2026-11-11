import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "./dialog";

function SheetContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col gap-4 rounded-t-xl bg-surface p-4 text-sm text-text-primary shadow-xl ring-1 ring-surface-border outline-none duration-200 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[min(92vw,440px)] sm:rounded-none sm:data-open:slide-in-from-right sm:data-closed:slide-out-to-right",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          data-slot="sheet-close"
          render={
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            />
          }
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

export {
  Dialog as Sheet,
  SheetContent,
  DialogDescription as SheetDescription,
  DialogTitle as SheetTitle,
};

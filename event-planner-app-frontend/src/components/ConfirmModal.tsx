import { X } from "lucide-react";
import type { Ref } from "react";

// TODO: convert to shadcn modal

export default function ConfirmModal({
  closeModal,
  title,
  confirmText = "Delete",
  confirmAction,
  confirmBtnClasses = "btn-error",
  modalRef,
  children,
  confirmButtonProps,
  hideButtons = false,
}: {
  closeModal: () => void;
  title: string;
  confirmText?: string;
  confirmAction?: () => void;
  confirmBtnClasses?: string;
  modalRef?: Ref<HTMLDivElement>;
  children?: React.ReactNode;
  confirmButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  hideButtons?: boolean;
}) {
  return (
    <div
      className="backdrop fixed top-0 left-0 right-0 z-50 "
      onClick={closeModal}
    >
      <div
        className="modal flex items-center justify-center w-fit max-w-15/16 max-h-[90vh] overflow-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={modalRef}
          className="card border-brand-primary/80 p-0 overflow-clip w-[90vh] flex flex-col shadow-xl bg-surface text-left"
        >
          <div>
            <div className="p-4 text-text-inverse bg-brand-primary flex gap-2 items-center justify-between">
              <h3 className="title">{title}</h3>
              <button
                onClick={closeModal}
                className="text-text-inverse btn p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-scroll max-h-[70vh]">{children}</div>

            {!hideButtons && (
              <div className="p-4 mt-4 flex justify-end gap-2">
                <button onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={confirmBtnClasses}
                  {...confirmButtonProps}
                >
                  {confirmText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

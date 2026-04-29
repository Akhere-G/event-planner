import { X } from "lucide-react";

export default function ConfirmModal({
  closeModal,
  title,
  confirmText = "Delete",
  confirmAction,
  confirmBtnClasses = "btn-error",
}: {
  closeModal: () => void;
  title: string;
  confirmText?: string;
  confirmAction: () => void;
  confirmBtnClasses?: string;
}) {
  return (
    <div className="backdrop fixed w-screen z-400 " onClick={closeModal}>
      <div
        className="modal flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card border-brand-primary/80 p-0 overflow-clip w-[90vh] flex flex-col shadow-xl bg-surface text-left">
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

            <div className="p-4 mt-4 flex justify-end gap-2">
              <button onClick={closeModal} className="btn-secondary">
                Cancel
              </button>
              <button onClick={confirmAction} className={confirmBtnClasses}>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

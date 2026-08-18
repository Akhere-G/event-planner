import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EditableTextProps {
  value: string;
  setValue: (str: string) => void;
  emptyText?: string;
  canEdit?: boolean;
  textClassNames?: string;
  inputClassNames?: string;
}

export default function EditableText({
  value,
  setValue,
  textClassNames = "",
  inputClassNames = "",
  emptyText = "",
  canEdit = false,
}: EditableTextProps) {
  const [dirtyValue, setDirtyValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (canEdit && isEditing && ref.current) {
      ref.current.focus();
    }
  }, [canEdit, ref, isEditing]);

  const onFinished = () => {
    if (dirtyValue !== value) {
      setValue(dirtyValue);
    }
    setIsEditing(false);
  };

  return (
    <>
      <textarea
        className={`${isEditing && canEdit ? "visible block" : "invisible hidden"} p-0 m-0 mb-0.5 min-h-5 rounded-none ${inputClassNames}`}
        value={dirtyValue ?? ""}
        placeholder={emptyText}
        onChange={(e) => setDirtyValue(e.target.value)}
        onKeyDownCapture={(e) => e.key === "Enter" && onFinished()}
        onBlur={onFinished}
        ref={ref}
      />
      <p
        onClick={() => {
          setIsEditing(true);
        }}
        className={`${canEdit && isEditing ? "invisible hidden" : "visible block"} relative group p-0 m-0 min-h-5 cursor-text  
        ${canEdit ? " cursor-pointer hover:bg-surface-muted" : ""} duration-300 ${!value && emptyText ? "text-text-secondary" : ""} ${textClassNames}`}
      >
        {value || emptyText}
        {canEdit && (
          <div className="absolute -top-2 -right-2 hidden group-hover:flex">
            <Pencil size={10} />
          </div>
        )}
      </p>
    </>
  );
}

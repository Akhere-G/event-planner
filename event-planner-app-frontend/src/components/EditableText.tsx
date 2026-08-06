import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EditableTextProps {
  value: string;
  setValue: (str: string) => void;
  inputClassName?: string;
  textClassName?: string;
  emptyText?: string;
  canEdit?: boolean;
}
export default function EditableText({
  value,
  setValue,
  inputClassName = "",
  textClassName = "",
  emptyText = "",
  canEdit = true,
}: EditableTextProps) {
  const [dirtyValue, setDirtyValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

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
      <input
        className={`${isEditing && canEdit ? "visible block" : "invisible hidden"} p-0 m-0 min-h-5 rounded-none ${inputClassName}`}
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
        className={`${canEdit && isEditing ? "invisible hidden" : "visible block"} relative group p-0 m-0 min-h-5 cursor-text max-w-[70vw]  
        ${canEdit ? " cursor-pointer hover:bg-surface-muted" : ""} duration-300 ${textClassName} ${!value && emptyText ? "text-text-secondary" : ""}`}
      >
        {value || emptyText}
        {canEdit && (
          <div className="absolute -top-2 -right-2 hidden group-hover:flex ">
            <Pencil size={10} />
          </div>
        )}
      </p>
    </>
  );
}

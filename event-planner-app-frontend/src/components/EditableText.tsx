import { useEffect, useRef, useState } from "react";

interface EditableTextProps {
  value: string;
  setValue: (str: string) => void;
  inputClassName?: string;
  textClassName?: string;
  emptyText?: string;
}
export default function EditableText({
  value,
  setValue,
  inputClassName = "",
  textClassName = "",
  emptyText = "",
}: EditableTextProps) {
  const [dirtyValue, setDirtyValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
    }
  }, [ref, isEditing]);

  const onFinished = () => {
    if (dirtyValue !== value) {
      setValue(dirtyValue);
    }
    setIsEditing(false);
  };
  return (
    <>
      <input
        className={`${isEditing ? "visible block" : "invisible hidden"} p-0 m-0 min-h-5 rounded-none ${inputClassName}`}
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
        className={`${isEditing ? "invisible hidden" : "visible block"} p-0 m-0 min-h-5 cursor-text max-w-[70vw] max-h-40   truncate  
        hover:bg-surface-muted duration-300 ${textClassName} ${!value && emptyText ? "text-text-secondary" : ""}`}
      >
        {value || emptyText}
      </p>
    </>
  );
}

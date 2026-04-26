import React from "react";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Option {
  title: string;
  value: string;
}

interface EditableSelectProps {
  setValue?: (str: string) => void;
  defaultElement: React.ReactNode;
  options?: Option[];
  selectClassName?: string;
  selectedValue: string;
  CustomSelect?: (props: CustomSelectProps) => React.JSX.Element;
  canEdit: boolean;
  isLoading?: boolean;
}

interface CustomSelectProps {
  close: () => void;
}
export default function EditableSelect({
  setValue = () => {},
  defaultElement,
  options,
  selectClassName = "",
  selectedValue,
  CustomSelect,
  canEdit,
  isLoading = false,
}: EditableSelectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canEdit) return;

    if (isEditing && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isEditing, canEdit]);

  useEffect(() => {
    if (!canEdit) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, canEdit]);

  return (
    <div className="relative" ref={containerRef}>
      {canEdit && isEditing && (
        <div
          className={`card absolute z-10 -top-2 -right-6 p-2 shadow-xl ${selectClassName}`}
        >
          {options?.map(({ title, value }, index) => (
            <button
              key={value}
              ref={index === 0 ? firstButtonRef : null}
              disabled={isLoading}
              className={`p-1 hover:bg-surface-muted focus:bg-surface-muted
              focus:outline-0! rounded-none transition-colors
              ${selectedValue === value ? "bg-brand-secondary! text-text-inverse!" : ""}
              `}
              onClick={(e) => {
                e.stopPropagation();
                setValue(value);
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsEditing(false);
              }}
            >
              {title}
            </button>
          ))}
          {CustomSelect && <CustomSelect close={() => setIsEditing(false)} />}
        </div>
      )}

      <div
        className={`${canEdit ? "cursor-pointer" : ""} relative group`}
        onClick={(e) => {
          e.stopPropagation();
          if (canEdit && !isLoading) setIsEditing((prev) => !prev);
        }}
      >
        {canEdit && !isLoading && (
          <div className="absolute -top-2 -right-2 hidden group-hover:flex ">
            <Pencil size={10} />
          </div>
        )}
        {defaultElement}
      </div>
    </div>
  );
}

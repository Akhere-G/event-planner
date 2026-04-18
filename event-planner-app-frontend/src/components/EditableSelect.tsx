import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Option {
  title: string;
  value: string;
}

interface EditableSelectProps {
  setValue: (str: string) => void;
  defaultElement: React.ReactNode;
  options: Option[];
  selectClassName?: string;
  selectedValue: string;
}

export default function EditableSelect({
  setValue,
  defaultElement,
  options,
  selectClassName = "",
  selectedValue,
}: EditableSelectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
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
  }, [isEditing]);

  console.log(selectedValue);
  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`${isEditing ? "visible block" : "invisible hidden"} 
          card absolute z-10 left-0 p-2 shadow-xl ${selectClassName}`}
      >
        {options.map(({ title, value }, index) => (
          <button
            key={value}
            ref={index === 0 ? firstButtonRef : null}
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
      </div>

      <div
        className="cursor-pointer relative group"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing((prev) => !prev);
        }}
      >
        <div className="absolute -top-2 -right-2 hidden group-hover:flex ">
          <Pencil size={10} />
        </div>
        {defaultElement}
      </div>
    </div>
  );
}

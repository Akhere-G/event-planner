import { useEffect, useRef, useState } from "react";

interface Option {
  title: string;
  value: string;
}
interface EditableSelectProps {
  setValue: (str: string) => void;
  defaultElement: React.ReactNode;
  options: Option[];
}
export default function EditableSelect({
  setValue,
  defaultElement,
  options,
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`${isEditing ? "visible block" : "invisible hidden"} 
          card absolute z-10 right-0 p-2 flex flex-col `}
        onBlur={() => setIsEditing(false)}
      >
        {options.map(({ title, value }, index) => (
          <button
            className="p-1 hover:text-text-inverse hover:bg-brand-secondary focus:text-text-inverse focus:bg-brand-secondary  focus:outline-0!  rounded-none"
            key={value}
            onClick={() => {
              setValue(value);
              setIsEditing(false);
            }}
            onBlur={(e) => {
              if (index !== options.length - 1) e.stopPropagation();
            }}
            ref={index === 0 ? firstButtonRef : null}
          >
            {title}
          </button>
        ))}
      </div>
      <div
        className="cursor-pointer"
        onClick={() => {
          setIsEditing(true);
        }}
      >
        {defaultElement}
      </div>
    </div>
  );
}

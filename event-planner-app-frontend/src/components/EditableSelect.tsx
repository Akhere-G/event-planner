import React from "react";
import { Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
  canEdit: boolean;
}

export default function EditableSelect({
  setValue = () => {},
  defaultElement,
  options,
  selectClassName = "",
  selectedValue,
  canEdit,
}: EditableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    console.log({ value });
    setValue(value);
    setOpen(false);
  };

  return (
    <DropdownMenu open={canEdit ? open : false} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="w-min m-0 p-0 my-2">
        <div className={`${canEdit ? "cursor-pointer" : ""} relative group`}>
          {canEdit && (
            <div className="absolute -top-2 -right-2 hidden group-hover:flex">
              <Pencil size={10} />
            </div>
          )}
          {defaultElement}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`card shadow-xl ${selectClassName}`}
        align="end"
      >
        {options?.map(({ title, value }) => (
          <DropdownMenuItem
            key={value}
            className={`p-1 hover:bg-surface-muted focus:bg-surface-muted
              focus:outline-0! rounded-none transition-colors
              ${selectedValue === value ? "bg-brand-secondary! text-text-inverse!" : ""}
              `}
            onClick={() => handleSelect(value)}
          >
            {title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

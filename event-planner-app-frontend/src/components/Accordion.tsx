import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

export default function Accordion({
  defaultIsOpen = true,
  title,
  content,
}: {
  title: ReactNode;
  content: ReactNode;
  defaultIsOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return (
    <section>
      <header
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex-1">{title}</div>

        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </header>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className={isOpen ? "" : "overflow-y-hidden"}>
          <div className="pb-4 text-sm">{content}</div>
        </div>
      </div>
    </section>
  );
}

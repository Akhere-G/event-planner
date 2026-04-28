import { ChevronDown } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

interface ComponentProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}
export default function Accordion({
  defaultIsOpen = true,
  TitleComponent,
  ContentComponent,
  headerStyles,
  contentStyles,
}: {
  TitleComponent: (props: ComponentProps) => React.JSX.Element;
  ContentComponent: (props: ComponentProps) => React.JSX.Element;
  defaultIsOpen?: boolean;
  headerStyles?: string;
  contentStyles?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return (
    <section>
      <header
        className={`flex cursor-pointer items-center gap-1 p-4 ${headerStyles}`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
      >
        <ChevronDown
          size={20}
          className={`transition-all duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
        <TitleComponent isOpen={isOpen} setIsOpen={setIsOpen} />
      </header>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div
          className={
            "transition-all duration-300 " + (isOpen ? "" : "overflow-y-hidden")
          }
        >
          <div className={`pb-4 text-sm ${contentStyles}`}>
            <ContentComponent isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </div>
    </section>
  );
}

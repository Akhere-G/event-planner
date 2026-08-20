import { useEffect, useState } from "react";
import {
  Accordion as ShadcnAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export default function Accordion({
  open,
  defaultIsOpen = false,
  TitleComponent,
  ContentComponent,
  headerStyles,
  contentStyles,
  onOpenChange,
}: {
  TitleComponent: () => React.JSX.Element;
  ContentComponent: () => React.JSX.Element;
  open?: boolean;
  defaultIsOpen?: boolean;
  headerStyles?: string;
  contentStyles?: string;
  onOpenChange?: (isOpen: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultIsOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  useEffect(() => {
    if (!isControlled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInternalOpen(defaultIsOpen);
    }
  }, [defaultIsOpen, isControlled]);

  return (
    <ShadcnAccordion
      value={isOpen ? ["item-1"] : []}
      onValueChange={(newValue) => {
        const nextOpen = newValue.includes("item-1");

        if (!isControlled) {
          setInternalOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
      }}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger
          className={`flex cursor-pointer items-center gap-1 p-4 ${headerStyles}`}
        >
          <div className="flex flex-1">
            <TitleComponent />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className={`pb-4 text-sm ${contentStyles}`}>
            <ContentComponent />
          </div>
        </AccordionContent>
      </AccordionItem>
    </ShadcnAccordion>
  );
}

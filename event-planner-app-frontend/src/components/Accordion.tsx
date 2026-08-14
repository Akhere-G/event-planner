import {
  Accordion as ShadcnAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export default function Accordion({
  defaultIsOpen = true,
  TitleComponent,
  ContentComponent,
  headerStyles,
  contentStyles,
}: {
  TitleComponent: () => React.JSX.Element;
  ContentComponent: () => React.JSX.Element;
  defaultIsOpen?: boolean;
  headerStyles?: string;
  contentStyles?: string;
}) {
  return (
    <ShadcnAccordion type="single" defaultValue={defaultIsOpen ? "item-1" : undefined} collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className={`flex cursor-pointer items-center gap-1 p-4 ${headerStyles}`}>
          <TitleComponent />
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

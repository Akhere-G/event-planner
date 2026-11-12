import { TrackedLink } from "../../components/TrackedLink";
import { templateUrl } from "../../lib/urls";
import type { DestinationGuide } from "../types";

export function TemplateLink({
  guide,
  className,
  label = "See the template",
}: {
  guide: DestinationGuide;
  className?: string;
  label?: string;
}) {
  return (
    <TrackedLink
      href={templateUrl(guide.templateSlug)}
      event="template_link_clicked"
      className={className}
    >
      {label}
    </TrackedLink>
  );
}

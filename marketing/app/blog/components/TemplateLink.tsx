import { TrackedLink } from "../../components/TrackedLink";
import { templateUrl } from "../../lib/urls";
import type { BlogPost } from "../types";

export function TemplateLink({
  post,
  className,
  label = "See the template",
}: {
  post: BlogPost;
  className?: string;
  label?: string;
}) {
  return (
    <TrackedLink
      href={templateUrl(post.templateSlug)}
      event="template_link_clicked"
      className={className}
    >
      {label}
    </TrackedLink>
  );
}

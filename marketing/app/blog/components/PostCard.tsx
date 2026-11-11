import Link from "next/link";
import { postPath } from "../../lib/urls";
import type { BlogPost } from "../types";
import { TemplateLink } from "./TemplateLink";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
        {post.country}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">
        <Link href={postPath(post.slug)}>{post.city}</Link>
      </h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">
        {post.description}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold">
        <Link
          href={postPath(post.slug)}
          className="text-slate-900 hover:text-brand-primary transition-colors"
        >
          Read the guide
        </Link>
        <TemplateLink
          post={post}
          label={`${post.templateDays}-day template`}
          className="text-brand-primary hover:text-brand-primary/80 transition-colors"
        />
      </div>
    </article>
  );
}

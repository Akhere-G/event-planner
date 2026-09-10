"use client";

import { posthog } from "posthog-js";
import Link from "next/link";

export function TrackedLink({
  href,
  event,
  children,
  className,
}: {
  href: string;
  event: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => posthog.capture(event)}
    >
      {children}
    </Link>
  );
}

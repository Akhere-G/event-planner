export const SITE_URL = "https://triptrack.uk";

export const APP_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://app.triptrack.uk";

export function templateUrl(templateSlug: string): string {
  return `${APP_URL}/templates/${templateSlug}`;
}

export function postPath(postSlug: string): string {
  return `/blog/${postSlug}`;
}

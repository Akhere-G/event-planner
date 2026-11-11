import type { BlogPost, BlogRegion } from "./types";

export const REGION_ORDER: BlogRegion[] = ["Asia", "Europe", "North America"];

export function groupByRegion(
  posts: BlogPost[],
): { region: BlogRegion; posts: BlogPost[] }[] {
  const groups: { region: BlogRegion; posts: BlogPost[] }[] = [];
  for (const region of REGION_ORDER) {
    const inRegion: BlogPost[] = [];
    for (const post of posts) {
      if (post.region === region) {
        inRegion.push(post);
      }
    }
    if (inRegion.length > 0) {
      groups.push({ region, posts: inRegion });
    }
  }
  return groups;
}

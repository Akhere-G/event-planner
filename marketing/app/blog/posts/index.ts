import type { BlogPost } from "../types";
import { amsterdamPost } from "./amsterdam";
import { baliPost } from "./bali";
import { bangkokPost } from "./bangkok";
import { barcelonaPost } from "./barcelona";
import { budapestPost } from "./budapest";
import { hanoiPost } from "./hanoi";
import { lisbonPost } from "./lisbon";
import { newYorkPost } from "./new-york";
import { parisPost } from "./paris";
import { praguePost } from "./prague";
import { romePost } from "./rome";
import { seoulPost } from "./seoul";
import { tokyoPost } from "./tokyo";

export const blogPosts: BlogPost[] = [
  bangkokPost,
  tokyoPost,
  seoulPost,
  hanoiPost,
  baliPost,
  parisPost,
  barcelonaPost,
  amsterdamPost,
  praguePost,
  lisbonPost,
  romePost,
  budapestPost,
  newYorkPost,
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

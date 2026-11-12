import { blogPosts } from "../posts";
import { groupByRegion } from "../regions";
import { PostCard } from "./PostCard";

export function RegionGroups() {
  return (
    <>
      {groupByRegion(blogPosts).map(({ region, posts }) => (
        <section key={region} className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-900">{region}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

import type { Metadata } from "next";
import { get } from "@/lib/db";
import { BlogGrid } from "@/components/pages/BlogGrid";
import { MagazineCover } from "@/components/pages/inner3/MagazineCover";
import { NewsletterStrip } from "@/components/pages/inner3/NewsletterStrip";

export const metadata: Metadata = { title: "Insights" };

export default async function BlogPage() {
  const posts = (await get("posts")).filter((p) => p.published).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const [featured, ...rest] = posts;
  const issue = 120 + posts.length;

  return (
    <>
      {featured ? (
        <MagazineCover featured={featured} lines={rest} issue={issue} />
      ) : (
        <section className="wrap py-24">
          <h1 className="board text-[clamp(5rem,20vw,14rem)]">Dispatch</h1>
          <p className="text-muted">No posts yet. Check back soon.</p>
        </section>
      )}

      {posts.length > 0 && (
        <section data-nav-label="Archive" className="wrap pb-24 pt-10 sm:pt-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow flex items-center gap-3 text-muted">
                <span className="cross text-accent" /> The archive
              </div>
              <h2 className="display mt-3 text-[clamp(2.2rem,6vw,5rem)]">
                Every <span className="hl">issue,</span> indexed.
              </h2>
            </div>
            <p className="max-w-xs text-sm text-muted">Field notes, playbooks and ideas on moving freight better — written by the people who move it.</p>
          </div>
          <BlogGrid posts={posts} />
        </section>
      )}

      <NewsletterStrip />
    </>
  );
}

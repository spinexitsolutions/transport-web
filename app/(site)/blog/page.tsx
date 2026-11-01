import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { get } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { BlogGrid } from "@/components/pages/BlogGrid";

export const metadata: Metadata = { title: "Insights" };

export default async function BlogPage() {
  const posts = (await get("posts")).filter((p) => p.published).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const [featured, ...rest] = posts;
  return (
    <>
      <PageHero label="Insights" title="Notes from the" accent="control tower." subtitle="Field notes, playbooks and ideas on moving freight better — written by the people who move it." />
      {featured && (
        <section className="wrap pb-16">
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[20px] bg-ink text-white lg:grid-cols-[1.4fr_1fr]">
              <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto lg:min-h-[480px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.cover} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-between gap-10 p-6 sm:p-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-ink">Featured</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">{featured.category}</span>
                  </div>
                  <h2 className="display mt-6 text-[clamp(2rem,4vw,3.25rem)] text-balance">{featured.title}</h2>
                  <p className="mt-4 text-white/65">{featured.excerpt}</p>
                </div>
                <div className="flex items-center justify-between font-mono text-xs text-white/55">
                  <span>
                    {featured.author} · {fmtDate(featured.date)} · {featured.readTime} min
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink transition-all duration-500 group-hover:rotate-45 group-hover:bg-signal">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}
      <section className="wrap pb-28">
        {rest.length > 0 ? <BlogGrid posts={rest} /> : !featured && <p className="text-muted">No posts yet. Check back soon.</p>}
      </section>
    </>
  );
}

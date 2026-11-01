import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { fmtDate } from "@/lib/utils";

/** Editorial broadsheet: masthead, lead story and a ruled column of briefs. */
export function Blog({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  const issue = 100 + posts.length * 7;
  return (
    <section data-nav-label="Insights" className="wrap py-20 sm:py-28">
      {/* masthead */}
      <div className="border-y-2 border-ink py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <span className="board text-sm tracking-[0.2em] text-muted">Vol. 07 · No. {issue}</span>
          <span className="board text-sm tracking-[0.2em] text-muted">{fmtDate(lead.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <h2 className="display mt-3 text-center text-[clamp(2.4rem,8.5vw,7.5rem)] leading-[0.85] [font-stretch:125%]">
          The <span className="hl">Kinetik</span> Dispatch
        </h2>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3">
          <span className="eyebrow text-muted">Field notes from the control tower</span>
          <Link href="/blog" className="eyebrow inline-flex items-center gap-1 text-ink hover:text-accent">
            All editions <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        {/* lead story */}
        <Reveal className="border-line py-8 lg:col-span-8 lg:border-r lg:pr-10">
          <Link href={`/blog/${lead.slug}`} className="group block">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">Lead story</span>
              <span className="eyebrow text-muted">{lead.category}</span>
            </div>
            <h3 className="display mt-4 text-[clamp(1.9rem,4.4vw,3.8rem)] [font-stretch:100%] transition-colors group-hover:text-accent">{lead.title}</h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md sm:col-span-3">
                <Image src={lead.cover} alt={lead.title} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <div className="sm:col-span-2">
                <p className="text-lg leading-relaxed text-ink/80 first-letter:float-left first-letter:mr-2 first-letter:font-[family-name:var(--font-board)] first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-accent">
                  {lead.excerpt}
                </p>
                <p className="mt-4 text-sm text-muted">
                  By {lead.author} · {lead.readTime} min read
                </p>
                <span className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-0.5 text-sm font-semibold">
                  Continue reading <ArrowUpRight size={14} className="transition group-hover:rotate-45" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* briefs column */}
        <div className="lg:col-span-4 lg:pl-10">
          <div className="eyebrow border-b border-line py-4 text-muted lg:pt-8">In brief</div>
          {rest.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[3rem_1fr] gap-3 border-b border-line py-5">
                <span className="board text-5xl leading-none text-ink/20 transition-colors group-hover:text-accent">{String(i + 2).padStart(2, "0")}</span>
                <span>
                  <span className="eyebrow text-muted">
                    {p.category} · {fmtDate(p.date, { day: "numeric", month: "short" })}
                  </span>
                  <span className="mt-1 block text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">{p.title}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

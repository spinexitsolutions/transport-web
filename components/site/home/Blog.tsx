import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";
import { fmtDate } from "@/lib/utils";

export function Blog({ posts }: { posts: Post[] }) {
  return (
    <section data-nav-label="Insights" className="wrap py-20 sm:py-28">
      <div className="flex items-end justify-between gap-6">
        <div>
          <SectionLabel index="11">Insights</SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.6rem,6vw,5rem)]">
            <SplitWords text="Notes from" /> <SplitWords text="the road." wordClassName="serif text-accent" delay={0.15} />
          </h2>
        </div>
        <Link href="/blog" className="hidden items-center gap-2 rounded-full px-5 py-3 ring-1 ring-line transition hover:bg-ink hover:text-white sm:inline-flex">
          All articles <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0">
        {posts.slice(0, 3).map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="w-[82vw] shrink-0 snap-start sm:w-auto">
            <Link href={`/blog/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-bone-2">
                <Image src={p.cover} alt={p.title} fill sizes="(min-width:640px) 33vw, 82vw" className="object-cover transition duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />
                <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium">{p.category}</span>
                <span className="absolute bottom-4 right-4 grid h-12 w-12 translate-y-3 place-items-center rounded-full bg-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm text-muted">
                <span>{fmtDate(p.date)}</span>
                <span className="h-1 w-1 rounded-full bg-muted/50" />
                <span>{p.readTime} min read</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent sm:text-2xl">{p.title}</h3>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

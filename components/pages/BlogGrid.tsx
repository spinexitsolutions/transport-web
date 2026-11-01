"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn, fmtDate } from "@/lib/utils";

export function BlogGrid({ posts }: { posts: Post[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? posts : posts.filter((p) => p.category === cat);

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
              cat === c ? "text-white" : "text-ink/70 ring-1 ring-inset ring-line hover:text-ink",
            )}
          >
            {cat === c && <motion.span layoutId="blog-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.article
              layout
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/blog/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
                  <span className="glass absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-medium">{p.category}</span>
                  <span className="absolute right-4 bottom-4 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-accent text-accent-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-2 font-mono text-xs text-muted">
                  <time>{fmtDate(p.date)}</time>
                  <span>·</span>
                  <span>{p.readTime} min read</span>
                </div>
                <h3 className="mt-2 text-xl font-medium tracking-tight text-balance transition-colors group-hover:text-ink/70 sm:text-2xl">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-muted">{p.excerpt}</p>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="mt-10 text-muted">No posts in this category yet.</p>}
    </div>
  );
}

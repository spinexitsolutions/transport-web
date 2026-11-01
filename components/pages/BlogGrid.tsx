"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn, fmtDate } from "@/lib/utils";

/** Index of all articles: tab-divider filter + ruled list with a cursor-following preview. */
export function BlogGrid({ posts }: { posts: Post[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);
  const [cat, setCat] = useState("All");
  const [hover, setHover] = useState<string | null>(null);
  const list = cat === "All" ? posts : posts.filter((p) => p.category === cat);
  const box = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 24 });
  const y = useSpring(my, { stiffness: 200, damping: 24 });
  const active = list.find((p) => p.id === hover);

  return (
    <div>
      {/* index tabs */}
      <div className="no-scrollbar -mx-4 flex items-end gap-1 overflow-x-auto border-b-2 border-ink px-4 sm:mx-0 sm:px-0" role="tablist">
        {cats.map((c, i) => {
          const on = cat === c;
          return (
            <button
              key={c}
              role="tab"
              aria-selected={on}
              onClick={() => setCat(c)}
              className={cn(
                "relative shrink-0 rounded-t-[10px] px-4 pb-2.5 pt-3 text-left transition-all duration-300",
                on ? "bg-ink pt-4 text-white" : "bg-bone-2 text-ink/70 hover:bg-tint hover:text-ink",
              )}
            >
              <span className={cn("board block text-xs", on ? "text-signal" : "text-ink/40")}>{String.fromCharCode(65 + i)}</span>
              <span className="text-sm font-semibold">{c}</span>
              <span className="ml-2 text-xs opacity-50">{c === "All" ? posts.length : posts.filter((p) => p.category === c).length}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={box}
        className="relative"
        onPointerMove={(e) => {
          if (!box.current) return;
          const r = box.current.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onMouseLeave={() => setHover(null)}
      >
        {/* floating preview (desktop) */}
        <motion.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block">
          <AnimatePresence>
            {active && (
              <motion.div
                key="pv"
                initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 3 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="-ml-[150px] -mt-[110px] h-[220px] w-[300px] overflow-hidden rounded-[6px] bg-ink shadow-2xl ring-8 ring-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={active.id} src={active.cover} alt="" className="h-full w-full object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <ol>
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, i) => (
              <motion.li
                layout
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-line"
                onMouseEnter={() => setHover(p.id)}
              >
                <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 py-6 sm:gap-x-8 sm:py-8">
                  <span className="board self-start text-[clamp(2.4rem,6vw,4.5rem)] text-ink/15 transition-colors duration-500 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="eyebrow text-accent">{p.category}</span>
                      <span className="text-xs text-muted">
                        {fmtDate(p.date)} · {p.readTime} min read · {p.author}
                      </span>
                    </div>
                    <h3 className="display mt-2 text-[clamp(1.4rem,3.4vw,2.8rem)] leading-[1] text-balance transition-transform duration-500 group-hover:translate-x-2">
                      {p.title}
                    </h3>
                    <p className="mt-2 hidden max-w-2xl text-muted sm:line-clamp-1">{p.excerpt}</p>
                    {/* mobile thumbnail */}
                    <div className="mt-4 aspect-[16/9] overflow-hidden rounded-[8px] lg:hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <span className="hidden h-14 w-14 place-items-center rounded-full ring-1 ring-line transition-all duration-500 group-hover:rotate-45 group-hover:bg-ink group-hover:text-signal sm:grid">
                    <ArrowUpRight size={20} />
                  </span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
        {list.length === 0 && <p className="py-10 text-muted">No posts in this category yet.</p>}
      </div>
    </div>
  );
}

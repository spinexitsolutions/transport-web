"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { fmtDate } from "@/lib/utils";

const E = [0.16, 1, 0.3, 1] as const;

/** /blog hero — the featured post as a printed magazine cover. */
export function MagazineCover({ featured, lines, issue }: { featured: Post; lines: Post[]; issue: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const tilt = useTransform(scrollYProgress, [0, 1], [0, -2.5]);
  const date = new Date(featured.date);

  return (
    <section data-nav-label="Dispatch" className="wrap pb-12 pt-6 sm:pt-10 lg:pt-20">
      <motion.div
        ref={ref}
        style={{ rotate: tilt }}
        initial={{ opacity: 0, y: 60, rotate: 3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1.2, ease: E }}
        className="relative mx-auto overflow-hidden rounded-[6px] bg-ink text-white shadow-[0_40px_90px_-40px_rgba(11,13,23,.7)] ring-[10px] ring-white sm:ring-[14px]"
      >
        {/* cover photo */}
        <Link href={`/blog/${featured.slug}`} className="group relative block min-h-[640px] sm:min-h-[760px] lg:min-h-[820px]" aria-label={featured.title}>
          <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.cover} alt="" className="h-full w-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/85" />

          {/* masthead */}
          <div className="relative px-4 pt-4 sm:px-8 sm:pt-6">
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="eyebrow text-white/80">Vol. 07 · No. {issue}</span>
              <span className="eyebrow text-white/80">{fmtDate(featured.date, { month: "long", year: "numeric" })}</span>
              <span className="eyebrow text-signal">₹0 · Free</span>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease: E, delay: 0.25 }}
                className="board text-center text-[clamp(5.5rem,25vw,22rem)] leading-[0.78] tracking-[-0.01em]"
              >
                Dispatch
              </motion.h1>
            </div>
            <div className="flex items-center justify-between border-y border-white/30 py-1.5 text-[10px] sm:text-xs">
              <span className="eyebrow text-white/80">The Kinetik freight journal</span>
              <span className="eyebrow hidden text-white/80 sm:inline">Field notes from the control tower</span>
              <span className="eyebrow text-white/80">Issue {String(issue).padStart(3, "0")}</span>
            </div>
          </div>

          {/* cover lines */}
          <div className="relative grid gap-6 px-4 pt-8 sm:px-8 lg:grid-cols-12">
            <motion.ul
              initial="h"
              animate="s"
              variants={{ s: { transition: { staggerChildren: 0.1, delayChildren: 0.7 } } }}
              className="hidden space-y-4 text-right lg:col-span-3 lg:col-start-10 lg:block [&_p]:ml-auto"
            >
              {lines.slice(0, 2).map((p, i) => (
                <motion.li key={p.id} variants={{ h: { opacity: 0, x: -20 }, s: { opacity: 1, x: 0, transition: { duration: 0.7, ease: E } } }}>
                  <span className="board text-2xl text-signal">{String(i + 2).padStart(2, "0")}</span>
                  <p className="mt-1 max-w-[16rem] text-[15px] font-semibold leading-snug">{p.title}</p>
                  <span className="eyebrow text-white/60">{p.category}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* main cover line */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-5 sm:px-8 sm:pb-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: E, delay: 0.55 }}>
              <span className="inline-block -rotate-2 bg-signal px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                Cover story · {featured.category}
              </span>
              <h2 className="display mt-3 max-w-4xl text-[clamp(2rem,5.6vw,4.8rem)] text-balance">{featured.title}</h2>
              <div className="mt-5 flex items-end justify-between gap-6">
                <p className="max-w-lg text-white/75">{featured.excerpt}</p>
                <div className="hidden shrink-0 items-end gap-3 sm:flex">
                  <div className="rounded-sm bg-white p-1.5 text-ink">
                    <span className="barcode block h-10 w-28" />
                    <span className="mt-1 block text-center font-mono text-[9px]">
                      {date.getFullYear()}
                      {String(date.getMonth() + 1).padStart(2, "0")} {String(issue).padStart(4, "0")}
                    </span>
                  </div>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-signal text-ink transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}

"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";

const DURATION = 7000;

/** Rating panel + selector list on the left, the active quote large on the right. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setTimeout(() => setI((v) => (v + 1) % items.length), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, items.length]);

  if (!items.length) return null;
  const t = items[i];
  const avg = items.reduce((a, b) => a + b.rating, 0) / items.length;
  const go = (n: number) => setI((n + items.length) % items.length);

  return (
    <section
      data-nav-label="Testimonials"
      className="wrap py-20 sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <SectionLabel index="09">Client stories</SectionLabel>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* left: rating + selectors */}
        <div className="min-w-0 lg:col-span-4">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <div className="flex items-end gap-2">
              <span className="board text-[6.5rem] leading-[0.8] text-signal">{avg.toFixed(1)}</span>
              <span className="board mb-2 text-3xl text-white/40">/5</span>
            </div>
            <div className="mt-4 flex gap-1 text-signal">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="mt-2 text-sm text-white/60">Average rating from 2,400+ shippers</p>
          </div>

          <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:gap-0 lg:overflow-visible">
            {items.map((it, k) => (
              <li key={it.id} className="shrink-0 lg:border-b lg:border-line">
                <button
                  onClick={() => go(k)}
                  className={`relative flex w-full items-center gap-3 overflow-hidden rounded-full py-2 pl-2 pr-4 text-left transition lg:rounded-none lg:px-0 lg:py-3 ${
                    k === i ? "bg-white ring-1 ring-line lg:bg-transparent lg:ring-0" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                    <Image src={it.avatar} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-sm font-semibold">{it.name}</span>
                    <span className="hidden truncate text-xs text-muted lg:block">{it.company}</span>
                  </span>
                  {k === i && (
                    <motion.span
                      key={`${i}-${paused}`}
                      className="absolute bottom-0 left-0 hidden h-[2px] bg-accent lg:block"
                      initial={{ width: "0%" }}
                      animate={{ width: paused ? undefined : "100%" }}
                      transition={{ duration: DURATION / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* right: active quote */}
        <motion.div
          className="relative min-h-[300px] min-w-0 touch-pan-y lg:col-span-8"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(i + 1);
            else if (info.offset.x > 60) go(i - 1);
          }}
        >
          <span aria-hidden className="board pointer-events-none absolute -top-10 right-0 select-none text-[12rem] leading-none text-accent/10 sm:text-[16rem]">
            &ldquo;
          </span>
          <AnimatePresence mode="wait">
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <blockquote className="display text-[clamp(1.6rem,3.8vw,3.4rem)] font-[480] leading-[1.12] [font-stretch:100%]">
                {t.quote}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-6">
                <span className="board text-5xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight">{t.name}</span>
                  <span className="block text-sm text-muted">
                    {t.role}, {t.company}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

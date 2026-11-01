"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";

const DURATION = 7000;

/** Story-style testimonials: auto-advancing with progress bars, swipeable on touch. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const go = (n: number) => {
    setDir(n > i || (i === items.length - 1 && n === 0) ? 1 : -1);
    setI((n + items.length) % items.length);
  };

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setTimeout(() => go(i + 1), DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, items.length]);

  if (!items.length) return null;
  const t = items[i];

  return (
    <section data-nav-label="Testimonials" className="wrap py-20 sm:py-28" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex items-center justify-between">
        <SectionLabel index="09">Client stories</SectionLabel>
        <div className="flex gap-2">
          <button onClick={() => go(i - 1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line transition hover:bg-ink hover:text-white" aria-label="Previous">
            <ArrowLeft size={17} />
          </button>
          <button onClick={() => go(i + 1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line transition hover:bg-ink hover:text-white" aria-label="Next">
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-1.5">
        {items.map((_, k) => (
          <button key={k} onClick={() => go(k)} className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10" aria-label={`Show testimonial ${k + 1}`}>
            {k < i && <span className="block h-full w-full bg-ink" />}
            {k === i && (
              <motion.span
                key={`${i}-${paused}`}
                className="block h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: paused ? undefined : "100%" }}
                transition={{ duration: DURATION / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        className="relative mt-12 min-h-[380px] touch-pan-y sm:min-h-[340px]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(i + 1);
          else if (info.offset.x > 60) go(i - 1);
        }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.figure
            key={t.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -60, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-10 lg:grid-cols-12"
          >
            <blockquote className="lg:col-span-9">
              <p className="text-[clamp(1.7rem,4.4vw,3.8rem)] font-medium leading-[1.1] tracking-[-0.035em]">
                <span className="serif text-accent">&ldquo;</span>
                {t.quote}
                <span className="serif text-accent">&rdquo;</span>
              </p>
            </blockquote>
            <figcaption className="flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:justify-end">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl lg:h-24 lg:w-24 lg:rounded-3xl">
                <Image src={t.avatar} alt={t.name} fill sizes="96px" className="object-cover" />
              </div>
              <div>
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={14} fill={k < t.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <div className="mt-2 text-lg font-semibold tracking-tight">{t.name}</div>
                <div className="text-sm text-muted">
                  {t.role}, {t.company}
                </div>
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

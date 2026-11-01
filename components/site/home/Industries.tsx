"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Industry } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

/** Big editorial list; on desktop a preview image follows the cursor, on mobile rows expand. */
export function Industries({ industries }: { industries: Industry[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(0);
  const box = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 22 });
  const y = useSpring(my, { stiffness: 180, damping: 22 });

  return (
    <section data-nav-label="Industries" className="wrap py-20 sm:py-28">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionLabel index="06">Industries</SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.6rem,7vw,6rem)]">
            <SplitWords text="Built for" /> <SplitWords text="your sector." wordClassName="hl" delay={0.15} />
          </h2>
        </div>
        <p className="max-w-sm text-muted">Specialist teams, SOPs and equipment for the industries that keep India running.</p>
      </div>

      <div
        ref={box}
        className="relative mt-12"
        onPointerMove={(e) => {
          const r = box.current!.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onMouseLeave={() => setActive(null)}
      >
        {/* cursor-follow preview (desktop) */}
        <motion.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block">
          <AnimatePresence>
            {active !== null && (
              <motion.div
                key="preview"
                initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="relative -ml-[170px] -mt-[120px] h-[240px] w-[340px] overflow-hidden rounded-3xl shadow-2xl"
              >
                {industries.map((ind, i) => (
                  <motion.div key={ind.id} className="absolute inset-0" animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.15 }} transition={{ duration: 0.5 }}>
                    <Image src={ind.image} alt="" fill sizes="340px" className="object-cover" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {industries.map((ind, i) => (
          <div key={ind.id} className="group border-t border-line last:border-b" onMouseEnter={() => setActive(i)}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center gap-4 py-6 text-left sm:py-8 lg:cursor-default"
              aria-expanded={open === i}
            >
              <span className="w-10 font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="display flex-1 text-[clamp(1.8rem,5vw,4.2rem)] transition-all duration-500 lg:group-hover:translate-x-4 lg:group-hover:text-accent">
                {ind.name}
              </span>
              <span className="hidden max-w-xs text-right text-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:block">{ind.text}</span>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-line transition-all duration-500 group-hover:bg-ink group-hover:text-white">
                <span className="lg:hidden">
                  <Plus size={18} className={`transition-transform duration-500 ${open === i ? "rotate-45" : ""}`} />
                </span>
                <ArrowUpRight size={18} className="hidden transition-transform duration-500 group-hover:rotate-45 lg:block" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden lg:hidden"
                >
                  <p className="pb-4 pl-14 text-muted">{ind.text}</p>
                  <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-3xl">
                    <Image src={ind.image} alt={ind.name} fill sizes="100vw" className="object-cover" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

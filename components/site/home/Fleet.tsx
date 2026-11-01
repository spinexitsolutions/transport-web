"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import type { FleetItem } from "@/lib/types";
import { Counter } from "@/components/ui/Counter";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

// loose scatter positions (desktop) — percentage of the board
const SPOTS = [
  { left: "2%", top: "6%", rotate: -7 },
  { left: "22%", top: "30%", rotate: 5 },
  { left: "42%", top: "4%", rotate: -3 },
  { left: "61%", top: "28%", rotate: 8 },
  { left: "79%", top: "8%", rotate: -5 },
  { left: "12%", top: "52%", rotate: 4 },
  { left: "52%", top: "50%", rotate: -6 },
];

/** Lime block of draggable asset tags. */
export function Fleet({ fleet }: { fleet: FleetItem[] }) {
  const board = useRef<HTMLDivElement>(null);
  return (
    <section data-nav-label="Fleet & assets" className="relative overflow-hidden bg-signal py-20 text-ink sm:py-28">
      <div className="wrap">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel index="07" className="text-ink/60">
              Fleet & assets
            </SectionLabel>
            <h2 className="display mt-6 text-[clamp(2.4rem,6.5vw,5.6rem)]">
              <SplitWords text="Owned assets." /> <SplitWords text="Zero excuses." wordClassName="outline-text" delay={0.15} />
            </h2>
          </div>
          <p className="max-w-xs text-ink/70">
            Every tag is a real asset class we own and run. <span className="hidden lg:inline">Go on — pick one up and move it.</span>
          </p>
        </div>
      </div>

      {/* desktop: scattered draggable tags */}
      <div ref={board} className="wrap relative mt-10 hidden h-[620px] lg:block">
        {fleet.map((f, i) => {
          const s = SPOTS[i % SPOTS.length];
          return (
            <motion.div
              key={f.id}
              drag
              dragConstraints={board}
              dragElastic={0.15}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
              initial={{ opacity: 0, y: 60, rotate: s.rotate * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: s.rotate }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
              whileDrag={{ scale: 1.08, rotate: 0, zIndex: 30, cursor: "grabbing" }}
              className="absolute cursor-grab touch-none"
              style={{ left: s.left, top: s.top }}
            >
              <Tag f={f} />
            </motion.div>
          );
        })}
      </div>

      {/* mobile: snap scroller */}
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-6 sm:px-6 lg:hidden">
        {fleet.map((f, i) => (
          <div key={f.id} className="shrink-0 snap-center" style={{ transform: `rotate(${SPOTS[i % SPOTS.length].rotate / 2}deg)` }}>
            <Tag f={f} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Tag({ f }: { f: FleetItem }) {
  return (
    <div className="relative w-[250px] select-none">
      {/* string */}
      <svg className="absolute -top-10 left-1/2 h-12 w-8 -translate-x-1/2" viewBox="0 0 32 48" aria-hidden>
        <path d="M16 0 C 4 16, 28 26, 16 46" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
      <div
        className="relative overflow-hidden bg-bone pb-4 shadow-[0_24px_50px_-20px_rgba(11,13,23,.45)]"
        style={{ clipPath: "polygon(18% 0, 82% 0, 100% 9%, 100% 100%, 0 100%, 0 9%)", borderRadius: 10 }}
      >
        {/* punched hole */}
        <div className="mx-auto mt-3 h-4 w-4 rounded-full bg-signal ring-2 ring-ink/80" />
        <div className="mt-2 flex items-center justify-between px-4">
          <span className="eyebrow text-muted">Asset tag</span>
          <span className="font-mono text-[10px] text-muted">KNT/{f.id.toUpperCase()}</span>
        </div>
        <div className="relative mx-4 mt-3 aspect-[4/3] overflow-hidden rounded-md">
          <Image src={f.image} alt={f.name} fill sizes="250px" draggable={false} className="pointer-events-none object-cover" />
        </div>
        <div className="mt-3 px-4">
          <div className="board text-6xl leading-none">
            <Counter value={f.count} suffix={f.count >= 1000 ? "" : "+"} />
          </div>
          <div className="mt-1 text-[15px] font-semibold tracking-tight">{f.name}</div>
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink/25 pt-3">
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-signal">{f.capacity}</span>
            <span className="barcode h-6 w-20 text-ink" />
          </div>
        </div>
      </div>
    </div>
  );
}

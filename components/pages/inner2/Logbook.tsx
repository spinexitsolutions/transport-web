"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export type Milestone = { y: string; t: string; d: string };

/**
 * Logbook: on desktop the section pins and a horizontal rail of years slides past as you scroll;
 * on mobile it's a vertical log with a filling spine.
 */
export function Logbook({ items }: { items: Milestone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const m = () => track.current && setDist(Math.max(0, track.current.scrollWidth - track.current.clientWidth));
    m();
    const ro = new ResizeObserver(m);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <>
      {/* desktop: pinned horizontal rail */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${items.length * 45}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="wrap mb-10 flex items-end justify-between">
            <div>
              <div className="eyebrow flex items-center gap-3 text-muted">
                <span className="cross text-accent" /> Logbook · 2012 — 2026
              </div>
              <h2 className="display mt-4 text-[clamp(2.4rem,5vw,4.6rem)]">
                Fourteen years, <span className="hl">one route.</span>
              </h2>
            </div>
            <span className="barcode h-8 w-32 text-ink/70" />
          </div>
          <div className="wrap">
            <div className="relative h-[3px] bg-ink/10">
              <motion.div className="absolute inset-y-0 left-0 bg-accent" style={{ width: fill }} />
            </div>
          </div>
          <div ref={track} className="mt-8 overflow-visible">
            <motion.div style={{ x }} className="wrap flex w-max gap-6 pr-[30vw]">
              {items.map((m, i) => (
                <article key={m.y} className="group relative w-[min(30rem,38vw)] shrink-0 border-l-2 border-ink/15 pl-6 transition-colors hover:border-accent">
                  <span className="absolute -left-[7px] -top-[38px] h-3 w-3 rounded-full bg-accent ring-4 ring-bone" />
                  <div className="board text-[clamp(6rem,11vw,10rem)] text-ink/90 transition-colors group-hover:text-accent">{m.y}</div>
                  <div className="eyebrow mt-3 text-muted">Entry {String(i + 1).padStart(2, "0")}</div>
                  <h3 className="display mt-2 text-3xl [font-stretch:105%]">{m.t}</h3>
                  <p className="mt-3 max-w-sm text-muted">{m.d}</p>
                </article>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* mobile: vertical log */}
      <div className="wrap py-16 lg:hidden">
        <div className="eyebrow flex items-center gap-3 text-muted">
          <span className="cross text-accent" /> Logbook · 2012 — 2026
        </div>
        <h2 className="display mt-4 text-[clamp(2.2rem,9vw,3.4rem)]">
          Fourteen years, <span className="hl">one route.</span>
        </h2>
        <ol className="relative mt-10 border-l-2 border-ink/10 pl-6">
          {items.map((m, i) => (
            <motion.li
              key={m.y}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.03 }}
              className="relative pb-10 last:pb-0"
            >
              <span className="absolute -left-[33px] top-3 h-3 w-3 rounded-full bg-accent ring-4 ring-bone" />
              <div className="board text-7xl">{m.y}</div>
              <h3 className="display mt-2 text-2xl [font-stretch:105%]">{m.t}</h3>
              <p className="mt-2 text-muted">{m.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </>
  );
}

"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/** Ultramarine block: words light up as you scroll, stamped like a manifest. */
export function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const stampRot = useTransform(scrollYProgress, [0, 1], [-18, -6]);
  const stampScale = useTransform(scrollYProgress, [0, 0.3], [1.4, 1]);
  const stampOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const words = text.split(" ");
  return (
    <section data-nav-label="Our promise" className="relative overflow-hidden bg-accent text-accent-ink">
      <div className="noise absolute inset-0" />
      {/* giant outlined index */}
      <div
        aria-hidden
        className="board outline-text pointer-events-none absolute -right-4 -top-6 select-none text-[clamp(14rem,40vw,30rem)] opacity-25 [--stroke:white]"
      >
        01
      </div>
      <div className="wrap relative py-20 sm:py-28 lg:py-36">
        <div className="flex flex-wrap items-center gap-4 text-white/70">
          <span className="eyebrow flex items-center gap-3">
            <span className="cross text-signal" /> Manifest · Our promise
          </span>
          <span className="barcode h-5 w-24 text-white/60" />
        </div>

        <div ref={ref} className="relative mt-10 max-w-6xl">
          <p className="flex flex-wrap text-[clamp(1.8rem,4.8vw,4.2rem)] font-semibold leading-[1.08] tracking-[-0.035em]">
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={/fastest|safest|greenest|every/i.test(w)}>
                {w}
              </Word>
            ))}
          </p>

          {/* stamp */}
          <motion.div
            style={{ rotate: stampRot, scale: stampScale, opacity: stampOpacity }}
            className="mt-12 inline-flex flex-col items-center rounded-[14px] border-[3px] border-signal px-6 py-3 text-signal lg:absolute lg:-bottom-16 lg:right-0 lg:mt-0"
          >
            <span className="eyebrow">Kinetik control tower</span>
            <span className="board text-5xl">Cleared 24×7</span>
            <span className="eyebrow opacity-80">Est. 2012 · Mumbai</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className={`mr-[0.25em] ${accent ? "hl" : ""}`}>
      {children}
    </motion.span>
  );
}

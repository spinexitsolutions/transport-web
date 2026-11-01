"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import type { Industry } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";

const E = [0.16, 1, 0.3, 1] as const;

/** A single flowing sentence where every industry is an inline image pill. */
export function Industries({ industries }: { industries: Industry[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [tapped, setTapped] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 24 });
  const y = useSpring(my, { stiffness: 200, damping: 24 });

  const words = (t: string, base: number) =>
    t.split(" ").map((w, i) => (
      <motion.span
        key={`${base}-${i}`}
        variants={{ hide: { opacity: 0, y: "0.4em" }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: E } } }}
        className="inline-block"
      >
        {w}&nbsp;
      </motion.span>
    ));

  const shown = tapped !== null ? industries[tapped] : null;

  return (
    <section data-nav-label="Industries" className="wrap py-20 sm:py-32">
      <div className="flex items-center justify-between">
        <SectionLabel index="06">Industries</SectionLabel>
        <span className="eyebrow hidden text-muted sm:block">Hover a sector</span>
      </div>

      <div
        ref={box}
        className="relative mt-10"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !box.current) return;
          const r = box.current.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onMouseLeave={() => setActive(null)}
      >
        <motion.p
          initial="hide"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ staggerChildren: 0.035 }}
          className="display text-[clamp(1.9rem,5.6vw,5.4rem)] leading-[1.08] [font-stretch:105%]"
        >
          {words("We move freight for", 0)}
          {industries.map((ind, i) => (
            <motion.span key={ind.id} variants={{ hide: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: E } } }} className="inline-block">
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => setTapped(tapped === i ? null : i)}
                className={`group mx-[0.08em] my-[0.06em] inline-flex items-center gap-[0.22em] rounded-full py-[0.08em] pl-[0.1em] pr-[0.4em] align-middle ring-1 transition-colors duration-300 ${
                  active === i || tapped === i ? "bg-accent text-accent-ink ring-accent" : "bg-white ring-line hover:ring-ink/30"
                }`}
              >
                <span className="relative inline-block h-[0.82em] w-[0.82em] overflow-hidden rounded-full">
                  <Image src={ind.image} alt="" fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-125" />
                </span>
                <span className="text-[0.62em] tracking-tight">{ind.name}</span>
              </button>
              {i < industries.length - 2 ? <span className="text-ink/30">,</span> : i === industries.length - 2 ? <span className="text-ink/30"> &amp;</span> : null}
              &nbsp;
            </motion.span>
          ))}
          {words("— on time, every time.", 99).map((w, i) => (
            <span key={i} className={i >= 2 ? "hl" : ""}>
              {w}
            </span>
          ))}
        </motion.p>

        {/* desktop floating card */}
        <motion.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block">
          <AnimatePresence>
            {active !== null && (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="ml-6 mt-6 w-72 overflow-hidden rounded-2xl bg-ink text-white shadow-2xl"
              >
                <div className="relative h-40">
                  {industries.map((ind, i) => (
                    <motion.div key={ind.id} className="absolute inset-0" animate={{ opacity: i === active ? 1 : 0 }} transition={{ duration: 0.4 }}>
                      <Image src={ind.image} alt="" fill sizes="288px" className="object-cover" />
                    </motion.div>
                  ))}
                </div>
                <div className="p-4">
                  <div className="board text-3xl text-signal">0{active + 1}</div>
                  <div className="mt-1 font-semibold">{industries[active].name}</div>
                  <p className="mt-1 text-sm text-white/65">{industries[active].text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* mobile / tap card */}
      <AnimatePresence mode="wait">
        {shown && (
          <motion.div
            key={shown.id}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.5, ease: E }}
            className="mt-8 overflow-hidden lg:hidden"
          >
            <div className="grid overflow-hidden rounded-2xl bg-ink text-white sm:grid-cols-2">
              <div className="relative aspect-[16/10]">
                <Image src={shown.image} alt={shown.name} fill sizes="100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <div className="board text-4xl text-signal">0{(tapped ?? 0) + 1}</div>
                <div className="mt-2 text-xl font-semibold tracking-tight">{shown.name}</div>
                <p className="mt-2 text-white/65">{shown.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

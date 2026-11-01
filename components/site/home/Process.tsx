"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { ProcessStep } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

/** Sticky media on the right, steps scroll on the left (Apple product-page pattern). */
export function Process({ steps }: { steps: ProcessStep[] }) {
  const [active, setActive] = useState(0);
  return (
    <section data-nav-label="How it works" className="wrap py-20 sm:py-28">
      <SectionLabel index="03">How it works</SectionLabel>
      <h2 className="display mt-6 max-w-4xl text-[clamp(2.6rem,7vw,6rem)]">
        <SplitWords text="From quote to" /> <SplitWords text="doorstep." wordClassName="hl" delay={0.2} />
      </h2>

      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          {steps.map((s, i) => (
            <Step key={s.id} step={s} index={i} active={active === i} onActive={() => setActive(i)} />
          ))}
        </div>
        <div className="relative hidden lg:block">
          <div className="sticky top-[14vh] h-[72vh] overflow-hidden rounded-[20px] bg-ink">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                exit={{ opacity: 0.6 }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
              >
                <Image src={steps[active].image} alt={steps[active].title} fill sizes="50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              <div className="display text-[7rem] leading-none tabular-nums">
                0<AnimatePresence mode="popLayout"><motion.span key={active} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="inline-block">{active + 1}</motion.span></AnimatePresence>
              </div>
              <div className="mb-4 flex gap-1.5">
                {steps.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-accent" : "w-1.5 bg-white/40"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ step, index, active, onActive }: { step: ProcessStep; index: number; active: boolean; onActive: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive();
  }, [inView, onActive]);
  return (
    <div ref={ref} className="flex flex-col justify-center border-t border-line py-8 lg:min-h-[62vh] lg:py-0">
      <div className={`transition-all duration-700 ${active ? "lg:opacity-100" : "lg:opacity-25"}`}>
        <div className="font-mono text-sm text-accent">Step {String(index + 1).padStart(2, "0")}</div>
        <h3 className="display mt-3 text-[clamp(2rem,4.5vw,3.6rem)]">{step.title}</h3>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">{step.text}</p>
      </div>
      <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-3xl lg:hidden">
        <Image src={step.image} alt={step.title} fill sizes="100vw" className="object-cover" />
      </div>
    </div>
  );
}

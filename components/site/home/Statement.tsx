"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Apple-style paragraph that lights up word by word as you scroll. */
export function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <section data-nav-label="Our promise" className="wrap py-20 sm:py-32">
      <SectionLabel index="01">Our promise</SectionLabel>
      <div ref={ref} className="mt-8 max-w-6xl">
        <p className="flex flex-wrap text-[clamp(1.75rem,4.6vw,4rem)] font-medium leading-[1.12] tracking-[-0.035em]">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={/fastest|safest|greenest|every/i.test(w)}>
              {w}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}

function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span style={{ opacity, y }} className={`mr-[0.25em] ${accent ? "hl" : ""}`}>
      {children}
    </motion.span>
  );
}

"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Truck } from "lucide-react";
import type { ProcessStep } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

const E = [0.16, 1, 0.3, 1] as const;

/** Route timeline: a line that fills as you scroll with a truck travelling down it. */
export function Process({ steps }: { steps: ProcessStep[] }) {
  const route = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: route, offset: ["start 0.6", "end 0.6"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const fill = useTransform(p, [0, 1], ["0%", "100%"]);

  return (
    <section data-nav-label="How it works" className="relative overflow-hidden bg-tint py-20 sm:py-28">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionLabel index="03">How it works</SectionLabel>
            <h2 className="display mt-6 text-[clamp(2.4rem,6.5vw,5.6rem)]">
              <SplitWords text="From quote to" /> <SplitWords text="doorstep." wordClassName="hl" delay={0.2} />
            </h2>
          </div>
          <div className="flex items-center gap-4 lg:col-span-5 lg:justify-end">
            <span className="board text-[5rem] leading-none text-accent">{String(steps.length).padStart(2, "0")}</span>
            <span className="max-w-[12rem] text-muted">stops on every journey — tracked live from booking to e-POD.</span>
          </div>
        </div>

        <div ref={route} className="relative mt-16">
          {/* route line */}
          <div className="absolute bottom-0 left-[19px] top-0 w-[3px] rounded-full bg-ink/10 lg:left-1/2 lg:-translate-x-1/2">
            <motion.div style={{ height: fill }} className="w-full rounded-full bg-accent" />
            <motion.div style={{ top: fill }} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_30px_-8px_var(--accent)] ring-4 ring-tint">
                <span className="pulse-ring absolute inset-0 rounded-full bg-accent/40" />
                <Truck size={18} className="relative" />
              </span>
            </motion.div>
          </div>

          <ol className="flex flex-col gap-14 lg:gap-6">
            {steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <li key={s.id} className="relative grid pl-14 lg:grid-cols-2 lg:gap-24 lg:pl-0">
                  {/* stop marker */}
                  <span className="absolute left-[12px] top-6 h-[17px] w-[17px] rounded-full border-[3px] border-accent bg-bone lg:left-1/2 lg:-translate-x-1/2" />
                  <motion.div
                    initial={{ opacity: 0, x: left ? -40 : 40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                    transition={{ duration: 0.9, ease: E }}
                    className={left ? "lg:col-start-1" : "lg:col-start-2"}
                  >
                    <article className="group overflow-hidden rounded-[18px] bg-white ring-1 ring-line">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image src={s.image} alt={s.title} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover transition duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />
                        <span className="board absolute left-4 top-3 text-[4.5rem] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,.4)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="eyebrow text-accent">Stop {String(i + 1).padStart(2, "0")}</div>
                        <h3 className="display mt-2 text-[clamp(1.5rem,3vw,2.2rem)]">{s.title}</h3>
                        <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
                      </div>
                    </article>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

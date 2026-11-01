"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Bell, Navigation, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";
import { Button } from "@/components/ui/Button";
import { Phone } from "./b/Phone";

type Callout = { i: LucideIcon; t: string; d: string };

const LEFT: Callout[] = [
  { i: Navigation, t: "Live GPS, every truck", d: "Positions stream every 30 seconds from GPS-locked vehicles." },
  { i: Bell, t: "WhatsApp & SMS alerts", d: "Proactive nudges the moment anything changes — before you ask." },
];
const RIGHT: Callout[] = [
  { i: ShieldCheck, t: "OTP-verified handover", d: "Photo + OTP proof of delivery, e-POD in your inbox instantly." },
  { i: Zap, t: "API & webhooks", d: "Pipe every milestone straight into your ERP, storefront or app." },
];

/** Annotated product shot: the tracking app with leader-line callouts. */
export function Tracking() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const rot = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  return (
    <section data-nav-label="Live tracking" className="relative overflow-hidden bg-tint py-20 sm:py-28">
      <div className="wrap">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel index="05" className="justify-center">
            Visibility
          </SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.4rem,6vw,5rem)]">
            <SplitWords text="Your freight," /> <SplitWords text="live in your pocket." wordClassName="hl" delay={0.2} />
          </h2>
        </div>

        <div ref={ref} className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
          <div className="hidden flex-col gap-24 lg:flex">
            {LEFT.map((c, k) => (
              <Annotation key={c.t} c={c} n={k + 1} side="left" />
            ))}
          </div>

          <motion.div style={{ y: phoneY, rotate: rot }} className="relative mx-auto">
            <div className="absolute -inset-10 -z-0 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative">
              <Phone />
            </div>
          </motion.div>

          <div className="hidden flex-col gap-24 lg:flex">
            {RIGHT.map((c, k) => (
              <Annotation key={c.t} c={c} n={k + 3} side="right" />
            ))}
          </div>

          {/* mobile: numbered list */}
          <ol className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {[...LEFT, ...RIGHT].map((c, k) => (
              <motion.li
                key={c.t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: k * 0.06 }}
                className="flex gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-line"
              >
                <span className="board text-4xl text-accent">0{k + 1}</span>
                <span>
                  <span className="block font-semibold tracking-tight">{c.t}</span>
                  <span className="mt-1 block text-sm text-muted">{c.d}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex justify-center">
          <Button href="/track?id=KNT-482019" variant="accent">
            Try live tracking
          </Button>
        </div>
      </div>
    </section>
  );
}

function Annotation({ c, n, side }: { c: Callout; n: number; side: "left" | "right" }) {
  const I = c.i;
  const left = side === "left";
  return (
    <motion.div
      initial="hide"
      whileInView="show"
      viewport={{ once: true, margin: "-20% 0px" }}
      className={`flex items-center gap-0 ${left ? "flex-row" : "flex-row-reverse"}`}
    >
      <motion.div
        variants={{ hide: { opacity: 0, x: left ? -20 : 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
        className={`w-64 shrink-0 ${left ? "text-right" : ""}`}
      >
        <div className={`flex items-center gap-3 ${left ? "flex-row-reverse" : ""}`}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-accent ring-1 ring-line">
            <I size={18} />
          </span>
          <span className="board text-3xl text-ink/25">0{n}</span>
        </div>
        <div className="mt-3 text-lg font-semibold tracking-tight">{c.t}</div>
        <p className="mt-1 text-sm leading-relaxed text-muted">{c.d}</p>
      </motion.div>
      {/* leader line */}
      <div className={`relative mx-3 h-px flex-1 ${left ? "" : ""}`}>
        <motion.span
          variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, delay: 0.3, ease: [0.65, 0, 0.35, 1] } } }}
          style={{ originX: left ? 0 : 1 }}
          className="absolute inset-0 block bg-ink/40"
        />
        <motion.span
          variants={{ hide: { scale: 0 }, show: { scale: 1, transition: { delay: 1.1, type: "spring", stiffness: 300 } } }}
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/20 ${left ? "-right-1" : "-left-1"}`}
        />
      </div>
    </motion.div>
  );
}

"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Bell, Check, MapPin, Navigation, Package, ShieldCheck, Zap } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const EVENTS = [
  { t: "09:12", title: "Picked up", place: "Bengaluru · Peenya", done: true },
  { t: "14:40", title: "Departed BLR Air Cargo", place: "Flight EK 569", done: true },
  { t: "21:05", title: "Customs cleared", place: "Dubai · DXB", done: true },
  { t: "Now", title: "Out for delivery", place: "Al Quoz, Dubai", done: false },
];

export function Tracking() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const n1 = useTransform(scrollYProgress, [0, 1], [140, -160]);
  const n2 = useTransform(scrollYProgress, [0, 1], [40, -220]);
  const rot = useTransform(scrollYProgress, [0, 1], [-6, 4]);

  return (
    <section data-nav-label="Live tracking" className="wrap overflow-hidden py-20 sm:py-28">
      <div ref={ref} className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionLabel index="05">Visibility</SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.6rem,6.5vw,5.5rem)]">
            <SplitWords text="Your freight," /> <SplitWords text="live in your pocket." wordClassName="hl" delay={0.2} />
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Minute-by-minute location, proactive delay alerts, e-POD and temperature logs — on web, WhatsApp and API.
          </p>
          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            {[
              { i: Navigation, t: "Live GPS on every truck" },
              { i: Bell, t: "WhatsApp & SMS alerts" },
              { i: ShieldCheck, t: "OTP-verified handovers" },
              { i: Zap, t: "REST API & webhooks" },
            ].map(({ i: I, t }, k) => (
              <Reveal key={t} delay={k * 0.06} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-bone-2">
                  <I size={17} />
                </span>
                <span className="text-[15px] tracking-tight">{t}</span>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Button href="/track?id=KNT-482019" variant="accent">
              Try live tracking
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center py-6">
          {/* floating notifications */}
          <motion.div style={{ y: n1 }} className="glass absolute -left-2 top-16 z-20 hidden w-64 rounded-2xl p-3.5 shadow-xl ring-1 ring-line sm:block lg:-left-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white">
                <Check size={16} />
              </span>
              <div className="text-sm">
                <div className="font-medium">Customs cleared</div>
                <div className="text-muted">KNT-482019 · 2 min ago</div>
              </div>
            </div>
          </motion.div>
          <motion.div style={{ y: n2 }} className="absolute -right-2 bottom-24 z-20 hidden w-60 rounded-2xl bg-ink p-4 text-white shadow-xl sm:block lg:-right-4">
            <div className="font-mono text-[11px] text-white/50">Cold chain · KNT-118230</div>
            <div className="mt-1 flex items-end justify-between">
              <span className="display text-4xl">4.2°C</span>
              <svg viewBox="0 0 80 28" className="h-7 w-20">
                <path d="M0 18 L10 16 L20 19 L30 14 L40 15 L50 12 L60 14 L70 11 L80 13" fill="none" stroke="var(--accent)" strokeWidth="2" />
              </svg>
            </div>
          </motion.div>

          {/* phone */}
          <motion.div style={{ y: phoneY, rotate: rot }} className="relative w-[290px] rounded-[48px] bg-ink p-2.5 shadow-[0_50px_100px_-30px_rgba(0,0,0,.45)] sm:w-[320px]">
            <div className="relative overflow-hidden rounded-[40px] bg-bone">
              <div className="absolute left-1/2 top-2.5 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-ink" />
              {/* map */}
              <div className="relative h-56 overflow-hidden bg-[#e6e3dc]">
                <svg viewBox="0 0 320 224" className="absolute inset-0 h-full w-full">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <path key={i} d={`M ${-20 + i * 45} 0 L ${40 + i * 45} 224`} stroke="#fff" strokeWidth="6" opacity=".7" />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <path key={`h${i}`} d={`M 0 ${20 + i * 50} L 320 ${i * 50}`} stroke="#fff" strokeWidth="4" opacity=".6" />
                  ))}
                  <path id="route" d="M 40 190 C 90 150, 120 170, 160 120 S 240 70, 280 50" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
                  <motion.path
                    d="M 40 190 C 90 150, 120 170, 160 120 S 240 70, 280 50"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 0.78 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1] }}
                  />
                  <circle cx="40" cy="190" r="6" fill="var(--ink)" />
                  <circle cx="280" cy="50" r="7" fill="#fff" stroke="var(--ink)" strokeWidth="3" />
                  <circle r="9" fill="var(--accent)" stroke="#fff" strokeWidth="3">
                    <animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;0.78;0.78" keyTimes="0;0.7;1" calcMode="linear" path="M 40 190 C 90 150, 120 170, 160 120 S 240 70, 280 50" />
                  </circle>
                </svg>
                <div className="glass absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} /> 6.4 km away
                  </span>
                  <span className="font-medium">ETA 18 min</span>
                </div>
              </div>
              {/* sheet */}
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[11px] text-muted">KNT-482019</div>
                    <div className="text-lg font-semibold tracking-tight">Arriving today</div>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-ink">
                    <Package size={18} />
                  </span>
                </div>
                <ol className="relative space-y-3.5 border-l border-dashed border-ink/20 pl-5">
                  {EVENTS.map((e, i) => (
                    <motion.li
                      key={e.title}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.25, duration: 0.6 }}
                      className="relative"
                    >
                      <span
                        className={`absolute -left-[26px] top-1 grid h-3 w-3 place-items-center rounded-full ${e.done ? "bg-ink" : "bg-accent ring-4 ring-accent/25"}`}
                      />
                      <div className="flex justify-between text-[13px]">
                        <span className="font-medium">{e.title}</span>
                        <span className="font-mono text-muted">{e.t}</span>
                      </div>
                      <div className="text-[12px] text-muted">{e.place}</div>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

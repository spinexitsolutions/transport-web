"use client";
import { motion } from "framer-motion";
import { MapPin, Package } from "lucide-react";

const EVENTS = [
  { t: "09:12", title: "Picked up", place: "Bengaluru · Peenya", done: true },
  { t: "14:40", title: "Departed BLR Air Cargo", place: "Flight EK 569", done: true },
  { t: "21:05", title: "Customs cleared", place: "Dubai · DXB", done: true },
  { t: "Now", title: "Out for delivery", place: "Al Quoz, Dubai", done: false },
];

const ROUTE = "M 40 190 C 90 150, 120 170, 160 120 S 240 70, 280 50";

/** Kinetik tracking app mockup. */
export function Phone() {
  return (
    <div className="relative w-[280px] rounded-[44px] bg-ink p-2.5 shadow-[0_50px_100px_-30px_rgba(11,13,23,.5)] sm:w-[310px]">
      <div className="relative overflow-hidden rounded-[36px] bg-bone">
        <div className="absolute left-1/2 top-2.5 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-ink" />
        <div className="relative h-56 overflow-hidden bg-[#e3e2ef]">
          <svg viewBox="0 0 320 224" className="absolute inset-0 h-full w-full">
            {Array.from({ length: 9 }).map((_, i) => (
              <path key={i} d={`M ${-20 + i * 45} 0 L ${40 + i * 45} 224`} stroke="#fff" strokeWidth="6" opacity=".7" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <path key={`h${i}`} d={`M 0 ${20 + i * 50} L 320 ${i * 50}`} stroke="#fff" strokeWidth="4" opacity=".6" />
            ))}
            <path d={ROUTE} fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
            <motion.path
              d={ROUTE}
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
              <animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;0.78;0.78" keyTimes="0;0.7;1" calcMode="linear" path={ROUTE} />
            </circle>
          </svg>
          <div className="glass absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> 6.4 km away
            </span>
            <span className="font-medium">ETA 18 min</span>
          </div>
        </div>
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
                <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ${e.done ? "bg-ink" : "bg-accent ring-4 ring-accent/25"}`} />
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
    </div>
  );
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Hub } from "@/lib/types";
import { WORLD_ROWS } from "@/lib/world-dots";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

const CODES: Record<string, string> = {
  Mumbai: "BOM", Delhi: "DEL", Bengaluru: "BLR", Kolkata: "CCU", Chennai: "MAA", Hyderabad: "HYD",
  Dubai: "DXB", Singapore: "SIN", Rotterdam: "RTM", "New York": "JFK", Shanghai: "PVG", Nairobi: "NBO",
  Sydney: "SYD", London: "LHR",
};
const code = (city: string) => CODES[city] ?? city.slice(0, 3).toUpperCase();

/** Route board + dot map. Hovering a board row isolates its lane on the map. */
export function Network({ hubs }: { hubs: Hub[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const origin = hubs[0];
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft = ((hubs[0]?.x ?? 700) / 1000) * el.scrollWidth - el.clientWidth / 2;
  }, [hubs]);

  const dots = useMemo(() => {
    const out: [number, number][] = [];
    WORLD_ROWS.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) if (row[c] === "1") out.push([c * 10 + 5, r * 10 + 5]);
    });
    return out;
  }, []);

  const arc = (a: Hub, b: Hub) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    return `M ${a.x} ${a.y} Q ${mx} ${my - d * 0.35} ${b.x} ${b.y}`;
  };

  // pseudo transit time from map distance (1 map unit ≈ 40 km)
  const transit = (h: Hub) => {
    if (h.id === origin.id) return "HQ";
    const km = Math.hypot(h.x - origin.x, h.y - origin.y) * 40;
    return km < 1200 ? `${Math.max(1, Math.round(km / 450))}D ROAD` : `${Math.max(1, Math.round(km / 2500))}D AIR`;
  };

  if (!origin) return null;

  return (
    <section data-nav-label="Global network" className="relative overflow-hidden bg-deep py-20 text-white sm:py-28">
      <div className="noise absolute inset-0" />
      <div className="wrap relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel index="04" dark>
              Global network
            </SectionLabel>
            <h2 className="display mt-6 text-[clamp(2.4rem,6vw,5.2rem)]">
              <SplitWords text="India-rooted." />
              <br />
              <SplitWords text="World-connected." wordClassName="hl" delay={0.15} />
            </h2>
          </div>
          <div className="flex gap-8 sm:gap-12">
            {[
              ["11", "Hubs"],
              ["300+", "Ports"],
              ["60", "Airlines"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="board text-6xl text-signal sm:text-7xl">{v}</div>
                <div className="eyebrow mt-2 text-white/50">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* departures-style hub board */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="eyebrow text-white/50">Lanes from {code(origin.city)}</span>
              <span className="flex items-center gap-2 eyebrow text-signal">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> Live
              </span>
            </div>
            <ul>
              {hubs.map((h, i) => {
                const on = hover === h.id;
                return (
                  <motion.li
                    key={h.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setHover(h.id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setHover((v) => (v === h.id ? null : h.id))}
                    className={`grid cursor-pointer grid-cols-[3.6rem_1fr_auto] items-center gap-3 border-b border-white/10 py-2.5 transition-colors ${on ? "bg-white/[0.06]" : ""}`}
                  >
                    <span className={`board text-3xl transition-colors ${on ? "text-signal" : "text-white"}`}>{code(h.city)}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium">{h.city}</span>
                      <span className="block text-xs text-white/45">{h.country}</span>
                    </span>
                    <span className={`board text-lg tracking-wide ${on ? "text-signal" : "text-white/55"}`}>{transit(h)}</span>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          {/* map */}
          <div className="order-1 lg:order-2 lg:col-span-8">
            <div ref={scroller} className="no-scrollbar -mx-4 overflow-x-auto sm:mx-0 lg:sticky lg:top-24">
              <svg viewBox="0 0 1000 420" className="w-full min-w-[760px] lg:min-w-0" role="img" aria-label="Map of Kinetik's global hubs">
                <defs>
                  <radialGradient id="netglow">
                    <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {dots.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={1.7} fill="rgba(255,255,255,0.16)" />
                ))}
                <circle cx={origin.x} cy={origin.y} r={70} fill="url(#netglow)" />
                {hubs.slice(1).map((h, i) => {
                  const d = arc(origin, h);
                  const on = hover === null || hover === h.id;
                  return (
                    <g key={h.id} style={{ opacity: on ? 1 : 0.12, transition: "opacity .4s" }}>
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="var(--signal)"
                        strokeWidth={hover === h.id ? 2.4 : 1.4}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 0.9 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.6, delay: 0.3 + i * 0.12, ease: [0.65, 0, 0.35, 1] }}
                      />
                      <circle r={2.6} fill="#fff">
                        <animateMotion dur={`${3 + (i % 4)}s`} repeatCount="indefinite" path={d} begin={`${1.5 + i * 0.3}s`} />
                      </circle>
                    </g>
                  );
                })}
                {hubs.map((h) => (
                  <g key={h.id} onMouseEnter={() => setHover(h.id)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
                    <circle cx={h.x} cy={h.y} r={h.primary ? 5 : 3.5} fill="var(--signal)" />
                    <circle cx={h.x} cy={h.y} r={h.primary ? 5 : 3.5} fill="none" stroke="var(--signal)" strokeWidth={1}>
                      <animate attributeName="r" from={h.primary ? 5 : 3.5} to={h.primary ? 18 : 12} dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.9" to="0" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    {(h.primary || hover === h.id) && (
                      <text x={h.x + 9} y={h.y - 8} fill="rgba(255,255,255,.85)" fontSize={13} fontWeight={800} fontFamily="var(--font-board)">
                        {code(h.city)}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

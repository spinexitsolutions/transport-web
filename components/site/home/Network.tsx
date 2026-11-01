"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Hub } from "@/lib/types";
import { WORLD_ROWS } from "@/lib/world-dots";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

export function Network({ hubs }: { hubs: Hub[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // On narrow screens the map scrolls sideways — start centred on the home hub.
  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft = (hubs[0]?.x ?? 700) / 1000 * el.scrollWidth - el.clientWidth / 2;
  }, [hubs]);
  const origin = hubs[0];
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

  return (
    <section data-nav-label="Global network" className="relative overflow-hidden bg-night py-20 text-white sm:py-28">
      <div className="noise absolute inset-0" />
      <div className="wrap relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel index="04" dark>
              Global network
            </SectionLabel>
            <h2 className="display mt-6 text-[clamp(2.6rem,7vw,6rem)]">
              <SplitWords text="India-rooted." />
              <br />
              <SplitWords text="World-connected." wordClassName="hl" delay={0.15} />
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm lg:gap-10">
            {[
              ["11", "global hubs"],
              ["300+", "ports served"],
              ["60", "airline partners"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="display text-4xl sm:text-5xl">{v}</div>
                <div className="mt-1 text-white/50">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div ref={scroller} className="relative mt-12 -mx-4 overflow-x-auto no-scrollbar sm:mx-0">
          <svg viewBox="0 0 1000 420" className="min-w-[760px] w-full" role="img" aria-label="Map of Kinetik's global hubs">
            <defs>
              <radialGradient id="glow">
                <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {dots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.7} fill="rgba(255,255,255,0.16)" />
            ))}
            <circle cx={origin.x} cy={origin.y} r={70} fill="url(#glow)" />
            {hubs.slice(1).map((h, i) => {
              const d = arc(origin, h);
              const on = hover === null || hover === h.id;
              return (
                <g key={h.id} style={{ opacity: on ? 1 : 0.15, transition: "opacity .4s" }}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="var(--signal)"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.85 }}
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
                {h.primary && (
                  <text x={h.x + 9} y={h.y - 8} fill="rgba(255,255,255,.8)" fontSize={11} fontFamily="var(--font-display)">
                    {h.city.toUpperCase()}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {hubs.map((h) => (
            <button
              key={h.id}
              onMouseEnter={() => setHover(h.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover((v) => (v === h.id ? null : h.id))}
              className={`rounded-full px-4 py-2 text-sm transition ${hover === h.id ? "bg-signal text-ink" : "bg-white/[0.07] text-white/75 hover:bg-white/15"}`}
            >
              {h.city}
              <span className="ml-2 text-xs opacity-50">{h.country}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

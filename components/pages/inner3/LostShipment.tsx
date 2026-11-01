"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Truck } from "lucide-react";

const TARGET = "SHIPMENT NOT FOUND · 404";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·→";

/** Split-flap row that scrambles then settles on TARGET. */
function FlapRow() {
  const [text, setText] = useState(TARGET.replace(/[^ ]/g, " "));
  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setText(
        TARGET.split("")
          .map((c, i) => (c === " " ? " " : frame > 6 + i * 1.2 ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join(""),
      );
      if (frame > 8 + TARGET.length * 1.2) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 sm:gap-x-5" aria-label={TARGET}>
      {(() => {
        // group characters by word so wrapping only happens between words
        let offset = 0;
        return TARGET.split(" ").map((word, w) => {
          const start = offset;
          offset += word.length + 1;
          return (
            <span key={w} className="flex gap-[3px] sm:gap-1">
              {text
                .slice(start, start + word.length)
                .split("")
                .map((c, i) => (
                  <span key={i} aria-hidden className="board relative grid h-9 w-[22px] place-items-center rounded-[4px] bg-[#151829] text-xl text-signal shadow-[inset_0_-2px_0_rgba(0,0,0,.4)] sm:h-12 sm:w-8 sm:text-3xl lg:h-14 lg:w-[34px] lg:text-4xl">
                    {c}
                    <span className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
                  </span>
                ))}
            </span>
          );
        });
      })()}
    </div>
  );
}

export function LostShipment() {
  const route = "M 20 120 L 260 120 L 380 120";
  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden bg-night px-4 text-white">
      <div className="noise absolute inset-0" />
      <div className="relative mx-auto flex w-full max-w-5xl items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v16" />
              <path d="M18 4l-8 8 8 8" />
            </svg>
          </span>
          Kinetik
        </Link>
        <span className="eyebrow hidden text-white/50 sm:inline">Control tower · Exception desk</span>
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-10 text-center">
        <div className="mb-6 flex w-full items-center justify-between border-b border-white/10 pb-3 text-left">
          <span className="board text-2xl text-white">Departures</span>
          <span className="eyebrow text-white/40">Gate ?? · Status</span>
        </div>
        <FlapRow />

        {/* route that goes off the map */}
        <svg viewBox="0 0 400 200" className="mt-10 w-full max-w-xl overflow-visible">
          <path d={route} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeDasharray="6 8" />
          <path d="M 260 120 C 300 120, 320 60, 360 30 S 420 -20, 460 -60" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="4 7" className="animate-dash" />
          <circle cx="20" cy="120" r="6" fill="white" />
          <text x="20" y="150" fill="rgba(255,255,255,.55)" fontSize="13" textAnchor="middle" className="board">
            YOU
          </text>
          <circle cx="380" cy="120" r="7" fill="none" stroke="var(--signal)" strokeWidth="2" />
          <text x="380" y="150" fill="rgba(255,255,255,.55)" fontSize="13" textAnchor="middle" className="board">
            THIS PAGE?
          </text>
          <motion.g
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: [0, 240, 300, 380], y: [0, 0, -50, -150], rotate: [0, 0, -35, -45], opacity: [1, 1, 1, 0] }}
            transition={{ duration: 4, times: [0, 0.5, 0.75, 1], repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
            style={{ originX: "16px", originY: "16px" }}
          >
            <foreignObject x="4" y="104" width="32" height="32">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white">
                <Truck size={15} />
              </div>
            </foreignObject>
          </motion.g>
        </svg>

        <h1 className="display mt-10 text-[clamp(2.2rem,6vw,4.5rem)]">
          This route went <span className="hl">off the map.</span>
        </h1>
        <p className="mt-4 max-w-md text-white/60">
          Our control tower searched every lane — the page you asked for isn&apos;t on any manifest. Let&apos;s re-route you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center gap-2 rounded-full bg-signal px-6 font-semibold text-ink transition hover:scale-[1.03]">
            <ArrowLeft size={16} /> Back to base
          </Link>
          <Link href="/track" className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-medium ring-1 ring-white/25 transition hover:bg-white/10">
            <Search size={16} /> Track a shipment
          </Link>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-5xl border-t border-white/10 py-4 text-center">
        <span className="eyebrow text-white/35">Error code 404 · Reference KNT-LOST-000</span>
      </div>
    </main>
  );
}

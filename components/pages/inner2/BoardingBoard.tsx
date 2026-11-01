"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Job } from "@/lib/types";

export const APPLY_EVENT = "kinetik:apply";
export const gateFor = (dep: string) => dep.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();

/** "NOW BOARDING" departure-board rows; clicking a row opens the apply modal in JobsBoard. */
export function BoardingBoard({ jobs }: { jobs: Job[] }) {
  const [time, setTime] = useState("--:--");
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const a = setInterval(tick, 20000);
    const b = setInterval(() => setBlink((v) => !v), 700);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);
  return (
    <div className="overflow-hidden rounded-[16px] bg-deep ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <span className="board text-2xl text-signal sm:text-3xl">Now boarding</span>
        <span className="board text-2xl text-white/80">{time} IST</span>
      </div>
      <div className="hidden grid-cols-[1.6fr_1fr_1fr_0.5fr_0.8fr] gap-4 border-b border-white/10 px-5 py-2 sm:grid">
        {["Role", "Department", "City", "Gate", "Status"].map((h) => (
          <span key={h} className="eyebrow text-white/40">
            {h}
          </span>
        ))}
      </div>
      <ul>
        {jobs.map((j, i) => (
          <motion.li
            key={j.id}
            initial={{ opacity: 0, rotateX: -80 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top" }}
            className="border-b border-white/[0.07] last:border-0"
          >
            <button
              onClick={() => window.dispatchEvent(new CustomEvent(APPLY_EVENT, { detail: j.id }))}
              className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-white/[0.06] sm:grid-cols-[1.6fr_1fr_1fr_0.5fr_0.8fr] sm:px-5"
            >
              <span className="board truncate text-xl tracking-wide text-white transition-colors group-hover:text-signal sm:text-2xl">{j.title}</span>
              <span className={`board text-base sm:order-last ${blink ? "text-signal" : "text-signal/40"}`}>Boarding</span>
              <span className="text-sm text-white/55">{j.department}</span>
              <span className="hidden text-sm text-white/55 sm:block">{j.location}</span>
              <span className="board hidden text-xl text-white/80 sm:block">{gateFor(j.department)}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

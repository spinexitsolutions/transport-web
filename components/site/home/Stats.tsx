"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { Stat } from "@/lib/types";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%+.";
const STATUS = ["ON TIME", "LIVE", "BOARDING", "CLEARED"];

const fmt = (s: Stat) => {
  const d = s.value % 1 !== 0 ? 1 : 0;
  return `${s.prefix}${s.value.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d })}${s.suffix}`;
};

/** Airport-style departure board with split-flap characters. */
export function Stats({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);
  const width = Math.max(...stats.map((s) => fmt(s).length), 4);

  return (
    <section data-nav-label="By the numbers" className="relative overflow-hidden bg-ink text-white">
      <style>{`@keyframes flap{from{transform:rotateX(70deg);opacity:.4}to{transform:rotateX(0);opacity:1}}`}</style>
      <div className="noise absolute inset-0" />
      <div ref={ref} className="wrap relative py-16 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow flex items-center gap-3 text-white/55">
              <span className="cross text-signal" /> Departures · By the numbers
            </div>
            <h2 className="board mt-4 text-[clamp(3.2rem,9vw,7rem)]">
              Network <span className="text-signal">status</span>
            </h2>
          </div>
          <div className="board flex items-center gap-3 rounded-[10px] bg-white/[0.06] px-4 py-2 text-3xl ring-1 ring-white/10">
            <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
            {time} <span className="text-base text-white/50">IST</span>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[16px] ring-1 ring-white/10">
          <div className="eyebrow hidden grid-cols-12 gap-4 bg-white/[0.04] px-5 py-3 text-white/45 sm:grid">
            <span className="col-span-1">No.</span>
            <span className="col-span-5">Metric</span>
            <span className="col-span-4">Reading</span>
            <span className="col-span-2 text-right">Status</span>
          </div>
          {stats.map((s, i) => (
            <div key={s.id} className="grid grid-cols-12 items-center gap-x-4 gap-y-3 border-t border-white/10 px-4 py-5 sm:px-5">
              <span className="board col-span-2 text-2xl text-white/40 sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="col-span-7 text-[15px] font-medium text-white/80 sm:col-span-5 sm:text-lg">{s.label}</span>
              <span className="col-span-3 text-right sm:order-last sm:col-span-2">
                <span className="board inline-block rounded-[6px] bg-signal/15 px-2 py-1 text-base text-signal">{STATUS[i % STATUS.length]}</span>
              </span>
              <div className="col-span-12 sm:col-span-4">
                <FlapRow text={fmt(s).padStart(width, " ")} run={inView} delay={i * 260} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlapRow({ text, run, delay }: { text: string; run: boolean; delay: number }) {
  return (
    <div className="flex gap-1" aria-label={text.trim()}>
      {text.split("").map((c, i) => (
        <Flap key={i} target={c} run={run} delay={delay + i * 90} />
      ))}
    </div>
  );
}

function Flap({ target, run, delay }: { target: string; run: boolean; delay: number }) {
  const [ch, setCh] = useState(target === " " ? " " : "0");
  const [flip, setFlip] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (target === " ") {
      setCh(" ");
      return;
    }
    let n = 0;
    const steps = 8 + Math.floor(Math.random() * 6);
    let iv: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        n++;
        setFlip((f) => f + 1);
        if (n >= steps) {
          setCh(target);
          if (iv) clearInterval(iv);
        } else setCh(CHARS[Math.floor(Math.random() * CHARS.length)]);
      }, 55);
    }, delay);
    return () => {
      clearTimeout(start);
      if (iv) clearInterval(iv);
    };
  }, [run, target, delay]);

  return (
    <span
      aria-hidden
      className="board relative grid h-[2.6rem] w-[1.75rem] place-items-center overflow-hidden rounded-[5px] bg-[#1b1e2b] text-[1.9rem] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,.4)] sm:h-[3.4rem] sm:w-[2.3rem] sm:text-[2.6rem]"
    >
      <span key={flip} className="animate-[flap_.12s_ease-out]">{ch === " " ? " " : ch}</span>
      <span className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
    </span>
  );
}

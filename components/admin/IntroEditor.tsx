"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SingletonEditor } from "./SingletonEditor";
import type { Row } from "./fields";
import { headerLinkCls } from "./cms/kit";

type Style = "counter" | "wordmark" | "route";

const STYLES: { value: Style; label: string; text: string }[] = [
  { value: "counter", label: "Counter", text: "Giant 0 → 100 counter with flashing words, then the curtain lifts." },
  { value: "wordmark", label: "Wordmark", text: "Your brand rises letter by letter, then splits to reveal the site." },
  { value: "route", label: "Route", text: "A route draws between hubs while words cycle, then wipes away." },
];

/** Loops a 0→100 value over `duration` seconds while `run` is true. */
function useLoopProgress(duration: number, run: boolean, key: number) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!run) {
      setP(100);
      return;
    }
    const total = Math.max(1.2, duration) * 1000;
    let start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      let e = t - start;
      if (e > total + 900) {
        start = t;
        e = 0;
      }
      const x = Math.min(1, e / total);
      setP(Math.round((x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2) * 100));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, run, key]);
  return p;
}

/** Faithful miniature of the public intro (accent screen, signal highlights). */
function IntroStage({ style, words, progress, brand = "Kinetik", compact }: { style: Style; words: string[]; progress: number; brand?: string; compact?: boolean }) {
  const list = words.length ? words : [brand];
  const idx = Math.min(list.length - 1, Math.floor((progress / 100) * list.length));
  return (
    <div className="absolute inset-0 overflow-hidden bg-accent text-white">
      {!compact && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="eyebrow flex items-center gap-2 text-[8px] opacity-80">
            <span className="cross scale-75" /> Manifest · 001
          </span>
          <span className="barcode h-4 w-14 opacity-70" />
        </div>
      )}
      {style === "counter" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className={cn("relative h-[1.15em] overflow-hidden display", compact ? "text-[18px]" : "text-[clamp(1.8rem,5vw,2.8rem)]")}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={idx}
                className={cn("block", idx === list.length - 1 && "text-signal")}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {list[idx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      )}
      {style === "wordmark" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className={cn("flex overflow-hidden display leading-[0.85]", compact ? "text-[22px]" : "text-[clamp(2.2rem,7vw,4rem)]")}>
            {brand.split("").map((l, i) => (
              <motion.span
                key={`${l}-${i}`}
                animate={{ y: progress > (i / brand.length) * 60 ? "0%" : "105%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={i === brand.length - 1 ? "text-signal" : ""}
              >
                {l}
              </motion.span>
            ))}
          </div>
        </div>
      )}
      {style === "route" && (
        <div className="absolute inset-0 grid place-items-center px-4">
          <svg viewBox="0 0 300 100" className={compact ? "w-[86%]" : "w-[80%]"}>
            <path d="M15 75 C 80 5, 120 95, 150 50 S 240 15, 285 40" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2" strokeDasharray="4 6" />
            <path
              d="M15 75 C 80 5, 120 95, 150 50 S 240 15, 285 40"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - progress / 100}
            />
            {[
              [15, 75],
              [150, 50],
              [285, 40],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="5" fill={progress / 100 > i * 0.48 ? "var(--signal)" : "rgba(255,255,255,.35)"} />
            ))}
          </svg>
        </div>
      )}
      <div className={cn("absolute inset-x-0 bottom-0 flex items-end justify-between", compact ? "p-1.5" : "p-3")}>
        {!compact && <span className="eyebrow text-[8px] opacity-60">{brand} — loading the network</span>}
        <span className={cn("display ml-auto tabular-nums leading-[0.8] tracking-[-0.05em]", compact ? "text-[20px]" : "text-[clamp(2.6rem,8vw,4.4rem)]")}>
          {progress}
          <span className="text-signal">%</span>
        </span>
      </div>
      <div className="absolute bottom-0 left-0 h-[3px] bg-signal" style={{ width: `${progress}%` }} />
    </div>
  );
}

function StyleCard({ s, active, words, onPick, i }: { s: (typeof STYLES)[number]; active: boolean; words: string[]; onPick: () => void; i: number }) {
  const p = useLoopProgress(2.2 + i * 0.3, true, 0);
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "group overflow-hidden rounded-[16px] border text-left transition",
        active ? "border-ink bg-ink text-white shadow-[0_18px_40px_-20px_rgba(8,10,20,.6)]" : "border-ink/10 bg-white hover:-translate-y-0.5 hover:border-ink/30",
      )}
    >
      <div className="relative aspect-[16/9]">
        <IntroStage style={s.value} words={words} progress={p} compact />
        {active && <span className="board absolute left-2 top-2 rounded-md bg-signal px-1.5 py-0.5 text-[11px] leading-none text-ink">Selected</span>}
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between">
          <span className="display text-[16px] [font-stretch:110%]">{s.label}</span>
          <span className={cn("board text-[18px] leading-none", active ? "text-signal" : "text-ink/20")}>{String(i + 1).padStart(2, "0")}</span>
        </div>
        <div className={cn("mt-1 text-[12px] leading-relaxed", active ? "text-white/60" : "text-muted")}>{s.text}</div>
      </div>
    </button>
  );
}

function IntroPreview({ v }: { v: Row }) {
  const [replay, setReplay] = useState(0);
  const words = (v.words as string[]) ?? [];
  const enabled = Boolean(v.enabled);
  const p = useLoopProgress(Number(v.duration) || 2.6, enabled, replay);
  return (
    <div className="overflow-hidden rounded-[18px] border border-ink/10 bg-white">
      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <span className="eyebrow text-muted">Live monitor</span>
        <button type="button" onClick={() => setReplay((r) => r + 1)} className="inline-flex items-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-[12px] font-medium transition hover:bg-ink hover:text-white">
          <RotateCcw size={12} /> Replay
        </button>
      </div>
      <div className="relative aspect-[4/3]">
        <IntroStage style={(v.style as Style) || "counter"} words={words} progress={p} />
        {!enabled && (
          <div className="absolute inset-0 grid place-items-center bg-night/70 backdrop-blur-[2px]">
            <span className="board rounded-md bg-white/10 px-3 py-1.5 text-[18px] tracking-wide text-white">Intro switched off</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 text-center">
        {[
          ["Style", String(v.style || "counter")],
          ["Duration", `${String(v.duration ?? "–")}s`],
          ["Plays", v.oncePerSession ? "Once / visit" : "Every load"],
        ].map(([k, val]) => (
          <div key={k} className="px-2 py-3">
            <div className="eyebrow text-[9px] text-muted">{k}</div>
            <div className="board mt-1 text-[18px] leading-none">{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IntroEditor() {
  return (
    <SingletonEditor
      dbKey="intro"
      code="FX-INTRO"
      eyebrow="Motion"
      title="Intro animation"
      description="The cinematic loader visitors see when they land on the website. Save, then preview it on the real site."
      actions={
        <a href="/?intro=preview" target="_blank" rel="noreferrer" className={headerLinkCls}>
          <Play size={14} /> Preview on site
        </a>
      }
      aside={(v) => <IntroPreview v={v} />}
      sections={[
        {
          title: "Behaviour",
          description: "When and how long the intro plays.",
          fields: [
            { name: "enabled", label: "Show intro", type: "toggle", half: true },
            { name: "oncePerSession", label: "Only once per visit", type: "toggle", half: true },
            { name: "duration", label: "Duration (seconds)", type: "number", step: 0.1, half: true },
          ],
        },
        {
          title: "Style",
          description: "Pick a sequence — each card is a live miniature.",
          custom: (v, set) => (
            <div className="grid gap-3 sm:grid-cols-3">
              {STYLES.map((s, i) => (
                <StyleCard key={s.value} s={s} i={i} active={v.style === s.value} words={(v.words as string[]) ?? []} onPick={() => set("style", s.value)} />
              ))}
            </div>
          ),
        },
        {
          title: "Words",
          description: "Flashed in sequence during the intro. The last one lingers in lime.",
          fields: [{ name: "words", label: "Words", type: "stringList" }],
        },
      ]}
    />
  );
}

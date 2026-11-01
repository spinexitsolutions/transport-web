"use client";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { SingletonEditor } from "./SingletonEditor";
import type { Row } from "./fields";

const STYLES = [
  { value: "counter", label: "Counter", text: "A giant 0 → 100 counter with flashing words, then the curtain lifts." },
  { value: "wordmark", label: "Wordmark", text: "Your brand name rises letter by letter, then splits to reveal the site." },
  { value: "route", label: "Route", text: "A route line draws between two hubs while words cycle, then wipes away." },
];

function IntroPreview({ v }: { v: Row }) {
  const words = (v.words as string[]) ?? [];
  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-white">
      <div className="eyebrow border-b border-line px-5 py-3 text-muted">At a glance</div>
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-night text-white">
        <div className={cn("text-center", !v.enabled && "opacity-30")}>
          {v.style === "counter" && <div className="display text-[84px] tabular-nums">100</div>}
          {v.style === "wordmark" && <div className="display text-[48px]">Kinetik</div>}
          {v.style === "route" && (
            <svg viewBox="0 0 200 80" className="w-48">
              <circle cx="20" cy="60" r="5" fill="white" />
              <path d="M20 60 Q100 -10 180 40" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="6 6" />
              <circle cx="180" cy="40" r="5" fill="var(--accent)" />
            </svg>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 px-6">
            {words.map((w, i) => (
              <span key={i} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
                {w}
              </span>
            ))}
          </div>
        </div>
        {!v.enabled && <div className="absolute bottom-3 rounded-full bg-white/10 px-3 py-1 text-[11px]">Intro disabled</div>}
      </div>
      <div className="p-5 text-[13px] text-muted">
        Duration <b className="text-ink">{String(v.duration)}s</b> · {v.oncePerSession ? "plays once per visit" : "plays on every page load"}
      </div>
    </div>
  );
}

export function IntroEditor() {
  return (
    <SingletonEditor
      dbKey="intro"
      title="Intro animation"
      description="The cinematic loader visitors see when they land on the website."
      actions={
        <a
          href="/?intro=preview"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium hover:border-ink/25"
        >
          <Play size={14} /> Preview intro
        </a>
      }
      aside={(v) => <IntroPreview v={v} />}
      sections={[
        {
          title: "Behaviour",
          description: "Save first, then preview to see your changes.",
          fields: [
            { name: "enabled", label: "Show intro", type: "toggle", half: true },
            { name: "oncePerSession", label: "Only once per visit", type: "toggle", half: true },
            { name: "duration", label: "Duration (seconds)", type: "number", step: 0.1, half: true },
          ],
        },
        {
          title: "Style",
          custom: (v, set) => (
            <div className="grid gap-2 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("style", s.value)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    v.style === s.value ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/25",
                  )}
                >
                  <div className="font-semibold tracking-tight">{s.label}</div>
                  <div className={cn("mt-1 text-[12px] leading-relaxed", v.style === s.value ? "text-white/60" : "text-muted")}>{s.text}</div>
                </button>
              ))}
            </div>
          ),
        },
        {
          title: "Words",
          description: "Flashed in sequence during the intro. The last one lingers.",
          fields: [{ name: "words", label: "Words", type: "stringList" }],
        },
      ]}
    />
  );
}

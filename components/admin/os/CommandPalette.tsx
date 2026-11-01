"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type Command = {
  id: string;
  label: string;
  group: string;
  code: string;
  hint?: string;
  run: () => void;
};

/** Subsequence fuzzy score: lower is better, -1 = no match. */
function score(query: string, text: string) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return 0;
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    gaps += found - ti;
    ti = found + 1;
  }
  return gaps + (t.startsWith(q[0]) ? 0 : 3);
}

export function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Command[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const results = useMemo(
    () =>
      commands
        .map((c) => ({ c, s: Math.min(...[c.label, `${c.group} ${c.label}`, c.code].map((t) => (score(q, t) < 0 ? Infinity : score(q, t)))) }))
        .filter((r) => r.s !== Infinity)
        .sort((a, b) => a.s - b.s)
        .map((r) => r.c),
    [q, commands],
  );

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-idx="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = results[sel];
      if (c) {
        onClose();
        c.run();
      }
    } else if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-start justify-center px-3 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-night/60 backdrop-blur-[4px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[16px] bg-ink text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,.7)] ring-1 ring-white/10"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <span className="board text-lg text-signal">&gt;_</span>
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Jump to a screen or run a command…"
                className="h-14 w-full bg-transparent text-[16px] placeholder:text-white/35 focus:outline-none"
                aria-label="Command"
              />
              <kbd className="board rounded-[5px] bg-white/10 px-1.5 py-0.5 text-[11px] tracking-[0.08em] text-white/60">ESC</kbd>
            </div>
            <ul ref={list} className="max-h-[52vh] overflow-y-auto p-2" data-lenis-prevent>
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-white/50">No route found for &ldquo;{q}&rdquo;</li>}
              {results.map((c, i) => {
                const first = i === 0 || results[i - 1].group !== c.group;
                return (
                  <li key={c.id} data-idx={i}>
                    {first && !q && <div className="board px-3 pb-1 pt-3 text-[12px] tracking-[0.12em] text-white/35">{c.group}</div>}
                    <button
                      onMouseEnter={() => setSel(i)}
                      onClick={() => {
                        onClose();
                        c.run();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] transition-colors",
                        i === sel ? "bg-signal text-ink" : "text-white/80",
                      )}
                    >
                      <span className={cn("board w-9 text-[13px] tracking-[0.08em]", i === sel ? "text-ink/60" : "text-white/40")}>{c.code}</span>
                      <span className="flex-1">{c.label}</span>
                      {c.hint && <span className={cn("text-[12px]", i === sel ? "text-ink/60" : "text-white/35")}>{c.hint}</span>}
                      {i === sel && <CornerDownLeft size={14} />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[11px] text-white/40">
              <span className="board tracking-[0.1em]">↑↓ navigate · ↵ open</span>
              <span className="board tracking-[0.1em]">{results.length} routes</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

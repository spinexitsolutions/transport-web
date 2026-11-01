"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2, X } from "lucide-react";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/utils";
import { APPLY_EVENT, gateFor } from "./inner2/BoardingBoard";

/** Open roles as boarding passes, with department filter and a boarding-pass apply modal. */
export function JobsBoard({ jobs }: { jobs: Job[] }) {
  const deps = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))], [jobs]);
  const [dep, setDep] = useState("All");
  const [open, setOpen] = useState<Job | null>(null);
  const list = dep === "All" ? jobs : jobs.filter((j) => j.department === dep);

  // rows in the hero departure board open the modal via a window event
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const j = jobs.find((x) => x.id === id);
      if (j) setOpen(j);
    };
    window.addEventListener(APPLY_EVENT, on);
    return () => window.removeEventListener(APPLY_EVENT, on);
  }, [jobs]);

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {deps.map((d) => (
          <button
            key={d}
            onClick={() => setDep(d)}
            aria-pressed={dep === d}
            className={cn(
              "relative shrink-0 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors",
              dep === d ? "text-ink" : "text-ink/70 ring-1 ring-inset ring-line hover:text-ink",
            )}
          >
            {dep === d && <motion.span layoutId="job-dep" className="absolute inset-0 rounded-[10px] bg-signal" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative flex items-center gap-2">
              {d !== "All" && <span className="board text-base">{gateFor(d)}</span>}
              {d}
            </span>
          </button>
        ))}
      </div>

      <motion.ul layout className="mt-8 grid gap-4 lg:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((j, i) => (
            <motion.li
              key={j.id}
              layout
              initial={{ opacity: 0, y: 30, rotate: i % 2 ? 1.5 : -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Pass job={j} onClick={() => setOpen(j)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {list.length === 0 && <p className="mt-8 text-muted">No open roles here right now — write to us anyway.</p>}

      <AnimatePresence>{open && <ApplyModal job={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

/** Boarding-pass card: main ticket + perforated stub. */
function Pass({ job, onClick }: { job: Job; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex w-full text-left transition-transform duration-500 hover:-translate-y-1">
      <div className="relative flex-1 rounded-l-[16px] bg-white p-5 ring-1 ring-line sm:p-6">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-muted">Boarding pass · {job.type}</span>
          <span className="eyebrow text-accent">{job.id.toUpperCase()}</span>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="min-w-0">
            <div className="eyebrow text-muted">From</div>
            <div className="board truncate text-4xl">{gateFor(job.department)}</div>
            <div className="truncate text-xs text-muted">{job.department}</div>
          </div>
          <div className="relative h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--ink)_0_4px,transparent_4px_8px)] opacity-30">
            <span className="absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-[13px] text-white transition-transform duration-700 group-hover:translate-x-6">✈</span>
          </div>
          <div className="min-w-0 text-right">
            <div className="eyebrow text-muted">To</div>
            <div className="board truncate text-4xl">{job.location.slice(0, 3).toUpperCase()}</div>
            <div className="truncate text-xs text-muted">{job.location}</div>
          </div>
        </div>
        <h3 className="display mt-5 text-[1.45rem] leading-tight [font-stretch:105%] transition-colors group-hover:text-accent">{job.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{job.description}</p>
      </div>
      {/* stub */}
      <div className="relative flex w-24 shrink-0 flex-col items-center justify-between rounded-r-[16px] bg-ink py-5 text-white sm:w-28">
        <span className="absolute -left-px inset-y-3 border-l-2 border-dashed border-bone" />
        <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-bone" />
        <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-bone" />
        <span className="eyebrow text-white/50">Gate</span>
        <span className="board text-4xl text-signal">{gateFor(job.department)}</span>
        <span className="barcode h-14 w-10 rotate-90 text-white/70" />
        <span className="grid h-9 w-9 place-items-center rounded-full bg-signal text-ink transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </button>
  );
}

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", link: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, jobId: job.id }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Could not submit");
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Could not submit");
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
        data-lenis-prevent
        initial={{ y: "100%", rotate: -2 }}
        animate={{ y: 0, rotate: 0 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[22px] bg-bone sm:rounded-[20px]"
      >
        {/* pass header */}
        <div className="relative bg-accent px-5 pb-6 pt-5 text-white sm:px-8">
          <button onClick={onClose} aria-label="Close dialog" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 transition hover:rotate-90">
            <X size={16} />
          </button>
          <div className="eyebrow text-white/70">Boarding pass · Kinetik careers</div>
          <div className="mt-4 flex items-end gap-4">
            <div>
              <div className="eyebrow text-white/60">From</div>
              <div className="board text-5xl">{gateFor(job.department)}</div>
            </div>
            <span className="board pb-1 text-3xl text-signal">→</span>
            <div>
              <div className="eyebrow text-white/60">To</div>
              <div className="board text-5xl">{job.location.slice(0, 3).toUpperCase()}</div>
            </div>
            <span className="barcode ml-auto hidden h-10 w-28 text-white/70 sm:block" />
          </div>
          <h3 id="apply-title" className="display mt-4 pr-10 text-[1.8rem] leading-tight [font-stretch:105%]">
            {job.title}
          </h3>
          <p className="mt-2 text-sm text-white/75">{job.description}</p>
          {/* perforation */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="h-4 w-4 rounded-full bg-bone" />
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {state === "done" ? (
            <div className="flex flex-col items-center py-8 text-center">
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
                className="board rounded-[10px] border-4 border-accent px-5 py-2 text-4xl text-accent"
              >
                Checked in
              </motion.span>
              <p className="mt-5 text-muted">Our talent team reviews every application within 5 working days.</p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
                <Check size={16} className="text-accent" /> We&apos;ll email you at {f.email}
              </span>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Passenger name", "text", true],
                  ["email", "Email", "email", true],
                  ["phone", "Phone", "tel", false],
                  ["link", "LinkedIn / Portfolio", "url", false],
                ] as const
              ).map(([k, label, type, req]) => (
                <label key={k} className="block">
                  <span className="eyebrow mb-1.5 block text-muted">{label}</span>
                  <input className="field" type={type} required={req} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                </label>
              ))}
              <label className="block sm:col-span-2">
                <span className="eyebrow mb-1.5 block text-muted">Why you?</span>
                <textarea className="field resize-none" rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              </label>
              {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
              <button
                type="submit"
                disabled={state === "loading"}
                className="flex h-13 items-center justify-center gap-2 rounded-[12px] bg-ink py-3.5 font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60 sm:col-span-2"
              >
                {state === "loading" && <Loader2 size={16} className="animate-spin" />}
                Check in &amp; apply
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

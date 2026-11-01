"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2, MapPin, X } from "lucide-react";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JobsBoard({ jobs }: { jobs: Job[] }) {
  const deps = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))], [jobs]);
  const [dep, setDep] = useState("All");
  const [open, setOpen] = useState<Job | null>(null);
  const list = dep === "All" ? jobs : jobs.filter((j) => j.department === dep);

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {deps.map((d) => (
          <button
            key={d}
            onClick={() => setDep(d)}
            aria-pressed={dep === d}
            className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors", dep === d ? "text-white" : "text-ink/70 ring-1 ring-inset ring-line hover:text-ink")}
          >
            {dep === d && <motion.span layoutId="job-dep" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">
              {d}
              {d !== "All" && <span className="ml-1.5 opacity-50">{jobs.filter((j) => j.department === d).length}</span>}
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-8 border-t border-line">
        <AnimatePresence initial={false}>
          {list.map((j) => (
            <motion.li key={j.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-line">
              <button onClick={() => setOpen(j)} className="group relative grid w-full gap-2 overflow-hidden py-6 text-left sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:gap-6 sm:py-8">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-white transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
                <span className="relative text-xl font-medium tracking-tight transition-transform duration-500 group-hover:translate-x-3 sm:text-2xl">{j.title}</span>
                <span className="relative text-sm text-muted">{j.department} · {j.type}</span>
                <span className="relative flex items-center gap-1.5 text-sm text-muted">
                  <MapPin size={14} /> {j.location}
                </span>
                <span className="relative hidden h-11 w-11 place-items-center rounded-full bg-ink text-white transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:text-accent-ink sm:mr-3 sm:grid">
                  <ArrowUpRight size={18} />
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {list.length === 0 && <p className="mt-8 text-muted">No open roles here right now — send us a general application at the bottom of the page.</p>}

      <AnimatePresence>{open && <ApplyModal job={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
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
      <motion.button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
        data-lenis-prevent
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] bg-bone p-5 sm:rounded-[28px] sm:p-8"
      >
        <button onClick={onClose} aria-label="Close dialog" className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-line">
          <X size={16} />
        </button>
        <div className="eyebrow text-muted">{job.department} · {job.location}</div>
        <h3 id="apply-title" className="display mt-3 pr-12 text-3xl">{job.title}</h3>
        <p className="mt-3 text-muted">{job.description}</p>

        {state === "done" ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl bg-white p-8 text-center ring-1 ring-line">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-ink">
              <Check size={24} />
            </span>
            <p className="display mt-4 text-2xl">Application sent.</p>
            <p className="mt-2 text-sm text-muted">Our talent team reviews every application within 5 working days.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["name", "Full name", "text", true],
                ["email", "Email", "email", true],
                ["phone", "Phone", "tel", false],
                ["link", "LinkedIn / Portfolio", "url", false],
              ] as const
            ).map(([k, label, type, req]) => (
              <label key={k} className="block">
                <span className="mb-1.5 block text-sm text-muted">{label}</span>
                <input className="field" type={type} required={req} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-muted">Why you?</span>
              <textarea className="field resize-none" rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            </label>
            {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <button
              type="submit"
              disabled={state === "loading"}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60 sm:col-span-2"
            >
              {state === "loading" && <Loader2 size={16} className="animate-spin" />}
              Submit application
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

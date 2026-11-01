"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPICS = ["New shipment", "Partnership", "Existing order", "Media", "Something else"];

/** Contact form styled as a dispatch ticket. Posts to /api/leads with source "contact". */
export function ContactForm() {
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [topic, setTopic] = useState(TOPICS[0]);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [ref, setRef] = useState("");
  const ticketNo = useMemo(() => `DSP-${String(Math.floor(Date.now() / 1000) % 100000).padStart(5, "0")}`, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, source: "contact", service: topic }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Could not send");
      setRef(j.id || "");
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Could not send");
    }
  }

  return (
    <div className="relative rounded-[16px] bg-white ring-1 ring-line">
      {/* ticket header */}
      <div className="flex items-center justify-between border-b-2 border-dashed border-line px-5 py-4 sm:px-7">
        <div>
          <div className="eyebrow text-muted">Dispatch ticket</div>
          <div className="board text-3xl">{ticketNo}</div>
        </div>
        <span className="barcode h-9 w-24 text-ink/80" />
      </div>
      <span className="absolute -left-2.5 top-[72px] h-5 w-5 rounded-full bg-bone ring-1 ring-line [clip-path:inset(0_0_0_50%)]" />
      <span className="absolute -right-2.5 top-[72px] h-5 w-5 rounded-full bg-bone ring-1 ring-line [clip-path:inset(0_50%_0_0)]" />

      <div className="p-5 sm:p-7">
        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <motion.span
                initial={{ scale: 2.2, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: -8, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
                className="board rounded-[10px] border-4 border-accent px-6 py-2 text-5xl text-accent"
              >
                Dispatched
              </motion.span>
              <p className="mt-6 max-w-sm text-muted">A real human will reply within the hour during business hours.</p>
              {ref && <p className="mt-2 text-sm">Reference <span className="board text-xl">{ref}</span></p>}
            </motion.div>
          ) : (
            <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="space-y-6">
              <fieldset>
                <legend className="eyebrow mb-3 text-muted">01 · Reason for dispatch</legend>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      aria-pressed={topic === t}
                      onClick={() => setTopic(t)}
                      className={cn(
                        "relative rounded-[10px] px-4 py-2 text-sm ring-1 ring-inset transition-colors active:scale-95",
                        topic === t ? "text-white ring-accent" : "bg-bone text-ink/80 ring-line hover:bg-bone-2",
                      )}
                    >
                      {topic === t && <motion.span layoutId="topic" className="absolute inset-0 rounded-[10px] bg-accent" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                      <span className="relative">{t}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                <legend className="eyebrow mb-1 text-muted">02 · Sender</legend>
                {(
                  [
                    ["name", "Full name", "text", "name"],
                    ["company", "Company", "text", "organization"],
                    ["email", "Email", "email", "email"],
                    ["phone", "Phone", "tel", "tel"],
                  ] as const
                ).map(([k, label, type, ac]) => (
                  <label key={k} className="group block border-b border-line py-2 focus-within:border-accent">
                    <span className="block text-[12px] text-muted group-focus-within:text-accent">{label}</span>
                    <input
                      className="w-full bg-transparent py-1 text-[16px] focus:outline-none"
                      type={type}
                      autoComplete={ac}
                      required={k === "name" || k === "email"}
                      value={f[k]}
                      onChange={(e) => setF({ ...f, [k]: e.target.value })}
                    />
                  </label>
                ))}
              </fieldset>
              <label className="block">
                <span className="eyebrow mb-2 block text-muted">03 · Cargo notes</span>
                <textarea className="field resize-none bg-bone" rows={5} required placeholder="What are we moving, from where, to where?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={state === "loading"}
                className="group flex h-14 w-full items-center justify-between rounded-[12px] bg-ink pl-6 pr-2 font-medium text-white transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                {state === "loading" ? "Dispatching…" : "Dispatch message"}
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-signal text-ink">
                  {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                </span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

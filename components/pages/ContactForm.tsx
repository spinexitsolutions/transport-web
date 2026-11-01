"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPICS = ["New shipment", "Partnership", "Existing order", "Media", "Something else"];

export function ContactForm() {
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [topic, setTopic] = useState(TOPICS[0]);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

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
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Could not send");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-white p-5 ring-1 ring-line sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {state === "done" ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-ink"
            >
              <Check size={28} strokeWidth={2.5} />
            </motion.span>
            <h3 className="display mt-6 text-3xl">
              Message <span className="hl-soft">received.</span>
            </h3>
            <p className="mt-3 max-w-sm text-muted">Our team usually replies within an hour during business hours. Keep an eye on your inbox.</p>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="space-y-5">
            <fieldset>
              <legend className="mb-3 text-sm text-muted">I&apos;m reaching out about</legend>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={topic === t}
                    onClick={() => setTopic(t)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm ring-1 ring-inset transition-all active:scale-95",
                      topic === t ? "bg-ink text-white ring-ink" : "bg-bone text-ink/80 ring-line hover:bg-bone-2",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Full name", "text", "name"],
                  ["company", "Company", "text", "organization"],
                  ["email", "Email", "email", "email"],
                  ["phone", "Phone", "tel", "tel"],
                ] as const
              ).map(([k, label, type, ac]) => (
                <label key={k} className="block">
                  <span className="mb-2 block text-sm text-muted">{label}</span>
                  <input
                    className="field"
                    type={type}
                    autoComplete={ac}
                    required={k === "name" || k === "email"}
                    value={f[k]}
                    onChange={(e) => setF({ ...f, [k]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Message</span>
              <textarea className="field resize-none" rows={5} required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={state === "loading"}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-60 sm:w-auto sm:px-8"
            >
              {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
              {state === "loading" ? "Sending…" : "Send message"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

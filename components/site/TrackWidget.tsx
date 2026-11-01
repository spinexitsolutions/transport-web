"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Box, Clock, Loader2, MapPin, Package, Search, Truck, Weight } from "lucide-react";
import { SHIPMENT_FLOW, SHIPMENT_STATUS_LABEL, type Shipment } from "@/lib/types";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";

const SAMPLES = ["KNT-482019", "KNT-730551", "KNT-219874", "KNT-118230"];

export function TrackWidget({ initialId }: { initialId?: string }) {
  const [id, setId] = useState(initialId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Shipment | null>(null);

  const track = useCallback(async (value: string) => {
    const q = value.trim();
    if (!q) {
      setError("Enter a tracking ID to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      setData(json);
      const url = new URL(window.location.href);
      url.searchParams.set("id", q.toUpperCase());
      window.history.replaceState(null, "", url.toString());
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) track(initialId);
  }, [initialId, track]);

  const idx = data ? SHIPMENT_FLOW.indexOf(data.status) : -1;
  const progress = data ? (data.status === "delivered" ? 1 : Math.max(idx, 0) / (SHIPMENT_FLOW.length - 1)) : 0;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          track(id);
        }}
        className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 ring-1 ring-line shadow-[0_20px_60px_-30px_rgba(0,0,0,.3)] focus-within:ring-ink"
      >
        <Search size={18} className="shrink-0 text-muted" />
        <label htmlFor="track-id" className="sr-only">
          Tracking ID
        </label>
        <input
          id="track-id"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter tracking ID, e.g. KNT-482019"
          className="min-w-0 flex-1 bg-transparent py-3 font-mono text-[15px] uppercase tracking-wide outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/35"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          <span className="hidden xs:inline">Track</span>
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>Try:</span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setId(s);
              track(s);
            }}
            className="rounded-full bg-white px-3 py-1 font-mono text-xs text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex items-start gap-3 rounded-3xl bg-white p-5 ring-1 ring-line"
            role="alert"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <AlertTriangle size={18} />
            </span>
            <div>
              <div className="font-medium">We couldn&apos;t find that one.</div>
              <p className="text-sm text-muted">{error}. Double-check the ID or try a sample above.</p>
            </div>
          </motion.div>
        )}

        {loading && !data && (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-3xl bg-ink/5" />
            ))}
          </motion.div>
        )}

        {data && (
          <motion.div
            key={data.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_1fr]"
          >
            {/* Summary */}
            <div className="overflow-hidden rounded-[20px] bg-ink p-5 text-white sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-mono text-sm text-white/60">{data.id}</div>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                    data.status === "delivered" ? "bg-emerald-400 text-ink" : data.status === "exception" ? "bg-red-500 text-white" : "bg-accent text-accent-ink",
                  )}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="pulse-ring absolute inset-0 rounded-full bg-current" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
                  </span>
                  {SHIPMENT_STATUS_LABEL[data.status]}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div className="min-w-0">
                  <div className="eyebrow text-white/40">From</div>
                  <div className="display mt-2 truncate text-2xl sm:text-4xl">{data.origin}</div>
                </div>
                <Truck className="mb-1 text-accent" size={22} />
                <div className="min-w-0 text-right">
                  <div className="eyebrow text-white/40">To</div>
                  <div className="display mt-2 truncate text-2xl sm:text-4xl">{data.destination}</div>
                </div>
              </div>

              <div className="relative mt-6 h-1.5 rounded-full bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
                <motion.div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ink bg-accent"
                  initial={{ left: 0 }}
                  animate={{ left: `${progress * 100}%` }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
              </div>
              <div className="mt-3 flex justify-between gap-1 overflow-hidden">
                {SHIPMENT_FLOW.map((s, i) => (
                  <span key={s} className={cn("hidden text-[10px] uppercase tracking-wider sm:block", i <= idx ? "text-white" : "text-white/30")}>
                    {SHIPMENT_STATUS_LABEL[s].split(" ")[0]}
                  </span>
                ))}
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
                {[
                  { icon: Clock, k: data.status === "delivered" ? "Delivered" : "ETA", v: fmtDate(data.eta, { day: "numeric", month: "short", weekday: "short" }) },
                  { icon: Package, k: "Service", v: data.service },
                  { icon: Weight, k: "Weight", v: `${data.weight.toLocaleString("en-IN")} kg` },
                  { icon: Box, k: "Pieces", v: String(data.pieces) },
                ].map(({ icon: I, k, v }) => (
                  <div key={k} className="bg-ink p-4">
                    <dt className="flex items-center gap-1.5 text-xs text-white/45">
                      <I size={13} /> {k}
                    </dt>
                    <dd className="mt-1 truncate font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Timeline */}
            <div className="rounded-[20px] bg-white p-5 ring-1 ring-line sm:p-8">
              <div className="eyebrow text-muted">Journey</div>
              <ol className="relative mt-6">
                {data.events.map((ev, i) => (
                  <motion.li
                    key={ev.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.09, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >
                    {i < data.events.length - 1 && <span className="absolute top-6 left-[11px] h-[calc(100%-12px)] w-px bg-line" />}
                    <span
                      className={cn(
                        "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                        i === 0 ? "bg-accent text-accent-ink" : "bg-bone ring-1 ring-line",
                      )}
                    >
                      {i === 0 ? <span className="h-2 w-2 rounded-full bg-ink" /> : <span className="h-1.5 w-1.5 rounded-full bg-ink/40" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="font-medium">{SHIPMENT_STATUS_LABEL[ev.status]}</span>
                        <time className="font-mono text-xs text-muted">{fmtDateTime(ev.at)}</time>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{ev.note}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-ink/60">
                        <MapPin size={12} /> {ev.location}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

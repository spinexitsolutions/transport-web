"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CornerDownLeft, Loader2, MapPin } from "lucide-react";
import { SHIPMENT_FLOW, SHIPMENT_STATUS_LABEL, type Shipment } from "@/lib/types";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";

const SAMPLES = ["KNT-482019", "KNT-730551", "KNT-219874", "KNT-118230"];
const E = [0.16, 1, 0.3, 1] as const;

/**
 * Control-tower console: a command-line style input and dashboard panels.
 * Designed to sit on a dark (bg-night) surface.
 */
export function TrackWidget({ initialId }: { initialId?: string }) {
  const [id, setId] = useState(initialId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Shipment | null>(null);
  const [log, setLog] = useState<string[]>(["control-tower v4.2 ready", "awaiting tracking id…"]);
  const input = useRef<HTMLInputElement>(null);

  const track = useCallback(async (value: string) => {
    const q = value.trim().toUpperCase();
    if (!q) {
      setError("Enter a tracking ID to continue");
      return;
    }
    setLoading(true);
    setError("");
    setLog((l) => [...l.slice(-4), `> track ${q}`, "querying network…"]);
    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      setData(json);
      setLog((l) => [...l.slice(-4), `✓ ${json.id} · ${SHIPMENT_STATUS_LABEL[json.status as Shipment["status"]].toLowerCase()} · ${json.events.length} events`]);
      const url = new URL(window.location.href);
      url.searchParams.set("id", q);
      window.history.replaceState(null, "", url.toString());
    } catch (e) {
      setData(null);
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      setLog((l) => [...l.slice(-4), `✗ ${msg.toLowerCase()}`]);
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
    <div className="text-white">
      {/* ── command line ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          track(id);
        }}
        onClick={() => input.current?.focus()}
        className="group rounded-[14px] bg-black/40 p-4 ring-1 ring-white/10 transition focus-within:ring-signal/60 sm:p-5"
      >
        <div className="mb-3 flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal" />
          <span className="eyebrow ml-3 text-white/40">kinetik://track</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="board text-3xl text-signal sm:text-5xl">&gt;</span>
          <label htmlFor="track-id" className="sr-only">
            Tracking ID
          </label>
          <div className="relative min-w-0 flex-1">
            <input
              ref={input}
              id="track-id"
              value={id}
              onChange={(e) => setId(e.target.value.toUpperCase())}
              placeholder="KNT-______"
              className="board w-full min-w-0 bg-transparent text-3xl tracking-wide text-white caret-transparent outline-none placeholder:text-white/20 sm:text-5xl"
              autoComplete="off"
              spellCheck={false}
            />
            {/* blinking block caret after the text */}
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center" aria-hidden>
              <span className="board invisible text-3xl tracking-wide sm:text-5xl">{id || ""}</span>
              <motion.span
                className="ml-0.5 inline-block h-[0.8em] w-[0.45em] bg-signal text-3xl sm:text-5xl"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              />
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 shrink-0 items-center gap-2 rounded-[10px] bg-signal px-4 text-sm font-semibold text-ink transition active:scale-95 disabled:opacity-60 sm:h-14 sm:px-6"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CornerDownLeft size={16} />}
            <span className="hidden xs:inline">Run</span>
          </button>
        </div>
        {/* log */}
        <div className="mt-4 space-y-0.5 border-t border-dashed border-white/10 pt-3 font-mono text-[12px] text-white/45" aria-live="polite">
          {log.map((l, i) => (
            <motion.div key={`${i}-${l}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={cn(l.startsWith("✓") && "text-signal", l.startsWith("✗") && "text-red-400")}>
              {l}
            </motion.div>
          ))}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="eyebrow text-white/40">Sample IDs</span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setId(s);
              track(s);
            }}
            className={cn(
              "board rounded-md px-3 py-1.5 text-base tracking-wide ring-1 transition",
              data?.id === s ? "bg-signal text-ink ring-signal" : "text-white/70 ring-white/15 hover:bg-white/10 hover:text-white",
            )}
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
            className="mt-8 flex items-start gap-3 rounded-[14px] bg-red-500/10 p-5 ring-1 ring-red-400/30"
            role="alert"
          >
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
            <div>
              <div className="board text-2xl text-red-300">Signal lost</div>
              <p className="text-sm text-white/60">{error}. Double-check the ID or run a sample above.</p>
            </div>
          </motion.div>
        )}

        {loading && !data && (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 grid gap-3 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-[14px] bg-white/5" />
            ))}
          </motion.div>
        )}

        {data && (
          <motion.div key={data.id} initial="hidden" animate="show" exit={{ opacity: 0 }} className="mt-8 grid gap-3 lg:grid-cols-12">
            {/* route panel */}
            <Panel className="lg:col-span-8" i={0}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PanelTitle>Route</PanelTitle>
                <StatusPill status={data.status} />
              </div>
              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-4">
                <div className="min-w-0">
                  <div className="eyebrow text-white/40">Origin</div>
                  <div className="board mt-1 truncate text-4xl sm:text-6xl">{data.origin}</div>
                </div>
                <div className="board pb-2 text-2xl text-white/30">→</div>
                <div className="min-w-0 text-right">
                  <div className="eyebrow text-white/40">Destination</div>
                  <div className="board mt-1 truncate text-4xl sm:text-6xl">{data.destination}</div>
                </div>
              </div>
              {/* stops */}
              <div className="relative mt-8">
                <div className="absolute left-0 right-0 top-[7px] h-[2px] bg-white/10" />
                <motion.div
                  className="absolute left-0 top-[7px] h-[2px] bg-signal"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 1.6, ease: E, delay: 0.3 }}
                />
                <ol className="relative flex justify-between">
                  {SHIPMENT_FLOW.map((s, i) => (
                    <li key={s} className="flex flex-col items-center gap-2" style={{ width: 0 }}>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.35 + i * 0.12 }}
                        className={cn(
                          "block h-4 w-4 rounded-full border-2",
                          i < idx || data.status === "delivered" ? "border-signal bg-signal" : i === idx ? "border-signal bg-night ring-4 ring-signal/25" : "border-white/25 bg-night",
                        )}
                      />
                      <span className={cn("eyebrow hidden whitespace-nowrap !text-[0.55rem] sm:block", i <= idx ? "text-white/80" : "text-white/30")}>
                        {SHIPMENT_STATUS_LABEL[s].split(" ")[0]}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </Panel>

            {/* ETA panel */}
            <Panel className="flex flex-col justify-between bg-accent ring-accent lg:col-span-4" i={1}>
              <PanelTitle>{data.status === "delivered" ? "Delivered" : "ETA"}</PanelTitle>
              <div>
                <div className="board mt-4 text-6xl leading-none sm:text-7xl">{fmtDate(data.eta, { day: "2-digit", month: "short" })}</div>
                <div className="mt-1 text-white/70">{fmtDate(data.eta, { weekday: "long", year: "numeric" })}</div>
              </div>
              <div className="mt-4 font-mono text-xs text-white/60">{data.id}</div>
            </Panel>

            {/* metrics */}
            {[
              { k: "Service", v: data.service },
              { k: "Weight", v: `${data.weight.toLocaleString("en-IN")} kg` },
              { k: "Pieces", v: String(data.pieces) },
              { k: "Customer", v: data.customer },
            ].map((m, i) => (
              <Panel key={m.k} className="lg:col-span-3" i={2 + i}>
                <PanelTitle>{m.k}</PanelTitle>
                <div className="board mt-3 truncate text-3xl">{m.v}</div>
              </Panel>
            ))}

            {/* event log */}
            <Panel className="lg:col-span-12" i={6}>
              <div className="flex items-center justify-between">
                <PanelTitle>Event log</PanelTitle>
                <span className="eyebrow text-white/40">{data.events.length} events · newest first</span>
              </div>
              <ol className="mt-4 divide-y divide-white/[0.07]">
                {data.events.map((ev, i) => (
                  <motion.li
                    key={ev.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: E }}
                    className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1 py-3 sm:grid-cols-[160px_auto_1fr_auto] sm:items-center"
                  >
                    <time className="col-span-2 font-mono text-xs text-white/40 sm:col-span-1">{fmtDateTime(ev.at)}</time>
                    <span className={cn("mt-1 h-2 w-2 rounded-full sm:mt-0", i === 0 ? "bg-signal" : "bg-white/25")} />
                    <div className="min-w-0">
                      <span className={cn("board text-xl", i === 0 ? "text-signal" : "text-white")}>{SHIPMENT_STATUS_LABEL[ev.status]}</span>
                      <span className="ml-2 text-sm text-white/50">{ev.note}</span>
                    </div>
                    <span className="col-start-2 flex items-center gap-1 text-xs text-white/50 sm:col-start-auto">
                      <MapPin size={12} /> {ev.location}
                    </span>
                  </motion.li>
                ))}
              </ol>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Panel({ children, className, i }: { children: React.ReactNode; className?: string; i: number }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: E, delay: i * 0.06 } } }}
      className={cn("rounded-[14px] p-5 ring-1 sm:p-6", /\bbg-/.test(className ?? "") ? "" : "bg-white/[0.04] ring-white/10", className)}
    >
      {children}
    </motion.div>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow flex items-center gap-2 text-white/55">
      <span className="cross text-signal" /> {children}
    </div>
  );
}

function StatusPill({ status }: { status: Shipment["status"] }) {
  return (
    <span
      className={cn(
        "board inline-flex items-center gap-2 rounded-md px-3 py-1 text-lg",
        status === "delivered" ? "bg-white text-ink" : status === "exception" ? "bg-red-500 text-white" : "bg-signal text-ink",
      )}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      {SHIPMENT_STATUS_LABEL[status]}
    </span>
  );
}

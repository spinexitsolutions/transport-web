"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, Zap } from "lucide-react";
import { CITY_DISTANCE, cn, distanceKm, estimatePrice, inr } from "@/lib/utils";
import { Counter } from "@/components/ui/Counter";

type Svc = { title: string; startingPrice: number };

const CITIES = Object.keys(CITY_DISTANCE);

export function QuoteForm({ services, dark }: { services: Svc[]; dark?: boolean }) {
  const list = services.length ? services : [{ title: "Road Freight", startingPrice: 9 }];
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [service, setService] = useState(list[0].title);
  const [origin, setOrigin] = useState("Mumbai");
  const [destination, setDestination] = useState("Delhi NCR");
  const [weight, setWeight] = useState(500);
  const [express, setExpress] = useState(false);
  const [insurance, setInsurance] = useState(true);
  const [contact, setContact] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refId, setRefId] = useState("");

  const svc = list.find((s) => s.title === service) ?? list[0];
  const km = useMemo(() => (origin === destination ? 30 : distanceKm(origin, destination)), [origin, destination]);
  const price = useMemo(
    () => estimatePrice({ ratePerKg: svc.startingPrice, weight, distanceKm: km, express, insurance }),
    [svc.startingPrice, weight, km, express, insurance],
  );

  const t = dark
    ? {
        panel: "bg-white/[0.04] ring-1 ring-white/10 text-white",
        sub: "text-white/55",
        chip: "bg-white/5 text-white/80 ring-white/10 hover:bg-white/10",
        chipOn: "bg-white text-ink ring-white",
        field: "bg-white/5 border-white/10 text-white placeholder:text-white/35 focus:border-white [&>option]:text-ink",
        summary: "bg-white text-ink",
        line: "border-white/10",
      }
    : {
        panel: "bg-white ring-1 ring-line text-ink shadow-[0_30px_80px_-40px_rgba(0,0,0,.25)]",
        sub: "text-muted",
        chip: "bg-bone text-ink/80 ring-line hover:bg-bone-2",
        chipOn: "bg-ink text-white ring-ink",
        field: "bg-bone/60 border-line text-ink placeholder:text-ink/35 focus:border-ink",
        summary: "bg-ink text-white",
        line: "border-line",
      };

  const fieldCls = cn(
    "w-full rounded-2xl border px-4 py-3.5 text-[15px] outline-none transition-colors",
    t.field,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.name || !(contact.email || contact.phone)) {
      setError("Please add your name and an email or phone number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "quote",
          ...contact,
          service,
          origin,
          destination,
          weight,
          estimate: price.total,
          message:
            contact.message ||
            `Instant quote: ${service}, ${origin} → ${destination}, ${weight} kg${express ? ", express" : ""}${insurance ? ", insured" : ""}.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setRefId(data.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const slide = {
    initial: { opacity: 0, x: 30, filter: "blur(6px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -30, filter: "blur(6px)" },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <div className={cn("overflow-hidden rounded-[20px] p-4 sm:p-6 lg:p-8", t.panel)}>
      {/* stepper */}
      <div className="mb-6 flex items-center gap-2">
        {["Shipment", "Details", "Done"].map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div className={cn("h-1 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-ink/10")}>
              <motion.div
                className="h-full bg-accent"
                initial={false}
                animate={{ width: step >= i ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className={cn("eyebrow !text-[0.62rem]", step >= i ? "" : t.sub)}>
              0{i + 1} · {label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <motion.div key="s0" {...slide} className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
            <div className="space-y-6">
              <fieldset>
                <legend className={cn("mb-3 text-sm", t.sub)}>Service</legend>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => setService(s.title)}
                      aria-pressed={service === s.title}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm ring-1 ring-inset transition-all active:scale-95",
                        service === s.title ? t.chipOn : t.chip,
                      )}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                <label className="block">
                  <span className={cn("mb-2 block text-sm", t.sub)}>From</span>
                  <select className={fieldCls} value={origin} onChange={(e) => setOrigin(e.target.value)}>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={cn("mb-2 block text-sm", t.sub)}>To</span>
                  <select className={fieldCls} value={destination} onChange={(e) => setDestination(e.target.value)}>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-end justify-between gap-3">
                  <label htmlFor="q-weight" className={cn("text-sm", t.sub)}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={weight}
                    aria-label="Weight in kilograms"
                    onChange={(e) => setWeight(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))}
                    className={cn("w-28 rounded-xl border px-3 py-1.5 text-right font-mono text-sm outline-none", t.field)}
                  />
                </div>
                <input
                  id="q-weight"
                  type="range"
                  min={1}
                  max={25000}
                  step={1}
                  value={Math.min(weight, 25000)}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                <Toggle dark={dark} on={express} set={setExpress} icon={<Zap size={16} />} title="Express" text="+35% · priority lane" />
                <Toggle dark={dark} on={insurance} set={setInsurance} icon={<ShieldCheck size={16} />} title="Insurance" text="1.8% all-risk cover" />
              </div>
            </div>

            {/* live summary */}
            <div className={cn("flex flex-col justify-between rounded-3xl p-5 sm:p-6", t.summary)}>
              <div>
                <div className="eyebrow opacity-60">Estimated total</div>
                <motion.div key={price.total} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="display mt-3 text-[clamp(2.25rem,6vw,3.25rem)]">
                  {inr(price.total)}
                </motion.div>
                <div className="mt-1 text-sm opacity-60">incl. 18% GST · {km.toLocaleString("en-IN")} km</div>

                <dl className="mt-6 space-y-2.5 text-sm">
                  <Row k="Base freight" v={inr(price.base)} />
                  <Row k="Distance & handling" v={inr(price.subtotal - price.base)} />
                  <Row k="GST (18%)" v={inr(price.gst)} />
                </dl>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent font-medium text-accent-ink transition-transform active:scale-[0.98]"
              >
                Lock this rate
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.form key="s1" {...slide} onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Full name", "text", "name"],
                  ["company", "Company", "text", "organization"],
                  ["email", "Work email", "email", "email"],
                  ["phone", "Phone", "tel", "tel"],
                ] as const
              ).map(([k, label, type, ac]) => (
                <label key={k} className="block">
                  <span className={cn("mb-2 block text-sm", t.sub)}>{label}</span>
                  <input
                    type={type}
                    autoComplete={ac}
                    value={contact[k]}
                    onChange={(e) => setContact({ ...contact, [k]: e.target.value })}
                    className={fieldCls}
                    required={k === "name"}
                  />
                </label>
              ))}
              <label className="block sm:col-span-2">
                <span className={cn("mb-2 block text-sm", t.sub)}>Anything we should know? (optional)</span>
                <textarea
                  rows={3}
                  value={contact.message}
                  onChange={(e) => setContact({ ...contact, message: e.target.value })}
                  className={cn(fieldCls, "resize-none")}
                />
              </label>
              {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
            </div>

            <div className={cn("flex flex-col justify-between gap-6 rounded-3xl p-5 sm:p-6", t.summary)}>
              <div className="space-y-2.5 text-sm">
                <div className="eyebrow opacity-60">Your shipment</div>
                <Row k="Service" v={service} />
                <Row k="Route" v={`${origin} → ${destination}`} />
                <Row k="Weight" v={`${weight.toLocaleString("en-IN")} kg`} />
                <Row k="Options" v={[express && "Express", insurance && "Insured"].filter(Boolean).join(", ") || "Standard"} />
                <div className="!mt-4 flex items-baseline justify-between border-t border-current/15 pt-4">
                  <span className="opacity-60">Estimate</span>
                  <span className="display text-2xl">{inr(price.total)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  aria-label="Back"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full ring-1 ring-current/20 transition-colors hover:bg-current/5"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent font-medium text-accent-ink transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : null}
                  {loading ? "Sending…" : "Request booking"}
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div key="s2" {...slide} className="flex flex-col items-center py-8 text-center sm:py-12">
            <motion.div
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="grid h-20 w-20 place-items-center rounded-full bg-accent text-accent-ink"
            >
              <Check size={36} strokeWidth={2.5} />
            </motion.div>
            <h3 className="display mt-6 text-3xl sm:text-4xl">
              Rate locked, <span className="hl-soft">{contact.name.split(" ")[0] || "friend"}.</span>
            </h3>
            <p className={cn("mt-3 max-w-md", t.sub)}>
              A logistics specialist will confirm your booking within 30 minutes. Your estimate of{" "}
              <strong className={dark ? "text-white" : "text-ink"}>
                <Counter value={price.total} prefix="₹" />
              </strong>{" "}
              is held for 48 hours.
            </p>
            <div className={cn("mt-6 rounded-full px-5 py-2.5 font-mono text-sm ring-1", dark ? "ring-white/15" : "ring-line")}>
              Reference · {refId}
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setRefId("");
              }}
              className={cn("mt-6 text-sm underline underline-offset-4", t.sub)}
            >
              Get another quote
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="opacity-60">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Toggle({
  on,
  set,
  icon,
  title,
  text,
  dark,
}: {
  on: boolean;
  set: (v: boolean) => void;
  icon: React.ReactNode;
  title: string;
  text: string;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => set(!on)}
      className={cn(
        "flex items-center gap-3 rounded-2xl p-3.5 text-left ring-1 ring-inset transition-colors",
        dark ? "ring-white/10 hover:bg-white/5" : "ring-line hover:bg-bone/70",
        on && (dark ? "bg-white/10" : "bg-bone"),
      )}
    >
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", on ? "bg-accent text-accent-ink" : dark ? "bg-white/10" : "bg-ink/5")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className={cn("block truncate text-xs", dark ? "text-white/50" : "text-muted")}>{text}</span>
      </span>
      <span className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors", on ? "bg-accent" : dark ? "bg-white/15" : "bg-ink/15")}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow", on ? "right-0.5" : "left-0.5")}
        />
      </span>
    </button>
  );
}

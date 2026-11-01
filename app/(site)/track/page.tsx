import type { Metadata } from "next";
import { Bell, Radar, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { TrackWidget } from "@/components/site/TrackWidget";
import { LiveClock } from "@/components/pages/inner1/LiveClock";

export const metadata: Metadata = { title: "Track shipment" };

const SYSTEMS = [
  { k: "GPS uplink", v: "Nominal" },
  { k: "Carrier feeds", v: "62 / 62" },
  { k: "Scan events / min", v: "3,214" },
];

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <>
      {/* ── control tower console ── */}
      <section data-nav-label="Console" className="on-dark relative overflow-hidden bg-night pb-16 pt-6 text-white sm:pb-24 sm:pt-10 lg:pt-24">
        <div className="noise absolute inset-0" />
        {/* radar sweep */}
        <div aria-hidden className="pointer-events-none absolute -right-48 -top-48 h-[640px] w-[640px] rounded-full border border-white/[0.06] opacity-70 sm:-right-24">
          <div className="absolute inset-16 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-32 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(212,255,63,.18)_40deg,transparent_60deg)]" />
        </div>

        <div className="wrap relative">
          {/* console header */}
          <div className="grid grid-cols-2 border-y border-white/10 sm:grid-cols-4">
            <div className="py-3 pr-3">
              <div className="eyebrow text-white/40">Station</div>
              <div className="board text-xl">BOM · Control tower</div>
            </div>
            <div className="border-l border-white/10 py-3 pl-3">
              <div className="eyebrow text-white/40">IST</div>
              <LiveClock className="board text-xl tabular-nums" />
            </div>
            {SYSTEMS.slice(0, 2).map((s) => (
              <div key={s.k} className="hidden border-l border-white/10 py-3 pl-3 sm:block">
                <div className="eyebrow text-white/40">{s.k}</div>
                <div className="board flex items-center gap-2 text-xl text-signal">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> {s.v}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-6 lg:mt-14 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="board text-[clamp(4.2rem,17vw,13rem)] leading-[0.8]">
              <SplitWords text="Track &" animateOnMount />
              <br />
              <SplitWords text="Trace" wordClassName="text-signal" animateOnMount delay={0.2} />
            </h1>
            <p className="max-w-sm text-white/60 lg:pb-3">
              Type a Kinetik tracking ID and hit run. Every GPS ping, terminal scan and airline update lands here within a minute.
            </p>
          </div>

          <div className="mt-10">
            <TrackWidget initialId={id} />
          </div>
        </div>
      </section>

      {/* ── capabilities strip ── */}
      <section data-nav-label="How tracking works" className="wrap py-16 sm:py-24">
        <div className="grid border-t border-ink sm:grid-cols-3">
          {[
            { icon: Radar, t: "Minute-level updates", d: "GPS and scan events stream straight from trucks, terminals and airlines." },
            { icon: Bell, t: "Proactive alerts", d: "WhatsApp & email nudges the moment anything changes — before you have to ask." },
            { icon: ShieldCheck, t: "Proof of delivery", d: "OTP-verified handovers with photo e-POD, available instantly." },
          ].map(({ icon: I, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08} className={`border-b border-line py-8 sm:border-b-0 sm:px-6 sm:py-10 ${i > 0 ? "sm:border-l" : "sm:pl-0"}`}>
              <div className="flex items-center justify-between">
                <span className="board text-5xl text-accent">0{i + 1}</span>
                <I size={22} />
              </div>
              <h3 className="display mt-6 text-2xl">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

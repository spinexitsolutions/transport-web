import type { Metadata } from "next";
import { Bell, Radar, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { TrackWidget } from "@/components/site/TrackWidget";

export const metadata: Metadata = { title: "Track shipment" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <>
      <PageHero label="Live tracking" title="Where's my" accent="shipment?" subtitle="Enter your Kinetik tracking ID for live milestones, location and ETA — updated by our control tower every minute." />
      <section className="wrap pb-20">
        <div className="max-w-5xl">
          <TrackWidget initialId={id} />
        </div>
      </section>
      <section className="wrap grid gap-4 pb-28 sm:grid-cols-3">
        {[
          { icon: Radar, t: "Minute-level updates", d: "GPS and scan events stream straight from trucks, terminals and airlines." },
          { icon: Bell, t: "Proactive alerts", d: "WhatsApp & email nudges the moment anything changes — before you have to ask." },
          { icon: ShieldCheck, t: "Proof of delivery", d: "OTP-verified handovers with photo e-POD, available instantly." },
        ].map(({ icon: I, t, d }, i) => (
          <Reveal key={t} delay={i * 0.08} className="rounded-[20px] bg-white p-6 ring-1 ring-line">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-bone">
              <I size={20} />
            </span>
            <h3 className="mt-6 text-xl font-medium tracking-tight">{t}</h3>
            <p className="mt-2 text-muted">{d}</p>
          </Reveal>
        ))}
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { BadgeCheck, Clock, Headphones, Lock } from "lucide-react";
import { get } from "@/lib/db";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { QuoteForm } from "@/components/site/QuoteForm";

export const metadata: Metadata = { title: "Instant quote" };

export default async function QuotePage() {
  const [services, testimonials] = await Promise.all([get("services"), get("testimonials")]);
  const t = testimonials.find((x) => x.published);
  return (
    <>
      <PageHero label="Instant quote" title="Transparent rates," accent="instantly." subtitle="No hidden surcharges, no week-long email chains. Configure your shipment and lock the rate in under two minutes." />
      <section className="wrap grid gap-10 pb-28 lg:grid-cols-[1fr_320px] lg:gap-14">
        <Reveal>
          <QuoteForm services={services.filter((s) => s.published && (s.priceUnit || "kg") === "kg").map((s) => ({ title: s.title, startingPrice: s.startingPrice }))} />
        </Reveal>
        <aside className="space-y-6">
          {[
            { icon: Clock, t: "30-minute confirmation", d: "A specialist confirms capacity and pickup slot." },
            { icon: Lock, t: "Rate held for 48 hours", d: "Your estimate is locked while you decide." },
            { icon: BadgeCheck, t: "All-inclusive pricing", d: "Fuel, tolls and handling — already in." },
            { icon: Headphones, t: "Dedicated support", d: "One human, from pickup to proof of delivery." },
          ].map(({ icon: I, t: title, d }, i) => (
            <Reveal key={title} delay={i * 0.06} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-line">
                <I size={19} />
              </span>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted">{d}</p>
              </div>
            </Reveal>
          ))}
          {t && (
            <Reveal delay={0.3} className="rounded-[28px] bg-ink p-6 text-white">
              <p className="serif text-2xl leading-snug">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="text-sm">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-white/55">{t.role}, {t.company}</div>
                </div>
              </div>
            </Reveal>
          )}
        </aside>
      </section>
    </>
  );
}

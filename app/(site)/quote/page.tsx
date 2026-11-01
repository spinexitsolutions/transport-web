import type { Metadata } from "next";
import { BadgeCheck, Clock, Headphones, Lock } from "lucide-react";
import { get } from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Stamp } from "@/components/pages/inner1/Stamp";

export const metadata: Metadata = { title: "Instant quote" };

const TRUST = [
  { icon: Clock, t: "30-min", s: "confirmation", d: "A specialist confirms capacity and pickup slot." },
  { icon: Lock, t: "48-hr", s: "rate hold", d: "Your estimate is locked while you decide." },
  { icon: BadgeCheck, t: "All-in", s: "pricing", d: "Fuel, tolls and handling — already in." },
  { icon: Headphones, t: "1 human", s: "support", d: "One person, from pickup to proof of delivery." },
];

export default async function QuotePage() {
  const [services, testimonials] = await Promise.all([get("services"), get("testimonials")]);
  const t = testimonials.find((x) => x.published);
  const kgServices = services.filter((s) => s.published && (s.priceUnit || "kg") === "kg");

  return (
    <>
      <section data-nav-label="Rate card" className="wrap relative pb-20 pt-10 sm:pt-16 lg:pb-28 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* left: pitch */}
          <div className="lg:col-span-5 lg:pt-6">
            <div className="flex items-center gap-3">
              <span className="eyebrow rounded-sm bg-ink px-2 py-1 text-white">Instant quote</span>
              <span className="eyebrow text-muted">GST incl. · no hidden surcharges</span>
            </div>
            <h1 className="display mt-6 text-[clamp(2.8rem,7.4vw,6.4rem)]">
              <SplitWords text="Price it" animateOnMount />
              <br />
              <SplitWords text="before" animateOnMount delay={0.12} />{" "}
              <SplitWords text="you" wordClassName="hl" animateOnMount delay={0.2} />
              <br />
              <SplitWords text="ship it." wordClassName="hl" animateOnMount delay={0.28} />
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              Pick a mode, a lane and a weight. The rate card on the right prints your all-inclusive price as you type — lock it in two taps.
            </p>

            {/* big rate teaser */}
            <div className="mt-10 grid grid-cols-3 border-y border-ink">
              {kgServices.slice(0, 3).map((s, i) => (
                <div key={s.id} className={`py-4 ${i > 0 ? "border-l border-line pl-4" : ""}`}>
                  <div className="eyebrow truncate text-muted">{s.title}</div>
                  <div className="board mt-1 text-4xl">
                    ₹{s.startingPrice}
                    <span className="ml-1 text-base text-muted">/kg</span>
                  </div>
                </div>
              ))}
            </div>

            {/* stamps */}
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2">
              {TRUST.map(({ icon: I, t: big, s, d }, i) => (
                <Reveal key={big} delay={i * 0.06}>
                  <Stamp icon={<I size={18} />} big={big} small={s} rotate={[-6, 4, -3, 7][i]} tone={i % 2 ? "ink" : "accent"} />
                  <p className="mt-3 text-sm text-muted">{d}</p>
                </Reveal>
              ))}
            </div>
          </div>

          {/* right: the receipt */}
          <div className="lg:col-span-7">
            <div className="relative lg:sticky lg:top-24">
              {/* receipt printer slot */}
              <div aria-hidden className="mx-auto hidden h-3 w-[104%] -translate-x-[2%] rounded-full bg-ink lg:block" />
              <Reveal y={-40} className="relative lg:-mt-1.5 lg:px-4">
                <QuoteForm services={kgServices.map((s) => ({ title: s.title, startingPrice: s.startingPrice }))} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── testimonial band ── */}
      {t && (
        <section data-nav-label="What shippers say" className="bg-signal">
          <div className="wrap grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-12">
            <div className="board text-[clamp(6rem,18vw,14rem)] leading-[0.7] lg:col-span-3">&ldquo;</div>
            <Reveal className="lg:col-span-9">
              <p className="display text-[clamp(1.6rem,3.6vw,3rem)] [font-stretch:100%]">{t.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-ink" />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-ink/60">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}

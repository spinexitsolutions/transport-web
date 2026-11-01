import type { Service } from "@/lib/types";
import { QuoteForm } from "@/components/site/QuoteForm";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

export function QuoteSection({ services }: { services: Service[] }) {
  return (
    <section data-nav-label="Instant quote" className="relative overflow-hidden bg-night py-20 text-white sm:py-28">
      <div className="noise absolute inset-0" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/50 blur-[120px]" />
      <div className="wrap relative grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionLabel index="08" dark>
            Instant quote
          </SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.6rem,6.5vw,5.5rem)]">
            <SplitWords text="Price it in" /> <SplitWords text="seconds." wordClassName="hl" delay={0.15} />
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
            Transparent, all-inclusive rates. No hidden surcharges, no &ldquo;we&apos;ll get back to you&rdquo;. Book in one tap and a specialist confirms within 30 minutes.
          </p>
          <ul className="mt-8 space-y-3 text-white/75">
            {["GST-inclusive breakdown", "Free pickup in 180+ cities", "Insurance in one click"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <QuoteForm services={services.filter((s) => (s.priceUnit || "kg") === "kg").map((s) => ({ title: s.title, startingPrice: s.startingPrice }))} dark />
        </div>
      </div>
    </section>
  );
}

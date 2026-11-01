import type { Service } from "@/lib/types";
import { QuoteForm } from "@/components/site/QuoteForm";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";

// zig-zag "torn receipt" edge (vertical on desktop, horizontal on mobile)
const ZIG_V = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='20'%3E%3Cpath d='M0 0 L16 10 L0 20 Z' fill='black'/%3E%3C/svg%3E\")";
const ZIG_H = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='14'%3E%3Cpath d='M0 0 L10 14 L20 0 Z' fill='black'/%3E%3C/svg%3E\")";

/** Split colour block: ultramarine pitch on the left, the calculator on ink on the right. */
export function QuoteSection({ services }: { services: Service[] }) {
  const list = services.filter((s) => (s.priceUnit || "kg") === "kg").map((s) => ({ title: s.title, startingPrice: s.startingPrice }));
  return (
    <section data-nav-label="Instant quote" className="relative grid lg:grid-cols-12">
      {/* left — pitch */}
      <div className="relative z-10 bg-accent px-4 pb-16 pt-20 text-accent-ink sm:px-6 sm:pt-28 lg:col-span-5 lg:px-10 lg:pb-28">
        <div className="lg:sticky lg:top-24">
          <SectionLabel index="08" dark>
            Instant quote
          </SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.6rem,6vw,5.2rem)]">
            <SplitWords text="Price it in" /> <SplitWords text="seconds." wordClassName="hl" delay={0.15} />
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
            Transparent, all-inclusive rates. No hidden surcharges. Book in one tap and a specialist confirms within 30 minutes.
          </p>
          <ul className="mt-10 border-t border-white/20">
            {[
              ["01", "GST-inclusive breakdown"],
              ["02", "Free pickup in 180+ cities"],
              ["03", "Insurance in one click"],
            ].map(([n, t]) => (
              <li key={n} className="flex items-baseline gap-4 border-b border-white/20 py-3">
                <span className="board text-2xl text-signal">{n}</span>
                <span className="text-white/90">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* torn edge */}
        <div aria-hidden className="absolute -right-4 top-0 hidden h-full w-4 bg-accent lg:block" style={{ maskImage: ZIG_V, WebkitMaskImage: ZIG_V, maskSize: "16px 20px", WebkitMaskSize: "16px 20px" }} />
        <div aria-hidden className="absolute -bottom-3.5 left-0 h-3.5 w-full bg-accent lg:hidden" style={{ maskImage: ZIG_H, WebkitMaskImage: ZIG_H, maskSize: "20px 14px", WebkitMaskSize: "20px 14px" }} />
      </div>

      {/* right — calculator */}
      <div className="relative overflow-hidden bg-ink px-4 pb-20 pt-16 sm:px-6 lg:col-span-7 lg:px-12 lg:pt-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-accent/40 blur-[120px]" />
        <div className="relative">
          <div className="mb-6 flex items-center justify-between text-white/50">
            <span className="eyebrow">Rate card · live</span>
            <span className="barcode h-6 w-24 text-white/40" />
          </div>
          <QuoteForm services={list} dark />
        </div>
      </div>
    </section>
  );
}

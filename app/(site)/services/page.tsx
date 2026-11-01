import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { get } from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { SplitWords } from "@/components/ui/SplitWords";
import { ImageReveal } from "@/components/pages/ImageReveal";
import { TransitMap } from "@/components/pages/inner1/TransitMap";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Services" };

const TONES = [
  { bg: "bg-bone", text: "text-ink", sub: "text-muted", line: "border-line", chip: "bg-white ring-line" },
  { bg: "bg-tint", text: "text-ink", sub: "text-ink/60", line: "border-ink/15", chip: "bg-white/70 ring-ink/10" },
  { bg: "bg-ink", text: "text-white", sub: "text-white/55", line: "border-white/15", chip: "bg-white/10 ring-white/10" },
];

export default async function ServicesPage() {
  const services = (await get("services")).filter((s) => s.published);
  const count = String(services.length).padStart(2, "0");

  return (
    <>
      {/* ── hero: mode selector ── */}
      <section data-nav-label="Modes" className="relative overflow-hidden bg-ink pb-14 pt-8 text-white sm:pb-20 sm:pt-14 lg:pt-24">
        <div className="noise absolute inset-0" />
        <div className="wrap relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="eyebrow flex items-center gap-3 text-white/60">
              <span className="cross text-signal" /> Services · network map
            </span>
            <span className="barcode h-6 w-24 text-white/60" aria-hidden />
          </div>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-12">
            <h1 className="lg:col-span-8">
              <span className="board block text-[clamp(7rem,30vw,20rem)] leading-[0.78] text-signal">
                <SplitWords text={count} animateOnMount />
              </span>
              <span className="display mt-2 block text-[clamp(2.4rem,7vw,5.6rem)]">
                <SplitWords text="modes. One" animateOnMount delay={0.15} /> <SplitWords text="network." wordClassName="hl" animateOnMount delay={0.3} />
              </span>
            </h1>
            <p className="max-w-sm text-white/60 lg:col-span-4 lg:pb-4">
              Road, air, ocean, rail, warehousing and the last mile — each one a station on the same line, priced transparently and tracked to the minute. Pick a stop.
            </p>
          </div>

          <div className="mt-14">
            <TransitMap stations={services.map((s) => ({ slug: s.slug, title: s.title, icon: s.icon, transitTime: s.transitTime }))} />
          </div>
        </div>
      </section>

      {/* ── one band per service ── */}
      {services.map((s, i) => {
        const t = TONES[i % TONES.length];
        const flip = i % 2 === 1;
        return (
          <section key={s.id} id={`svc-${s.slug}`} data-nav-label={s.title} className={cn("relative scroll-mt-4", t.bg, t.text)}>
            <div className="wrap grid gap-8 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-24">
              <div className={cn("lg:col-span-6", flip && "lg:order-2")}>
                <ImageReveal src={s.image} alt={s.title} className="aspect-[4/3] rounded-[16px] lg:aspect-[5/4]" />
              </div>

              <Reveal className={cn("flex flex-col lg:col-span-6", flip && "lg:order-1")}>
                {/* spec header */}
                <div className={cn("flex items-center justify-between border-b pb-3", t.line)}>
                  <span className="flex items-center gap-3">
                    <span className="board text-4xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("eyebrow", t.sub)}>Station · SVC-{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-ink">
                    <Icon name={s.icon} size={20} />
                  </span>
                </div>

                <h2 className="display mt-6 text-[clamp(2.4rem,5vw,4.4rem)]">{s.title}</h2>
                <p className={cn("mt-4 max-w-lg text-lg", t.sub)}>{s.description}</p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {s.features.map((f) => (
                    <li key={f} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ring-1", t.chip)}>
                      <Check size={13} className="text-accent" /> {f}
                    </li>
                  ))}
                </ul>

                {/* spec table */}
                <dl className={cn("mt-8 grid grid-cols-2 border-y", t.line)}>
                  <div className="py-4 pr-4">
                    <dt className={cn("eyebrow", t.sub)}>Transit</dt>
                    <dd className="board mt-1 text-3xl sm:text-4xl">{s.transitTime}</dd>
                  </div>
                  <div className={cn("border-l py-4 pl-4", t.line)}>
                    <dt className={cn("eyebrow", t.sub)}>From</dt>
                    <dd className="board mt-1 text-3xl sm:text-4xl">
                      ₹{s.startingPrice.toLocaleString("en-IN")}
                      <span className={cn("ml-1 text-base", t.sub)}>/{s.priceUnit || "kg"}</span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/services/${s.slug}`}
                    className="group inline-flex h-12 items-center gap-3 rounded-full bg-accent pl-6 pr-1.5 font-medium text-accent-ink"
                  >
                    Explore {s.title}
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-signal text-ink transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                  <Link href="/quote" className={cn("inline-flex h-12 items-center rounded-full px-6 font-medium ring-1", t.line, i % 3 === 2 ? "ring-white/25" : "ring-ink/20")}>
                    Get a rate
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* ── end of line ── */}
      <section data-nav-label="End of line" className="bg-signal">
        <div className="wrap flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-20">
          <h2 className="board text-[clamp(3.4rem,9vw,7rem)] leading-[0.85]">
            Not sure which mode?
            <br />
            <span className="text-accent">We&apos;ll route it.</span>
          </h2>
          <Link href="/contact" className="group inline-flex h-14 items-center gap-3 self-start rounded-full bg-ink pl-7 pr-2 font-medium text-white sm:self-auto">
            Talk to a planner
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight size={18} />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}

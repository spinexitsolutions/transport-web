import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { get } from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { Icon } from "@/components/ui/Icon";
import { QuoteForm } from "@/components/site/QuoteForm";
import { ImageReveal } from "@/components/pages/ImageReveal";

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  const services = await get("services");
  const s = services.find((x) => x.slug === slug && x.published);
  return { s, services: services.filter((x) => x.published) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { s } = await find((await params).slug);
  if (!s) return { title: "Service not found" };
  return { title: s.title, description: s.short, openGraph: { images: [s.image] } };
}

export default async function ServicePage({ params }: Props) {
  const { s, services } = await find((await params).slug);
  if (!s) notFound();
  const code = `SVC-${String(services.findIndex((x) => x.id === s.id) + 1).padStart(2, "0")}`;
  const others = services.filter((x) => x.id !== s.id).slice(0, 4);
  // Put the current service first so the quote form preselects it
  const quoteServices = [s, ...services.filter((x) => x.id !== s.id)]
    .filter((x) => (x.priceUnit || "kg") === "kg")
    .map((x) => ({ title: x.title, startingPrice: x.startingPrice }));

  const specs = [
    { k: "Transit time", v: s.transitTime },
    { k: "Starting at", v: `₹${s.startingPrice.toLocaleString("en-IN")}`, u: `/${s.priceUnit || "kg"}` },
    { k: "Tracking", v: "Live, 60s" },
    { k: "Support", v: "24 × 7" },
  ];

  return (
    <>
      {/* ── split hero: spec sheet + tall image ── */}
      <section data-nav-label="Spec sheet" className="wrap pb-16 pt-8 sm:pt-14 lg:pb-24 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between">
              <Link href="/services" className="eyebrow inline-flex items-center gap-2 text-muted transition-colors hover:text-ink">
                <ArrowLeft size={13} /> All services
              </Link>
              <span className="board rounded-sm bg-ink px-2 py-0.5 text-lg text-signal">{code}</span>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-accent text-accent-ink">
                <Icon name={s.icon} size={22} />
              </span>
              <span className="eyebrow text-muted">Service specification</span>
            </div>
            <h1 className="display mt-5 text-[clamp(3rem,9vw,7.2rem)]">
              <SplitWords text={s.title} animateOnMount />
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">{s.short}</p>

            {/* spec table */}
            <Reveal delay={0.2} className="mt-10">
              <dl className="border-t-2 border-ink">
                {specs.map((sp, i) => (
                  <div key={sp.k} className="grid grid-cols-[40px_1fr_auto] items-baseline gap-3 border-b border-line py-4">
                    <span className="board text-lg text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <dt className="text-[15px] text-muted">{sp.k}</dt>
                    <dd className="board text-3xl sm:text-4xl">
                      {sp.v}
                      {sp.u && <span className="ml-1 text-base text-muted">{sp.u}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between">
                <span className="barcode h-9 w-40 text-ink" aria-hidden />
                <span className="eyebrow text-muted">Rev. 2026 · Kinetik Logistics</span>
              </div>
            </Reveal>
          </div>

          <div className="relative lg:col-span-6">
            <ImageReveal src={s.image} alt={s.title} priority className="aspect-[4/5] rounded-[16px] lg:aspect-auto lg:h-[calc(100vh-8rem)] lg:min-h-[560px]" />
            {/* sticky quote card */}
            <div className="relative -mt-20 px-4 lg:absolute lg:inset-x-6 lg:bottom-6 lg:mt-0 lg:px-0">
              <div className="rounded-[14px] bg-ink p-5 text-white shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-white/50">Ready to book</span>
                  <span className="flex items-center gap-1.5 text-xs text-white/60">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> capacity open
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="board text-5xl leading-none">₹{s.startingPrice.toLocaleString("en-IN")}</div>
                    <div className="text-sm text-white/55">starting / {s.priceUnit || "kg"} · GST extra</div>
                  </div>
                  <Link href="#quote" className="group inline-flex h-12 items-center gap-3 rounded-full bg-signal pl-5 pr-1.5 font-semibold text-ink">
                    Get a quote
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── description + numbered features ── */}
      <section data-nav-label="What's included" className="bg-tint">
        <div className="wrap grid gap-10 py-16 sm:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow flex items-center gap-3 text-ink/60">
              <span className="cross text-accent" /> What&apos;s included
            </span>
            <p className="display mt-6 text-[clamp(1.6rem,3vw,2.4rem)] [font-stretch:100%]">{s.description}</p>
          </Reveal>
          <ol className="lg:col-span-7 lg:col-start-6">
            {s.features.map((f, i) => (
              <Reveal key={f} delay={i * 0.07}>
                <li className="group grid grid-cols-[auto_1fr] items-center gap-6 border-b border-ink/15 py-6 first:border-t">
                  <span className="board text-[clamp(3.5rem,8vw,6rem)] leading-none text-accent transition-transform duration-500 group-hover:-translate-y-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[clamp(1.4rem,3vw,2.4rem)] [font-stretch:100%]">{f}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── quote ── */}
      <section id="quote" data-nav-label="Quote" className="relative scroll-mt-6 overflow-hidden bg-night py-16 text-white sm:py-24">
        <div className="noise absolute inset-0" />
        <div className="wrap relative">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display max-w-3xl text-[clamp(2.2rem,5.6vw,4.4rem)]">
              Price your <span className="hl">{s.title.toLowerCase()}</span> in seconds.
            </h2>
            <span className="board text-2xl text-white/40">{code} · rate engine</span>
          </div>
          <div className="mt-10">
            <QuoteForm services={quoteServices} dark />
          </div>
        </div>
      </section>

      {/* ── pairs well with ── */}
      <section data-nav-label="Pairs well with" className="py-16 sm:py-24">
        <div className="wrap flex items-end justify-between gap-6">
          <h2 className="board text-[clamp(3rem,8vw,6rem)] leading-[0.85]">Pairs well with</h2>
          <Link href="/services" className="eyebrow hidden text-muted hover:text-ink sm:block">
            View all →
          </Link>
        </div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:px-6 lg:px-10">
          {others.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.06} className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw]">
              <Link href={`/services/${o.slug}`} className="group block">
                <div className="relative aspect-[16/11] overflow-hidden rounded-[14px] bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  <span className="board absolute left-3 top-3 rounded-sm bg-signal px-2 py-0.5 text-sm text-ink">{o.transitTime}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-ink pt-3">
                  <div>
                    <h3 className="display text-2xl">{o.title}</h3>
                    <p className="mt-1 text-sm text-muted">{o.short}</p>
                  </div>
                  <ArrowUpRight className="shrink-0 transition-transform duration-500 group-hover:rotate-45" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

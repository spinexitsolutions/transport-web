import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { get } from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/SplitWords";
import { SectionLabel } from "@/components/ui/SectionLabel";
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
  const others = services.filter((x) => x.id !== s.id).slice(0, 3);
  // Put the current service first so the quote form preselects it
  const quoteServices = [s, ...services.filter((x) => x.id !== s.id)].filter((x) => (x.priceUnit || "kg") === "kg").map((x) => ({ title: x.title, startingPrice: x.startingPrice }));

  return (
    <>
      <section className="wrap pt-12 sm:pt-20 lg:pt-28">
        <Link href="/services" className="eyebrow text-muted transition-colors hover:text-ink">
          ← All services
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-ink">
            <Icon name={s.icon} size={26} />
          </span>
          <SectionLabel>{s.transitTime}</SectionLabel>
        </div>
        <h1 className="display mt-6 text-[clamp(3rem,11vw,9rem)]">
          <SplitWords text={s.title} animateOnMount />
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{s.short}</p>
      </section>

      <section className="mt-12 px-2 sm:mt-16 sm:px-4">
        <ImageReveal src={s.image} alt={s.title} priority className="aspect-[4/5] rounded-[20px] sm:aspect-[21/9] sm:rounded-[40px]" />
      </section>

      <section className="wrap grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <Reveal>
          <SectionLabel>Overview</SectionLabel>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line ring-1 ring-line">
            <div className="bg-white p-5 sm:p-6">
              <dt className="text-sm text-muted">Transit</dt>
              <dd className="display mt-2 text-2xl sm:text-3xl">{s.transitTime}</dd>
            </div>
            <div className="bg-white p-5 sm:p-6">
              <dt className="text-sm text-muted">Starting at</dt>
              <dd className="display mt-2 text-2xl sm:text-3xl">₹{s.startingPrice.toLocaleString("en-IN")}<span className="text-base text-muted">/{s.priceUnit || "kg"}</span></dd>
            </div>
            <div className="bg-white p-5 sm:p-6">
              <dt className="text-sm text-muted">Tracking</dt>
              <dd className="display mt-2 text-2xl sm:text-3xl">Live</dd>
            </div>
            <div className="bg-white p-5 sm:p-6">
              <dt className="text-sm text-muted">Support</dt>
              <dd className="display mt-2 text-2xl sm:text-3xl">24×7</dd>
            </div>
          </dl>
        </Reveal>
        <div>
          <Reveal>
            <p className="text-2xl leading-snug tracking-tight text-balance sm:text-3xl">{s.description}</p>
          </Reveal>
          <ul className="mt-10 border-t border-line">
            {s.features.map((f, i) => (
              <Reveal key={f} delay={i * 0.06}>
                <li className="flex items-center gap-4 border-b border-line py-5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white">
                    <Check size={15} />
                  </span>
                  <span className="text-lg">{f}</span>
                  <span className="ml-auto font-mono text-xs text-muted">0{i + 1}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-night py-20 text-white sm:py-28">
        <div className="wrap">
          <SectionLabel dark>Instant quote</SectionLabel>
          <h2 className="display mt-5 max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)]">
            Price your <span className="hl">{s.title.toLowerCase()}</span> in seconds.
          </h2>
          <div className="mt-10">
            <QuoteForm services={quoteServices} dark />
          </div>
        </div>
      </section>

      <section className="wrap py-20 sm:py-28">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(2rem,5vw,3.5rem)]">Pairs well with</h2>
          <Link href="/services" className="hidden text-sm text-muted underline-offset-4 hover:underline sm:block">
            View all
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {others.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.08}>
              <Link href={`/services/${o.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-ink text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-[1.2s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight">{o.title}</h3>
                    <p className="mt-1 text-sm text-white/65">{o.short}</p>
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

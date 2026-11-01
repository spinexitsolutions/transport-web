import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Clock } from "lucide-react";
import { get } from "@/lib/db";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = (await get("services")).filter((s) => s.published);
  const [first, second, ...rest] = services;

  return (
    <>
      <PageHero
        label="Services"
        title="Every mode."
        accent="One partner."
        subtitle="Road, air, ocean, rail and warehousing — designed to work as one network, priced transparently and tracked to the minute."
      />

      <section className="wrap pb-24">
        <div className="grid gap-4 lg:grid-cols-2">
          {[first, second].filter(Boolean).map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <Link href={`/services/${s.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-ink text-white sm:aspect-[16/12]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-8">
                  <span className="glass-dark grid h-12 w-12 place-items-center rounded-2xl text-signal">
                    <Icon name={s.icon} size={22} />
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:text-accent-ink">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                  <div className="eyebrow text-white/50">0{i + 1}</div>
                  <h2 className="display mt-2 text-4xl sm:text-6xl">{s.title}</h2>
                  <p className="mt-3 max-w-md text-white/70">{s.short}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm">
                    <span className="glass-dark rounded-full px-3 py-1.5">
                      <Clock size={13} className="mr-1.5 inline" />
                      {s.transitTime}
                    </span>
                    <span className="rounded-full bg-accent px-3 py-1.5 text-accent-ink">from ₹{s.startingPrice.toLocaleString("en-IN")}/{s.priceUnit || "kg"}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.08}>
              <Link href={`/services/${s.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgba(0,0,0,.35)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]" />
                  <span className="glass absolute top-4 left-4 grid h-10 w-10 place-items-center rounded-xl">
                    <Icon name={s.icon} size={18} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-medium tracking-tight">{s.title}</h3>
                    <ArrowUpRight size={20} className="mt-1 shrink-0 text-muted transition-all duration-500 group-hover:rotate-45 group-hover:text-accent" />
                  </div>
                  <p className="mt-2 text-muted">{s.short}</p>
                  <div className="mt-auto flex items-center justify-between pt-6 font-mono text-xs text-muted">
                    <span>{s.transitTime}</span>
                    <span className="text-ink">from ₹{s.startingPrice.toLocaleString("en-IN")}/{s.priceUnit || "kg"}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap pb-28">
        <Reveal className="relative overflow-hidden rounded-[20px] bg-ink px-6 py-14 text-white sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent/30 blur-[120px]" />
          <SectionLabel dark>Not sure which mode?</SectionLabel>
          <h2 className="display mt-5 max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)]">
            Tell us the cargo. We&apos;ll design the <span className="hl">route.</span>
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/quote" variant="accent">Get instant quote</Button>
            <Button href="/contact" variant="ghost" className="text-white">Talk to an expert</Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { Compass, HeartHandshake, Leaf, Zap } from "lucide-react";
import { get } from "@/lib/db";
import { img } from "@/lib/seed";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Marquee } from "@/components/ui/Marquee";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/pages/ImageReveal";

export const metadata: Metadata = { title: "About" };

const MILESTONES = [
  { y: "2012", t: "Two trucks, one promise", d: "Founded in Mumbai with two leased trucks and a promise: never miss a delivery window." },
  { y: "2015", t: "Control tower goes live", d: "We built a 24×7 command centre to watch every shipment in real time." },
  { y: "2018", t: "Air & ocean", d: "Launched international freight forwarding with in-house customs brokerage." },
  { y: "2021", t: "Smart warehousing", d: "Opened our first WMS-run Grade-A fulfilment centre in Bhiwandi." },
  { y: "2024", t: "Electric-first", d: "Crossed 1,000 EVs in the last mile across 30 cities." },
  { y: "2026", t: "40 countries", d: "A network that now spans 180+ Indian cities and 40 countries." },
];

const TEAM = [
  { name: "Riya Menon", role: "Co-founder & CEO", id: "1438761681033-6461ffad8d80" },
  { name: "Aditya Kulkarni", role: "Co-founder & COO", id: "1472099645785-5658abf4ff4e" },
  { name: "Zoya Siddiqui", role: "Head of Sustainability", id: "1494790108377-be9c29b29330" },
  { name: "Arnav Bhatt", role: "CTO", id: "1500648767791-00dcc994a43e" },
];

export default async function AboutPage() {
  const [settings, stats, hubs] = await Promise.all([get("settings"), get("stats"), get("hubs")]);
  return (
    <>
      <PageHero label={`About ${settings.brandName}`} title="We move freight." accent="Quietly. Perfectly." subtitle={`${settings.brandName} began with a simple idea: logistics should feel invisible to the people who depend on it.`} />

      <section className="px-2 sm:px-4">
        <ImageReveal src={img("1600880292203-757bb62b4baf", 2400)} alt="The Kinetik team at work" priority className="aspect-[4/5] rounded-[20px] sm:aspect-[21/9] sm:rounded-[40px]" />
      </section>

      <section className="wrap grid gap-10 py-20 sm:py-32 lg:grid-cols-[1fr_1.6fr]">
        <SectionLabel index="01">Our story</SectionLabel>
        <div className="space-y-8">
          <Reveal>
            <p className="text-[clamp(1.6rem,3.6vw,2.75rem)] leading-[1.15] tracking-tight text-balance">
              In 2012 we watched a client lose a festive season because a single truck went silent for three days. <span className="text-muted">We decided nobody should ever have to wonder where their freight is again.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-2xl text-lg text-muted">
              Today {settings.brandName} is a multimodal logistics company that combines its own fleet, warehouses and a 24×7 control tower with software we build in-house. We obsess over the boring details — paperwork, packaging, pickup windows — so our customers can obsess over their own.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink py-20 text-white sm:py-28">
        <div className="wrap grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08} className="border-t border-white/15 pt-6">
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} className="display block text-[clamp(2.75rem,7vw,5.5rem)]" />
              <p className="mt-3 text-white/55">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap py-20 sm:py-32">
        <SectionLabel index="02">What we believe</SectionLabel>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Zap, t: "Speed is a feature", d: "Every hour saved is cash freed for our customers." },
            { icon: Compass, t: "Radical visibility", d: "If we know it, you know it — in real time." },
            { icon: HeartHandshake, t: "Partners, not vendors", d: "We win when our customers' customers are happy." },
            { icon: Leaf, t: "Lighter footprint", d: "Electric-first last mile and rail-first long haul." },
          ].map(({ icon: I, t, d }, i) => (
            <Reveal key={t} delay={i * 0.07} className="group rounded-[20px] bg-white p-6 ring-1 ring-line transition-colors duration-500 hover:bg-ink hover:text-white">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-bone text-ink transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-ink">
                <I size={20} />
              </span>
              <h3 className="mt-10 text-xl font-medium tracking-tight">{t}</h3>
              <p className="mt-2 text-muted transition-colors group-hover:text-white/60">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap pb-20 sm:pb-32">
        <SectionLabel index="03">Milestones</SectionLabel>
        <ol className="mt-12 border-t border-line">
          {MILESTONES.map((m, i) => (
            <Reveal key={m.y} delay={i * 0.04}>
              <li className="group grid gap-2 border-b border-line py-8 sm:grid-cols-[1fr_2fr_2fr] sm:items-baseline sm:gap-8">
                <span className="display text-5xl text-ink/20 transition-colors duration-500 group-hover:text-accent sm:text-6xl">{m.y}</span>
                <h3 className="text-2xl font-medium tracking-tight sm:text-3xl">{m.t}</h3>
                <p className="text-muted">{m.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="wrap pb-20 sm:pb-32">
        <div className="flex items-end justify-between gap-6">
          <div>
            <SectionLabel index="04">Leadership</SectionLabel>
            <h2 className="display mt-5 text-[clamp(2.25rem,6vw,4.5rem)]">
              The people <span className="hl-soft">behind the</span> pallets.
            </h2>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {TEAM.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[16px] bg-ink/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(p.id, 800)} alt={p.name} loading="lazy" className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <h3 className="mt-4 font-medium">{p.name}</h3>
              <p className="text-sm text-muted">{p.role}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line py-10">
        <Marquee duration={50}>
          {hubs.map((h) => (
            <span key={h.id} className="flex items-center gap-6 px-6">
              <span className="display text-[clamp(2.5rem,7vw,5rem)]">{h.city}</span>
              <span className="hl-soft text-[clamp(1.5rem,4vw,2.5rem)] text-muted">{h.country}</span>
              <span className="h-3 w-3 rounded-full bg-accent" />
            </span>
          ))}
        </Marquee>
      </section>

      <section className="wrap py-20 text-center sm:py-32">
        <h2 className="display mx-auto max-w-4xl text-[clamp(2.25rem,6vw,5rem)]">
          Want to build the future of <span className="hl">freight</span> with us?
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/careers">See open roles</Button>
          <Button href="/contact" variant="ghost">Partner with us</Button>
        </div>
      </section>
    </>
  );
}

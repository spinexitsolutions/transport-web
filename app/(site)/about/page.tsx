import type { Metadata } from "next";
import { get } from "@/lib/db";
import { img } from "@/lib/seed";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { Marquee } from "@/components/ui/Marquee";
import { Button } from "@/components/ui/Button";
import { SplitWords } from "@/components/ui/SplitWords";
import { ImageReveal } from "@/components/pages/ImageReveal";
import { Odometer } from "@/components/pages/inner2/Odometer";
import { Logbook } from "@/components/pages/inner2/Logbook";
import { ValueTiles } from "@/components/pages/inner2/ValueTiles";

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

const CODE: Record<string, string> = {
  Mumbai: "BOM", Delhi: "DEL", Bengaluru: "BLR", Kolkata: "CCU", Dubai: "DXB", Singapore: "SIN",
  Rotterdam: "RTM", "New York": "JFK", Shanghai: "PVG", Nairobi: "NBO", Sydney: "SYD",
};

export default async function AboutPage() {
  const [settings, stats, hubs] = await Promise.all([get("settings"), get("stats"), get("hubs")]);
  return (
    <>
      {/* ── HERO: odometer ── */}
      <section data-nav-label="Odometer" className="relative overflow-hidden bg-accent text-accent-ink">
        <div className="noise absolute inset-0" />
        <div className="wrap relative flex min-h-[92svh] flex-col justify-between gap-10 pb-10 pt-10 sm:pt-16 lg:pt-24">
          <div className="flex items-center justify-between border-b border-white/20 pb-4">
            <span className="eyebrow flex items-center gap-3 text-white/75">
              <span className="cross text-signal" /> About {settings.brandName} · odometer
            </span>
            <span className="barcode hidden h-6 w-28 text-white/70 sm:block" />
          </div>

          <div>
            <div className="eyebrow text-white/60">Kilometres since</div>
            <div className="board mt-3 flex flex-wrap items-center gap-x-[0.15em] text-[clamp(5.5rem,24vw,22rem)] leading-[0.82]">
              <span className="text-white/35">2012</span>
              <span className="text-signal">→</span>
              <Odometer from={2012} to={2026} className="text-white" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 className="display text-[clamp(2.4rem,6.4vw,5.6rem)] lg:col-span-8">
              <SplitWords text="We move freight." animateOnMount />{" "}
              <SplitWords text="Quietly. Perfectly." wordClassName="hl" animateOnMount delay={0.2} />
            </h1>
            <p className="max-w-md text-lg text-white/75 lg:col-span-4">
              {settings.brandName} began with a simple idea: logistics should feel invisible to the people who depend on it.
            </p>
          </div>
        </div>
      </section>

      {/* ── story: big statement over image ── */}
      <section data-nav-label="Our story" className="wrap grid gap-8 py-16 sm:py-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <ImageReveal src={img("1600880292203-757bb62b4baf", 1600)} alt="The Kinetik team at work" priority className="aspect-[4/5] rounded-[18px]" />
        </div>
        <div className="flex flex-col justify-between gap-10 lg:col-span-7">
          <Reveal>
            <span className="board text-[clamp(4rem,10vw,8rem)] text-accent">“</span>
            <p className="-mt-8 text-[clamp(1.6rem,3.4vw,2.7rem)] font-medium leading-[1.15] tracking-tight">
              In 2012 we watched a client lose a festive season because a single truck went silent for three days.{" "}
              <span className="text-muted">We decided nobody should ever have to wonder where their freight is again.</span>
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8">
            {stats.map((s) => (
              <div key={s.id}>
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} className="board block text-[clamp(3rem,7vw,5rem)]" />
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── logbook ── */}
      <section data-nav-label="Logbook" className="border-y border-line bg-bone">
        <Logbook items={MILESTONES} />
      </section>

      {/* ── values ── */}
      <section data-nav-label="What we believe" className="bg-signal py-16 text-ink sm:py-24">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <h2 className="display text-[clamp(2.4rem,6vw,5rem)]">
              Four rules <br className="hidden sm:block" />
              we don&apos;t bend.
            </h2>
            <p className="max-w-xs text-ink/70">Written on the wall of our control tower — and on every SOP we ship.</p>
          </div>
          <div className="mt-10">
            <ValueTiles />
          </div>
        </div>
      </section>

      {/* ── leadership strip ── */}
      <section data-nav-label="Leadership" className="bg-night py-16 text-white sm:py-24">
        <div className="wrap">
          <div className="eyebrow flex items-center gap-3 text-white/60">
            <span className="cross text-signal" /> Crew manifest
          </div>
          <h2 className="display mt-4 text-[clamp(2.2rem,5.5vw,4.4rem)]">
            The people behind <span className="hl">the pallets.</span>
          </h2>
        </div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 sm:px-6 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-10">
          {TEAM.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08} className="group w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-auto">
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(p.id, 800)} alt={p.name} loading="lazy" className="h-full w-full object-cover grayscale contrast-125 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent" />
                <span className="board absolute right-3 top-3 text-xl text-white/60">CREW 0{i + 1}</span>
                <div className="absolute inset-x-4 bottom-4">
                  <h3 className="board text-[clamp(2.2rem,4vw,3.2rem)] leading-[0.9]">{p.name}</h3>
                  <p className="mt-1 text-sm text-signal">{p.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── hubs marquee ── */}
      <section data-nav-label="Hubs" className="overflow-hidden bg-ink py-8 text-white">
        <Marquee duration={40}>
          {hubs.map((h) => (
            <span key={h.id} className="flex items-center gap-4 px-6 sm:px-10">
              <span className="board text-[clamp(4rem,10vw,7.5rem)] text-signal">{CODE[h.city] ?? h.city.slice(0, 3).toUpperCase()}</span>
              <span className="flex flex-col">
                <span className="text-lg font-medium">{h.city}</span>
                <span className="eyebrow text-white/50">{h.country}</span>
              </span>
              <span className="cross ml-6 text-white/30" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── closing ── */}
      <section data-nav-label="Join us" className="wrap py-16 sm:py-24">
        <div className="grid gap-8 border-t-2 border-ink pt-8 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(2.2rem,6vw,5rem)] lg:col-span-8">
            Want to build the future of <span className="hl">freight</span> with us?
          </h2>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Button href="/careers">See open roles</Button>
            <Button href="/contact" variant="ghost">
              Partner with us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

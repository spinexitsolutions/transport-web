"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";
import { inr } from "@/lib/utils";

export function Services({ services }: { services: Service[] }) {
  return (
    <section data-nav-label="Services" className="relative">
      <div className="wrap flex flex-col gap-6 pb-10 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pb-14">
        <div>
          <SectionLabel index="02">What we move</SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.6rem,7vw,6rem)]">
            <SplitWords text="Every mode." />
            <br />
            <SplitWords text="One partner." wordClassName="hl" delay={0.15} />
          </h2>
        </div>
        <p className="max-w-sm text-muted">
          Road, air, ocean, rail and warehousing stitched into a single network — so your freight always takes the smartest path.
        </p>
      </div>
      <Desktop services={services} />
      <Mobile services={services} />
    </section>
  );
}

/* Desktop: pinned horizontal rail driven by vertical scroll */
function Desktop({ services }: { services: Service[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const measure = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth + 40));
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <div ref={ref} className="relative hidden md:block" style={{ height: `${services.length * 55}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex w-max gap-5 pl-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))]">
          {services.map((s, i) => (
            <Card key={s.id} s={s} i={i} progress={scrollYProgress} total={services.length} />
          ))}
          <Link
            href="/services"
            className="group grid h-[66vh] w-[28vw] min-w-[300px] place-items-center rounded-[20px] bg-ink text-white"
          >
            <span className="text-center">
              <span className="display block text-5xl">
                All <span className="hl">services</span>
              </span>
              <span className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-ink transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight />
              </span>
            </span>
          </Link>
        </motion.div>
        <div className="wrap mt-8 flex items-center gap-4">
          <span className="font-mono text-xs text-muted">01</span>
          <div className="h-px flex-1 bg-line">
            <motion.div style={{ width: bar }} className="h-px bg-ink" />
          </div>
          <span className="font-mono text-xs text-muted">{String(services.length).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function Card({ s, i, progress, total }: { s: Service; i: number; progress: MotionValue<number>; total: number }) {
  const center = i / total;
  const imgX = useTransform(progress, [center - 0.4, center + 0.4], ["-12%", "12%"]);
  return (
    <Link
      href={`/services/${s.slug}`}
      className="group relative h-[66vh] w-[34vw] min-w-[340px] max-w-[520px] overflow-hidden rounded-[20px] bg-ink text-white"
    >
      <motion.div style={{ x: imgX }} className="absolute -inset-x-[14%] inset-y-0">
        <Image src={s.image} alt={s.title} fill sizes="40vw" className="object-cover opacity-80 transition duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105 group-hover:opacity-100" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/85" />
      <div className="relative flex h-full flex-col justify-between p-7">
        <div className="flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-md">
            <Icon name={s.icon} size={22} strokeWidth={1.7} />
          </span>
          <span className="font-mono text-sm text-white/60">{String(i + 1).padStart(2, "0")}</span>
        </div>
        <div>
          <h3 className="display text-[2.6rem]">{s.title}</h3>
          <p className="mt-3 max-w-sm text-white/75">{s.short}</p>
          <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5">
            <div className="text-sm">
              <div className="text-white/50">{s.transitTime}</div>
              <div className="font-medium">from {inr(s.startingPrice)}/{s.priceUnit || "kg"}</div>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink transition-all duration-500 group-hover:rotate-45 group-hover:bg-signal">
              <ArrowUpRight size={20} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Mobile: sticky stacking cards */
function Mobile({ services }: { services: Service[] }) {
  return (
    <div className="wrap pb-6 md:hidden">
      {services.map((s, i) => (
        <StackCard key={s.id} s={s} i={i} total={services.length} />
      ))}
    </div>
  );
}

function StackCard({ s, i, total }: { s: Service; i: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - (total - i) * 0.015]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.45]);
  return (
    <div ref={ref} className="sticky h-[78svh]" style={{ top: `${80 + i * 10}px` }}>
      <motion.div style={{ scale }} className="relative h-[68svh] origin-top overflow-hidden rounded-[20px] bg-ink text-white shadow-[0_-20px_40px_-20px_rgba(0,0,0,.35)]">
        <Image src={s.image} alt={s.title} fill sizes="100vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
        <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-black" />
        <Link href={`/services/${s.slug}`} className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur-md">
              <Icon name={s.icon} size={20} strokeWidth={1.7} />
            </span>
            <span className="font-mono text-xs text-white/60">
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <div>
            <h3 className="display text-[2.4rem]">{s.title}</h3>
            <p className="mt-2 text-white/75">{s.short}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {s.features.slice(0, 3).map((f) => (
                <span key={f} className="rounded-full bg-white/12 px-3 py-1 text-xs backdrop-blur">
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
              <span>from {inr(s.startingPrice)}/{s.priceUnit || "kg"}</span>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-ink">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

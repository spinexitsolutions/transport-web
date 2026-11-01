"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, MapPin, Search } from "lucide-react";
import type { HeroContent } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useIntroDone } from "../introState";

const E = [0.16, 1, 0.3, 1] as const;

export function Hero({ hero }: { hero: HeroContent }) {
  const ready = useIntroDone();
  const router = useRouter();
  const [id, setId] = useState("");
  const media = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: media, offset: ["start end", "end start"] });
  const inset = useTransform(scrollYProgress, [0.15, 0.5], [6, 0]);
  const radius = useTransform(scrollYProgress, [0.15, 0.5], [36, 0]);
  const clip = useMotionTemplate`inset(0% ${inset}% 0% ${inset}% round ${radius}px)`;
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const chipY = useTransform(scrollYProgress, [0, 1], [60, -80]);

  const line = (text: string, delay: number, className = "") => (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "105%" }}
        animate={ready ? { y: "0%" } : {}}
        transition={{ duration: 1.2, ease: E, delay }}
      >
        {text}
      </motion.span>
    </span>
  );

  return (
    <section data-nav-label="Welcome" className="relative">
      <div className="wrap pt-28 sm:pt-36 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: E }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-ink shadow-[0_1px_0_rgba(0,0,0,.04)] ring-1 ring-line">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inset-0 rounded-full bg-emerald-500" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Control tower live
          </span>
          <span className="eyebrow text-muted">{hero.eyebrow}</span>
        </motion.div>

        <div className="mt-6 grid items-end gap-8 lg:mt-8 lg:grid-cols-12">
          <h1 className="display text-[clamp(3.4rem,13.5vw,11.5rem)] lg:col-span-8">
            {line(hero.titleLine1, 0.05)}
            <span className="flex flex-wrap items-baseline gap-x-[0.18em]">
              {line(hero.titleAccent, 0.15, "serif text-accent pr-[0.05em]")}
              {line(hero.titleLine2, 0.25)}
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: E, delay: 0.45 }}
            className="lg:col-span-4 lg:pb-4"
          >
            <p className="max-w-md text-[17px] leading-relaxed text-ink/70 sm:text-lg">{hero.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/quote" variant="ink">
                {hero.primaryCta}
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/track${id.trim() ? `?id=${encodeURIComponent(id.trim())}` : ""}`);
              }}
              className="mt-4 flex max-w-md items-center rounded-full bg-white p-1.5 ring-1 ring-line transition focus-within:ring-ink/30"
            >
              <Search size={17} className="ml-3 shrink-0 text-muted" />
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={`${hero.secondaryCta} · e.g. KNT-482019`}
                className="w-full min-w-0 bg-transparent px-3 text-[15px] placeholder:text-muted/70 focus:outline-none"
                aria-label="Tracking ID"
              />
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bone-2 text-ink transition hover:bg-accent" aria-label="Track">
                <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* expanding media */}
      <motion.div
        ref={media}
        initial={{ opacity: 0, y: 80 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.4, ease: E, delay: 0.35 }}
        className="relative mt-10 sm:mt-14"
      >
        <motion.div style={{ clipPath: clip }} className="relative h-[68svh] min-h-[420px] overflow-hidden sm:h-[88svh]">
          <motion.div style={{ scale }} className="absolute inset-0">
            <Image src={hero.image} alt="Kinetik truck on an open highway" fill priority sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10" />

          {/* floating live chips */}
          <motion.div style={{ y: chipY }} className="absolute inset-x-0 bottom-6 sm:bottom-12">
            <div className="wrap flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="glass w-full max-w-[340px] rounded-3xl p-4 text-ink shadow-2xl sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">KNT-482019</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-[color-mix(in_oklab,var(--accent),black_25%)]">
                    Out for delivery
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[15px] font-medium tracking-tight">
                  <span>Bengaluru</span>
                  <span className="mx-3 h-px flex-1 bg-gradient-to-r from-ink/10 via-ink/40 to-ink/10" />
                  <span>Dubai</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: "8%" }}
                    animate={ready ? { width: "86%" } : {}}
                    transition={{ duration: 2.4, ease: E, delay: 1 }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
                  <MapPin size={12} /> Al Quoz, Dubai · ETA 2h 40m
                </div>
              </div>
              <div className="hidden gap-3 sm:flex">
                <div className="glass-dark rounded-3xl px-5 py-4 text-white">
                  <div className="font-mono text-[11px] text-white/50">On-time, last 30 days</div>
                  <div className="display mt-1 text-4xl">99.4%</div>
                </div>
                <div className="glass-dark flex items-center gap-3 rounded-3xl px-5 py-4 text-white">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Leaf size={18} />
                  </span>
                  <div>
                    <div className="font-mono text-[11px] text-white/50">CO₂ saved via EV & rail</div>
                    <div className="text-xl font-medium tracking-tight">38% per tonne-km</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

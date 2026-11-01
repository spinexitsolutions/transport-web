"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Plus } from "lucide-react";
import type { Service } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitWords } from "@/components/ui/SplitWords";
import { inr } from "@/lib/utils";

const E = [0.16, 1, 0.3, 1] as const;

/** Expanding panels: narrow vertical spines that open into a full service card. */
export function Services({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  return (
    <section data-nav-label="Services" className="relative py-20 sm:py-28">
      <div className="wrap grid gap-6 pb-10 lg:grid-cols-12 lg:items-end lg:pb-14">
        <div className="lg:col-span-8">
          <SectionLabel index="02">What we move</SectionLabel>
          <h2 className="display mt-6 text-[clamp(2.4rem,6.5vw,5.6rem)]">
            <SplitWords text="Every mode." /> <SplitWords text="One partner." wordClassName="hl" delay={0.15} />
          </h2>
        </div>
        <div className="flex items-end justify-between gap-6 lg:col-span-4 lg:flex-col lg:items-end">
          <p className="max-w-xs text-muted lg:text-right">Pick a mode — every one runs on the same network, rates and live tracking.</p>
          <Link href="/services" className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
            All services <ArrowUpRight size={15} className="transition group-hover:rotate-45" />
          </Link>
        </div>
      </div>

      {/* desktop: horizontal accordion */}
      <div className="wrap hidden h-[72vh] min-h-[540px] gap-2 lg:flex">
        {services.map((s, i) => {
          const on = i === active;
          return (
            <motion.div
              key={s.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              animate={{ flexGrow: on ? 7 : 1 }}
              transition={{ duration: 0.8, ease: E }}
              className="relative min-w-[64px] basis-0 cursor-pointer overflow-hidden rounded-[18px] bg-ink text-white"
            >
              <motion.div className="absolute inset-0" animate={{ opacity: on ? 1 : 0.25, scale: on ? 1 : 1.2 }} transition={{ duration: 0.9, ease: E }}>
                <Image src={s.image} alt={s.title} fill sizes="60vw" className="object-cover" />
              </motion.div>
              <div className={`absolute inset-0 transition-colors duration-700 ${on ? "bg-gradient-to-t from-black/90 via-black/30 to-black/30" : "bg-ink/70"}`} />

              {/* collapsed spine */}
              <AnimatePresence initial={false}>
                {!on && (
                  <motion.div
                    key="spine"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.25 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="absolute inset-0 flex flex-col items-center justify-between py-5"
                  >
                    <span className="board text-2xl text-white/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="display whitespace-nowrap text-xl [writing-mode:vertical-rl] rotate-180">{s.title}</span>
                    <Icon name={s.icon} size={18} className="text-signal" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* expanded card */}
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6, ease: E } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="absolute inset-0 flex flex-col justify-between p-7 xl:p-9"
                  >
                    <div className="flex items-start justify-between">
                      <span className="board text-7xl text-signal">{String(i + 1).padStart(2, "0")}</span>
                      <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/15 backdrop-blur-md">
                        <Icon name={s.icon} size={22} strokeWidth={1.7} />
                      </span>
                    </div>
                    <div className="max-w-xl">
                      <h3 className="display text-[clamp(2.4rem,3.6vw,3.6rem)]">{s.title}</h3>
                      <p className="mt-3 text-lg text-white/75">{s.short}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {s.features.map((f) => (
                          <span key={f} className="rounded-full bg-white/12 px-3 py-1 text-xs ring-1 ring-white/15 backdrop-blur">
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1.5 text-white/60">
                            <Clock size={14} /> {s.transitTime}
                          </span>
                          <span>
                            from <span className="board text-2xl text-signal">{inr(s.startingPrice)}</span>/{s.priceUnit || "kg"}
                          </span>
                        </div>
                        <Link
                          href={`/services/${s.slug}`}
                          className="group inline-flex items-center gap-2 rounded-full bg-signal py-2 pl-5 pr-2 text-sm font-semibold text-ink"
                        >
                          Explore
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition group-hover:rotate-45">
                            <ArrowUpRight size={15} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* mobile / tablet: vertical accordion */}
      <div className="wrap flex flex-col gap-2 lg:hidden">
        {services.map((s, i) => {
          const on = i === active;
          return (
            <motion.div
              key={s.id}
              animate={{ height: on ? 440 : 72 }}
              transition={{ duration: 0.7, ease: E }}
              className="relative overflow-hidden rounded-[16px] bg-ink text-white"
            >
              <motion.div className="absolute inset-0" animate={{ opacity: on ? 1 : 0.18 }} transition={{ duration: 0.6 }}>
                <Image src={s.image} alt="" fill sizes="100vw" className="object-cover" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
              <button onClick={() => setActive(on ? -1 : i)} className="relative flex h-[72px] w-full items-center gap-4 px-4 text-left" aria-expanded={on}>
                <span className={`board w-9 text-3xl ${on ? "text-signal" : "text-white/50"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="display flex-1 text-[1.35rem]">{s.title}</span>
                <span className={`grid h-9 w-9 place-items-center rounded-full transition ${on ? "rotate-45 bg-signal text-ink" : "bg-white/10"}`}>
                  <Plus size={16} />
                </span>
              </button>
              <AnimatePresence>
                {on && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 p-4"
                  >
                    <p className="text-white/80">{s.short}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.features.slice(0, 3).map((f) => (
                        <span key={f} className="rounded-full bg-white/12 px-3 py-1 text-xs backdrop-blur">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
                      <span>
                        <span className="text-white/55">{s.transitTime} · </span>from <span className="board text-xl text-signal">{inr(s.startingPrice)}</span>/{s.priceUnit || "kg"}
                      </span>
                      <Link href={`/services/${s.slug}`} className="grid h-10 w-10 place-items-center rounded-full bg-signal text-ink" aria-label={`Explore ${s.title}`}>
                        <ArrowUpRight size={17} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

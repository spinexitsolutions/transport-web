"use client";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, cubicBezier, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, MapPin } from "lucide-react";
import type { HeroContent } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useIntroDone } from "../introState";

const E = [0.16, 1, 0.3, 1] as const;
const inOut = cubicBezier(0.65, 0, 0.35, 1);
const MODE_MS = 2600;

const ROUTES: Record<string, string> = {
  road: "Bhiwandi → Gurugram · NH48",
  air: "BLR → DXB · Flight EK 569",
  sea: "Mundra → Jebel Ali · MV Kestrel",
  rail: "JNPT → Dadri · Western DFC",
};

type Rect = { x: number; y: number; w: number; h: number; W: number; H: number };

/**
 * Hero: a wide grotesk headline with an inline image "capsule".
 * The capsule cycles through transport modes in sync with the rolling word,
 * then — on scroll — expands to fill the screen while the headline parts around it.
 */
export function Hero({ hero }: { hero: HeroContent }) {
  const ready = useIntroDone();
  const router = useRouter();
  const [trackId, setTrackId] = useState("");
  const modes = hero.modes?.length ? hero.modes : ["road", "air", "sea", "rail"];
  const images = modes.map((_, i) => hero.modeImages?.[i] || hero.image);
  const [mode, setMode] = useState(0);

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0, W: 1, H: 1 });

  // measure the capsule slot relative to the sticky stage
  useLayoutEffect(() => {
    const measure = () => {
      if (!slot.current || !stage.current) return;
      const s = stage.current.getBoundingClientRect();
      const r = slot.current.getBoundingClientRect();
      setRect({ x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height, W: s.width, H: s.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => setMode((m) => (m + 1) % modes.length), MODE_MS);
    return () => clearInterval(t);
  }, [ready, modes.length]);

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });
  const opt = { ease: inOut };
  const left = useTransform(p, [0, 0.6], [rect.x, 0], opt);
  const top = useTransform(p, [0, 0.6], [rect.y, 0], opt);
  const width = useTransform(p, [0, 0.6], [rect.w, rect.W], opt);
  const height = useTransform(p, [0, 0.6], [rect.h, rect.H], opt);
  const radius = useTransform(p, [0, 0.6], [Math.min(rect.h / 2, 48), 0], opt);
  const imgScale = useTransform(p, [0, 0.6, 1], [1.35, 1.05, 1]);
  const lineL = useTransform(p, [0, 0.5], ["0vw", "-40vw"], opt);
  const lineR = useTransform(p, [0, 0.5], ["0vw", "40vw"], opt);
  const textFade = useTransform(p, [0, 0.35], [1, 0]);
  const chromeFade = useTransform(p, [0, 0.12], [1, 0]);
  const chromeY = useTransform(p, [0, 0.12], [0, 24]);
  const overlay = useTransform(p, [0.55, 0.75], [0, 1]);
  const overlayY = useTransform(p, [0.55, 0.8], [40, 0]);
  const tint = useTransform(p, [0.3, 0.7], [0, 0.55]);

  const rise = (delay: number) => ({
    initial: { y: "110%" },
    animate: ready ? { y: "0%" } : {},
    transition: { duration: 1.25, ease: E, delay },
  });

  return (
    <section ref={section} data-nav-label="Welcome" className="relative" style={{ height: "calc(100svh + 140vh)" }}>
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="wrap relative z-10 flex h-full flex-col pb-4 pt-[76px] sm:pb-6 sm:pt-[92px]">
          {/* ── live manifest strip ── */}
          <motion.div style={{ opacity: chromeFade, y: chromeY }}>
            <ManifestStrip ready={ready} eyebrow={hero.eyebrow} />
          </motion.div>

          {/* ── headline ── */}
          <h1 className="display flex flex-1 flex-col justify-center text-[clamp(2.9rem,13.6vw,10.6rem)] [font-stretch:100%] sm:text-[clamp(2.7rem,12.4vw,10.6rem)] sm:[font-stretch:118%]">
            <motion.span style={{ x: lineL, opacity: textFade }} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
              <motion.span className="block" {...rise(0.05)}>
                {hero.titleLine1}
              </motion.span>
            </motion.span>

            <span className="-mb-[0.12em] flex flex-col items-start overflow-hidden pb-[0.12em] sm:flex-row sm:items-center">
              <motion.span
                ref={slot}
                aria-hidden
                className="my-[0.14em] block h-[1.9em] w-full shrink-0 rounded-full sm:my-0 sm:mr-[0.14em] sm:inline-block sm:h-[0.74em] sm:w-[1.85em]"
                initial={{ opacity: 0 }}
                animate={ready ? { opacity: 1 } : {}}
              />
              <motion.span style={{ x: lineR, opacity: textFade }} className="block">
                <motion.span className="block" {...rise(0.15)}>
                  {hero.titleLine2}
                </motion.span>
              </motion.span>
            </span>

            <motion.span style={{ x: lineL, opacity: textFade }} className="block overflow-hidden pb-[0.06em]">
              <motion.span className="relative inline-grid" {...rise(0.25)}>
                {/* reserve width of the longest word */}
                {modes.map((m) => (
                  <span key={m} className="invisible col-start-1 row-start-1">
                    {m}.
                  </span>
                ))}
                <span className="col-start-1 row-start-1 overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={mode}
                      className="hl block"
                      initial={{ y: "100%", rotateX: -60 }}
                      animate={{ y: "0%", rotateX: 0 }}
                      exit={{ y: "-100%", rotateX: 60 }}
                      transition={{ duration: 0.8, ease: E }}
                    >
                      {modes[mode]}
                      <span className="text-ink">.</span>
                    </motion.span>
                  </AnimatePresence>
                </span>
                {/* mode timer */}
                <span className="absolute -bottom-[0.02em] left-0 h-[3px] w-[60%] overflow-hidden bg-ink/10">
                  <motion.span
                    key={`bar-${mode}-${ready}`}
                    className="block h-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={ready ? { width: "100%" } : {}}
                    transition={{ duration: MODE_MS / 1000, ease: "linear" }}
                  />
                </span>
              </motion.span>
            </motion.span>
          </h1>

          {/* ── bottom console ── */}
          <motion.div
            style={{ opacity: chromeFade, y: chromeY }}
            className="grid gap-4 border-t border-line pt-4 sm:grid-cols-12 sm:items-end sm:gap-6 sm:pt-5"
          >
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: E, delay: 0.45 }}
              className="max-w-md text-[15px] leading-relaxed text-ink/70 sm:col-span-5 sm:text-base"
            >
              {hero.subtitle}
            </motion.p>
            <div className="hidden items-center gap-2 text-muted sm:col-span-2 lg:flex">
              <span className="cross text-accent" />
              <span className="eyebrow">Scroll to board</span>
              <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                <ArrowDown size={13} />
              </motion.span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: E, delay: 0.55 }}
              className="flex flex-col gap-2 sm:col-span-7 sm:flex-row sm:items-center sm:justify-end lg:col-span-5"
            >
              <Button href="/quote" variant="accent" className="w-full justify-between sm:w-auto">
                {hero.primaryCta}
              </Button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push(`/track${trackId.trim() ? `?id=${encodeURIComponent(trackId.trim())}` : ""}`);
                }}
                className="flex h-12 items-center rounded-full bg-white pl-4 pr-1 ring-1 ring-line transition focus-within:ring-ink/40 sm:w-72"
              >
                <input
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  placeholder={`${hero.secondaryCta} — KNT-482019`}
                  className="w-full min-w-0 bg-transparent text-[14px] placeholder:text-muted/80 focus:outline-none"
                  aria-label="Tracking ID"
                />
                <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:bg-accent" aria-label="Track">
                  <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        </div>

        {/* ── expanding media capsule ── */}
        {rect.w > 0 && (
          <motion.div
            style={{ left, top, width, height, borderRadius: radius }}
            className="absolute z-20 overflow-hidden bg-ink"
            initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
            animate={ready ? { clipPath: "inset(0% 0% 0% 0%)" } : {}}
            transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          >
            <motion.div style={{ scale: imgScale }} className="absolute inset-0">
              {images.map((src, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: i === mode ? 1 : 0, scale: i === mode ? 1 : 1.12 }}
                  transition={{ duration: 1.1, ease: E }}
                >
                  <Image src={src} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
                </motion.div>
              ))}
            </motion.div>
            <motion.div style={{ opacity: tint }} className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

            {/* content revealed once the capsule fills the screen */}
            <motion.div style={{ opacity: overlay, y: overlayY }} className="on-dark absolute inset-0 flex flex-col justify-end text-white">
              <div className="wrap grid gap-6 pb-8 sm:pb-12 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7">
                  <div className="eyebrow flex items-center gap-2 text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-signal" /> Now moving by <span className="text-signal">{modes[mode]}</span>
                  </div>
                  <p className="display mt-4 text-[clamp(2.2rem,6vw,5.2rem)]">
                    1,284 shipments
                    <br />
                    <span className="hl">on the move.</span>
                  </p>
                </div>
                <div className="rounded-[18px] bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-xl sm:max-w-sm lg:col-span-4 lg:col-start-9">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-white/60">KNT-48201{mode}</span>
                    <span className="rounded-full bg-signal px-2 py-0.5 text-[11px] font-semibold text-ink">In transit</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[15px] font-medium">
                    <MapPin size={14} className="text-signal" />
                    {ROUTES[modes[mode]] ?? "Mumbai → Delhi"}
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
                    <motion.div key={mode} className="h-full bg-signal" initial={{ width: "15%" }} animate={{ width: "72%" }} transition={{ duration: 2, ease: E }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ManifestStrip({ ready, eyebrow }: { ready: boolean; eyebrow: string }) {
  const [moving, setMoving] = useState(1284);
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const a = setInterval(tick, 15000);
    const b = setInterval(() => setMoving((m) => m + Math.round(Math.random() * 3 - 1)), 1800);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);
  const cells = [
    { k: "In motion", v: moving.toLocaleString("en-IN"), live: true },
    { k: "On-time · 30d", v: "99.4%" },
    { k: "Mumbai HQ", v: `${time} IST` },
    { k: "Network", v: "180+ cities" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={ready ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
      className="grid grid-cols-2 border-y border-line sm:grid-cols-4 lg:grid-cols-[repeat(4,1fr)_1.2fr]"
    >
      {cells.map((c, i) => (
        <div key={c.k} className={`flex flex-col gap-1 py-2.5 sm:py-3 ${i % 2 === 1 ? "border-l border-line pl-3 sm:pl-4" : ""} ${i === 2 ? "hidden sm:flex sm:border-l sm:pl-4" : ""} ${i === 3 ? "hidden sm:flex" : ""}`}>
          <span className="eyebrow flex items-center gap-1.5 text-muted">
            {c.live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
            {c.k}
          </span>
          <span className="font-mono text-[15px] font-semibold tracking-tight sm:text-base">{c.v}</span>
        </div>
      ))}
      <div className="hidden items-center justify-end gap-4 border-l border-line pl-4 lg:flex">
        <span className="eyebrow text-right text-muted">{eyebrow}</span>
        <span className="barcode h-7 w-24 text-ink/80" />
      </div>
    </motion.div>
  );
}

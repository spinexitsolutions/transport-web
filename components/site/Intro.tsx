"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate } from "framer-motion";
import type { IntroSettings } from "@/lib/types";
import { markIntroDone } from "./introState";

const KEY = "kinetik_intro_seen";
const EASE = [0.76, 0, 0.24, 1] as const;

export function Intro({ intro, brand }: { intro: IntroSettings; brand: string }) {
  const [show, setShow] = useState(intro.enabled);
  const [progress, setProgress] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("intro") === "preview";
    const seen = intro.oncePerSession && sessionStorage.getItem(KEY);
    if (!intro.enabled || (seen && !preview)) {
      setShow(false);
      markIntroDone();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const stopT = setTimeout(() => window.__lenis?.stop(), 0); // Lenis is created by the parent effect
    const dur = Math.max(1.2, intro.duration);
    const words = intro.words.length ? intro.words : [brand];
    const c = animate(0, 100, {
      duration: dur,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        setProgress(Math.round(v));
        setWordIdx(Math.min(words.length - 1, Math.floor((v / 100) * words.length)));
      },
      onComplete: () => {
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem(KEY, "1");
        }, 250);
      },
    });
    return () => {
      c.stop();
      clearTimeout(stopT);
    };
  }, [intro, brand]);

  const words = intro.words.length ? intro.words : [brand];

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
        window.__lenis?.start();
        markIntroDone();
      }}
    >
      {show && (
        <motion.div
          id="k-intro"
          key="intro"
          className="fixed inset-0 z-[100] overflow-hidden bg-accent text-accent-ink"
          exit={{ clipPath: "inset(0% 0% 100% 0% round 0px 0px 48px 48px)" }}
          initial={{ clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {/* hide instantly on reload when already seen (prevents a flash before hydration) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(${intro.oncePerSession}&&sessionStorage.getItem('${KEY}')&&location.search.indexOf('intro=preview')<0){document.documentElement.setAttribute('data-intro-seen','')}}catch(e){}`,
            }}
          />
          <div className="noise absolute inset-0" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-10">
            <span className="eyebrow flex items-center gap-3 opacity-80">
              <span className="cross" /> Manifest · 001
            </span>
            <span className="barcode h-7 w-28 opacity-70" />
          </div>

          {intro.style === "wordmark" && <Wordmark brand={brand} progress={progress} />}
          {intro.style === "route" && <Route progress={progress} />}
          {intro.style === "counter" && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative h-[1.1em] overflow-hidden text-[clamp(2.5rem,10vw,7rem)] display">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={wordIdx}
                    className={wordIdx === words.length - 1 ? "block text-signal" : "block"}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {words[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* footer row: brand + counter */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-10">
            <div className="eyebrow text-white/50">
              {brand} <span className="text-white/25">— loading the network</span>
            </div>
            <div className="display text-[clamp(4rem,18vw,13rem)] leading-[0.8] tabular-nums tracking-[-0.06em]">
              {progress}
              <span className="text-signal">%</span>
            </div>
          </div>
          <motion.div className="absolute bottom-0 left-0 h-[3px] bg-signal" style={{ width: `${progress}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Wordmark({ brand, progress }: { brand: string; progress: number }) {
  const letters = brand.split("");
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex overflow-hidden display text-[clamp(4rem,20vw,16rem)] leading-[0.85]">
        {letters.map((l, i) => (
          <motion.span
            key={i}
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className={i === letters.length - 1 ? "text-signal" : ""}
          >
            {l}
          </motion.span>
        ))}
      </div>
      <motion.div className="absolute left-1/2 top-[62%] h-px -translate-x-1/2 bg-white/30" style={{ width: `${Math.min(progress, 100) * 0.6}vw` }} />
    </div>
  );
}

function Route({ progress }: { progress: number }) {
  const p = progress / 100;
  const d = "M 60 260 C 260 40, 420 360, 600 180 S 900 60, 1140 140";
  return (
    <div className="absolute inset-0 grid place-items-center px-4">
      <svg viewBox="0 0 1200 320" className="w-full max-w-5xl overflow-visible">
        <path d={d} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" strokeDasharray="6 10" />
        <motion.path d={d} fill="none" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" style={{ pathLength: p }} />
        {[
          [60, 260, "BOM"],
          [600, 180, "DXB"],
          [1140, 140, "RTM"],
        ].map(([x, y, l], i) => (
          <g key={i}>
            <circle cx={x as number} cy={y as number} r="7" fill={p > i * 0.48 ? "var(--signal)" : "rgba(255,255,255,.3)"} />
            <text x={x as number} y={(y as number) + 34} fill="rgba(255,255,255,.6)" fontSize="16" textAnchor="middle" fontFamily="var(--font-display)">
              {l}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

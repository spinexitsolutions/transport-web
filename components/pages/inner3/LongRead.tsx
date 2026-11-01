"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { Check, Link2 } from "lucide-react";

/** Full-bleed cover with scroll parallax. */
export function CoverParallax({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const clip = useTransform(scrollYProgress, [0, 0.35], ["inset(8% 6% 8% 6% round 18px)", "inset(0% 0% 0% 0% round 0px)"]);
  return (
    <motion.div ref={ref} style={{ clipPath: clip }} className="relative h-[52svh] overflow-hidden bg-ink sm:h-[78svh]">
      <motion.div style={{ y }} className="absolute -inset-y-[14%] inset-x-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </motion.div>
    </motion.div>
  );
}

/** Body column with a sticky reading-progress bar along its top. */
export function ArticleBody({ children, readTime }: { children: React.ReactNode; readTime: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.3", "end 0.7"] });
  const p = useSpring(scrollYProgress, { stiffness: 160, damping: 30 });
  const width = useTransform(p, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);
  const left = useTransform(p, (v) => Math.max(0, Math.ceil(readTime * (1 - v))));
  const [minsLeft, setMinsLeft] = useState(readTime);
  useMotionValueEvent(left, "change", (v) => setMinsLeft(v));
  return (
    <div ref={ref} className="relative">
      <div className="sticky top-0 z-10 -mx-4 mb-8 bg-bone/90 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0 lg:top-20">
        <div className="flex items-center justify-between text-xs">
          <span className="eyebrow text-muted">Reading</span>
          <span className="board text-sm text-ink">{minsLeft > 0 ? `${minsLeft} min left` : "Finished ✓"}</span>
        </div>
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-ink/10">
          <motion.div style={{ width }} className="h-full bg-accent" />
        </div>
      </div>
      {children}
    </div>
  );
}

export function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window !== "undefined" ? window.location.href : "");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  const open = (base: string) => window.open(base + encodeURIComponent(url()) + "&text=" + encodeURIComponent(title), "_blank", "noopener");
  return (
    <div className="flex flex-wrap gap-2 lg:flex-col">
      <button onClick={copy} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-white transition hover:bg-accent">
        {copied ? <Check size={14} /> : <Link2 size={14} />} {copied ? "Copied" : "Copy link"}
      </button>
      <button onClick={() => open("https://x.com/intent/post?url=")} className="rounded-full px-4 py-2 text-left text-sm ring-1 ring-line transition hover:bg-ink hover:text-white">
        Share on X ↗
      </button>
      <button
        onClick={() => window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url()), "_blank", "noopener")}
        className="rounded-full px-4 py-2 text-left text-sm ring-1 ring-line transition hover:bg-ink hover:text-white"
      >
        LinkedIn ↗
      </button>
    </div>
  );
}

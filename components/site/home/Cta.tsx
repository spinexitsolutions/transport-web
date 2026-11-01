"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react";

/**
 * Final CTA: two rows of giant signage type slide in opposite directions with scroll,
 * and a rotating, magnetic badge sits in the middle as the button.
 */
export function Cta({ title, subtitle, phone }: { title: string; subtitle: string; phone: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["5%", "-35%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-35%", "5%"]);
  const rows = ["Get a quote", "Move it today", "Book a truck", "Ship it now"];

  return (
    <section ref={ref} data-nav-label="Let's talk" className="relative overflow-hidden bg-accent py-16 text-accent-ink sm:py-24">
      <div className="noise absolute inset-0" />
      <div className="relative flex flex-col gap-2 select-none" aria-hidden>
        <motion.div style={{ x: x1 }} className="board flex whitespace-nowrap text-[clamp(5rem,17vw,15rem)]">
          {[...rows, ...rows].map((r, i) => (
            <span key={i} className="flex items-center">
              {r}
              <span className="mx-[0.25em] text-signal">→</span>
            </span>
          ))}
        </motion.div>
        <motion.div style={{ x: x2, ["--stroke" as string]: "rgba(255,255,255,.6)" }} className="board outline-text flex whitespace-nowrap text-[clamp(5rem,17vw,15rem)]">
          {[...rows, ...rows].reverse().map((r, i) => (
            <span key={i} className="flex items-center">
              {r}
              <span className="mx-[0.25em]">/</span>
            </span>
          ))}
        </motion.div>
      </div>

      <div className="wrap relative mt-10 grid items-center gap-10 sm:mt-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="display text-[clamp(2rem,4.6vw,3.8rem)]">{title}</h2>
          <p className="mt-4 max-w-md text-lg text-white/75">{subtitle}</p>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-6 inline-flex items-center gap-3 text-lg font-medium">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
              <Phone size={17} />
            </span>
            {phone}
          </a>
        </div>
        <div className="flex justify-center lg:col-span-4 lg:col-start-8">
          <Badge />
        </div>
      </div>
    </section>
  );
}

function Badge() {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 15 });
  const text = "Get instant quote • 2 minute pricing • Book today • ";
  return (
    <motion.div style={{ x, y }}>
      <Link
        ref={ref}
        href="/quote"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          x.set((e.clientX - r.left - r.width / 2) * 0.3);
          y.set((e.clientY - r.top - r.height / 2) * 0.3);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
        className="group relative grid h-56 w-56 place-items-center rounded-full bg-signal text-ink sm:h-64 sm:w-64"
        aria-label="Get instant quote"
      >
        <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
          <defs>
            <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text className="board" fontSize="17" letterSpacing="2.5" fill="currentColor">
            <textPath href="#badge-circle" textLength="486" lengthAdjust="spacing">{text}</textPath>
          </text>
        </motion.svg>
        <span className="grid h-24 w-24 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:scale-110 sm:h-28 sm:w-28">
          <ArrowUpRight size={34} className="transition-transform duration-500 group-hover:rotate-45" />
        </span>
      </Link>
    </motion.div>
  );
}

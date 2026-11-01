"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Compass, HeartHandshake, Leaf, Zap, type LucideIcon } from "lucide-react";

const VALUES: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: Zap, t: "Speed is a feature", d: "Every hour saved is cash freed for our customers." },
  { icon: Compass, t: "Radical visibility", d: "If we know it, you know it — in real time." },
  { icon: HeartHandshake, t: "Partners, not vendors", d: "We win when our customers' customers are happy." },
  { icon: Leaf, t: "Lighter footprint", d: "Electric-first last mile and rail-first long haul." },
];

export function ValueTiles() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [perspective:1200px]">
      {VALUES.map((v, i) => (
        <Tile key={v.t} {...v} i={i} />
      ))}
    </div>
  );
}

function Tile({ icon: I, t, d, i }: { icon: LucideIcon; t: string; d: string; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 18 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: -25 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[18px] bg-ink p-6 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)] sm:min-h-[360px]"
    >
      <div className="flex items-start justify-between" style={{ transform: "translateZ(40px)" }}>
        <span className="board text-6xl text-signal">0{i + 1}</span>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-signal group-hover:text-ink">
          <I size={24} />
        </span>
      </div>
      <div style={{ transform: "translateZ(30px)" }}>
        <h3 className="display text-[1.7rem] [font-stretch:105%]">{t}</h3>
        <p className="mt-2 text-white/60">{d}</p>
      </div>
      <span className="pointer-events-none absolute -bottom-10 -right-6 board text-[9rem] text-white/[0.04]">{t.split(" ")[0]}</span>
    </motion.div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Rolling odometer: counts from `from` to `to`, each digit on its own rolling drum. */
export function Odometer({ from, to, className }: { from: number; to: number; className?: string }) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    let v = from;
    const id = setInterval(() => {
      v += 1;
      setValue(v);
      if (v >= to) clearInterval(id);
    }, 260);
    return () => clearInterval(id);
  }, [from, to]);
  const digits = String(value).padStart(String(to).length, "0").split("");
  return (
    <span className={`inline-flex gap-[0.04em] ${className ?? ""}`} aria-label={String(to)}>
      {digits.map((d, i) => (
        <span key={i} className="relative inline-block h-[1em] w-[0.62em] overflow-hidden rounded-[0.06em] bg-black/20 leading-none ring-1 ring-white/10" aria-hidden>
          <motion.span
            className="absolute inset-x-0 top-0 flex flex-col items-center"
            animate={{ y: `-${Number(d)}em` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            {Array.from({ length: 10 }).map((_, n) => (
              <span key={n} className="block h-[1em] leading-[1em]">
                {n}
              </span>
            ))}
          </motion.span>
          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/25" />
        </span>
      ))}
    </span>
  );
}

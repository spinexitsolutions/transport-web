"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Rubber-stamp badge: dashed double ring, slight rotation, thumps in when visible. */
export function Stamp({ icon, big, small, rotate = -5, tone = "accent" }: { icon: React.ReactNode; big: string; small: string; rotate?: number; tone?: "accent" | "ink" }) {
  return (
    <motion.div
      initial={{ scale: 1.6, opacity: 0, rotate: rotate - 12 }}
      whileInView={{ scale: 1, opacity: 1, rotate }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className={cn(
        "relative grid aspect-square w-full max-w-[150px] place-items-center rounded-full border-[3px] p-2",
        tone === "accent" ? "border-accent text-accent" : "border-ink text-ink",
      )}
    >
      <div className="grid h-full w-full place-items-center rounded-full border border-dashed border-current text-center">
        <div>
          <span className="mx-auto block w-fit opacity-80">{icon}</span>
          <div className="board mt-1 text-3xl leading-none">{big}</div>
          <div className="eyebrow mt-1 !text-[0.55rem]">{small}</div>
        </div>
      </div>
    </motion.div>
  );
}

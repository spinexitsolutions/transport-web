"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Each word slides up from behind a mask — used for headlines. */
export function SplitWords({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  animateOnMount = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  animateOnMount?: boolean;
}) {
  const words = text.split(" ");
  const trigger = animateOnMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <motion.span className={cn("inline", className)} initial="hidden" {...trigger} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-flex overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom" aria-hidden>
          <motion.span
            className={cn("inline-block", wordClassName)}
            variants={{
              hidden: { y: "110%", rotate: 4 },
              show: { y: "0%", rotate: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + i * stagger } },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

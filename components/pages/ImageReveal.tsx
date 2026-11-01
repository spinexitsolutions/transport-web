"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** Image that wipes open (clip-path) when entering view, then drifts with a subtle parallax. */
export function ImageReveal({
  src,
  alt,
  className,
  imgClassName,
  parallax = true,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  parallax?: boolean;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], parallax ? ["-8%", "8%"] : ["0%", "0%"]);
  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden bg-ink/5", className)}
      initial={{ clipPath: "inset(18% 12% 18% 12% round 32px)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        style={{ y, scale: 1.18 }}
        className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
      />
    </motion.div>
  );
}

"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";

/** An accent disc expands to fill the section as you scroll into it. */
export function Cta({ title, subtitle, phone }: { title: string; subtitle: string; phone: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], ["50%", "0%"]);
  const textY = useTransform(scrollYProgress, [0.4, 1], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0.45, 0.9], [0, 1]);
  const words = title.split(" ");
  const tail = words.slice(-2).join(" ");
  const head = words.slice(0, -2).join(" ");

  return (
    <section ref={ref} data-nav-label="Let's talk" className="relative overflow-hidden py-6">
      <div className="relative grid min-h-[90svh] place-items-center">
        <motion.div style={{ scale, borderRadius: radius }} className="absolute inset-0 bg-accent" />
        <motion.div style={{ y: textY, opacity }} className="wrap relative text-center text-accent-ink">
          <h2 className="display mx-auto max-w-5xl text-[clamp(3rem,10vw,9rem)]">
            {head} <span className="serif">{tail}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg opacity-75">{subtitle}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/quote" variant="ink">
              Get instant quote
            </Button>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex h-12 items-center rounded-full px-6 font-medium ring-1 ring-inset ring-current/30 transition hover:bg-black/10">
              Call {phone}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

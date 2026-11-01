"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

export function Counter({ value, prefix = "", suffix = "", className }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const decimals = value % 1 !== 0 ? 1 : 0;
  const [display, setDisplay] = useState((0).toFixed(decimals));
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })),
    });
    return () => c.stop();
  }, [inView, value, decimals]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

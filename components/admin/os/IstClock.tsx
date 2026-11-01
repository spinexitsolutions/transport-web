"use client";
import { useEffect, useState } from "react";

/** Live Mumbai time, rendered after mount to avoid hydration mismatches. */
export function IstClock({ seconds = false, className }: { seconds?: boolean; className?: string }) {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const tick = () =>
      setT(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: seconds ? "2-digit" : undefined,
          hour12: false,
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [seconds]);
  return <span className={className}>{t}</span>;
}

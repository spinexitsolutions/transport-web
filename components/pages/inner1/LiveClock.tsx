"use client";
import { useEffect, useState } from "react";

export function LiveClock({ seconds = true, className }: { seconds?: boolean; className?: string }) {
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
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [seconds]);
  return <span className={className}>{t}</span>;
}

"use client";
import { useEffect, useState } from "react";

/** Live IST clock + open/closed indicator for the sales desk (control tower is always on). */
export function OpenNow() {
  const [now, setNow] = useState<{ t: string; open: boolean } | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const t = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
      const day = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short" });
      const h = Number(t.slice(0, 2));
      setNow({ t, open: day !== "Sun" && h >= 9 && h < 20 });
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-600/60" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-600" />
        </span>
        <span className="eyebrow">Control tower · open 24×7</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${now?.open ? "bg-accent" : "bg-ink/30"}`} />
        <span className="eyebrow">Sales desk · {now ? (now.open ? "open now" : "opens 09:00") : "—"}</span>
      </div>
      <span className="board text-2xl">{now?.t ?? "--:--"} IST</span>
    </div>
  );
}

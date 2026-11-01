"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __introDone?: boolean;
  }
}

export function markIntroDone() {
  if (typeof window === "undefined" || window.__introDone) return;
  window.__introDone = true;
  window.dispatchEvent(new Event("intro:done"));
}

/** True once the intro overlay has finished (or was skipped). Hero animations wait for this. */
export function useIntroDone() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (window.__introDone) {
      setDone(true);
      return;
    }
    const on = () => setDone(true);
    window.addEventListener("intro:done", on);
    return () => window.removeEventListener("intro:done", on);
  }, []);
  return done;
}

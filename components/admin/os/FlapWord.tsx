"use client";
import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Split-flap word that scrambles then settles. */
export function FlapWord({ text, className, tileClassName, delay = 0 }: { text: string; className?: string; tileClassName?: string; delay?: number }) {
  const [shown, setShown] = useState(text.replace(/[^ ]/g, " "));
  useEffect(() => {
    let frame = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      id = setInterval(() => {
        frame++;
        setShown(
          text
            .split("")
            .map((c, i) => (c === " " ? " " : frame > 5 + i * 1.4 ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
            .join(""),
        );
        if (frame > 7 + text.length * 1.4) clearInterval(id);
      }, 55);
    }, delay);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [text, delay]);
  return (
    <span className={className} aria-label={text}>
      {shown.split("").map((c, i) =>
        text[i] === " " ? (
          <span key={i} className="inline-block w-[0.3em]" />
        ) : (
          <span key={i} aria-hidden className={tileClassName}>
            {c}
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/35" />
          </span>
        ),
      )}
    </span>
  );
}

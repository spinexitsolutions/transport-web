import { cn } from "@/lib/utils";

/** Torn-receipt edge. Place directly below (or, flipped, above) a block of the same colour. */
export function Zigzag({ color = "#fff", flip, size = 14, className }: { color?: string; flip?: boolean; size?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("w-full", className)}
      style={{
        height: size / 2,
        background: `linear-gradient(135deg, ${color} 50%, transparent 50%) 0 0/${size}px ${size}px repeat-x, linear-gradient(225deg, ${color} 50%, transparent 50%) 0 0/${size}px ${size}px repeat-x`,
        transform: flip ? "rotate(180deg)" : undefined,
      }}
    />
  );
}

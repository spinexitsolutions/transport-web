import { cn } from "@/lib/utils";

/** Manifest-style section tag:  ┼ 02 ──── SERVICES */
export function SectionLabel({ index, children, className, dark }: { index?: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={cn("eyebrow flex items-center gap-3", dark ? "text-white/60" : "text-muted", className)}>
      <span className={cn("cross", dark ? "text-signal" : "text-accent")} />
      {index && <span className={dark ? "text-white" : "text-ink"}>{index}</span>}
      <span className={cn("h-px w-10", dark ? "bg-white/25" : "bg-ink/20")} />
      <span>{children}</span>
    </div>
  );
}

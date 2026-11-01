import { cn } from "@/lib/utils";

export function SectionLabel({ index, children, className, dark }: { index?: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={cn("eyebrow flex items-center gap-3", dark ? "text-white/55" : "text-muted", className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-accent" />
      </span>
      {index && <span className={dark ? "text-white/35" : "text-ink/35"}>{index}</span>}
      <span>{children}</span>
    </div>
  );
}

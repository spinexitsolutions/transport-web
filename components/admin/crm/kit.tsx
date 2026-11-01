"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Airport-style 3-letter code for a city/place (used on tickets and boards). */
const KNOWN: Record<string, string> = {
  mumbai: "BOM", bhiwandi: "BHW", "delhi ncr": "DEL", delhi: "DEL", gurugram: "GGN", bengaluru: "BLR", bangalore: "BLR",
  chennai: "MAA", kolkata: "CCU", hyderabad: "HYD", pune: "PNQ", chakan: "CKN", ahmedabad: "AMD", jaipur: "JAI",
  kochi: "COK", ludhiana: "LUH", mundra: "MUN", "jebel ali": "JEA", dubai: "DXB", singapore: "SIN", rotterdam: "RTM",
  london: "LHR", "new york": "JFK", shanghai: "PVG", nairobi: "NBO", sydney: "SYD",
};
export function cityCode(place?: string) {
  if (!place?.trim()) return "———";
  const key = place.toLowerCase().split(",")[0].trim();
  if (KNOWN[key]) return KNOWN[key];
  const hit = Object.keys(KNOWN).find((k) => key.startsWith(k));
  if (hit) return KNOWN[hit];
  return key.replace(/[^a-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
}

export const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/** Page header for CRM screens: module code + signage title + live stats strip. */
export function CrmHeader({
  code,
  module,
  title,
  accent,
  description,
  stats,
  actions,
}: {
  code: string;
  module: string;
  title: string;
  accent?: string;
  description?: string;
  stats?: { label: string; value: string; tone?: "accent" | "signal" | "ink" }[];
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <span className="eyebrow flex items-center gap-3 text-muted">
          <span className="cross text-accent" />
          <span className="board text-[15px] tracking-normal text-ink">{code}</span>
          <span className="h-px w-8 bg-ink/20" />
          {module}
        </span>
        <span className="barcode hidden h-5 w-20 text-ink/60 sm:block" aria-hidden />
      </div>
      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="board text-[clamp(2.8rem,8vw,5.2rem)] leading-[0.82]">
            {title} {accent && <span className="text-accent">{accent}</span>}
          </h1>
          {description && <p className="mt-3 max-w-xl text-[15px] text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {stats && stats.length > 0 && (
        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[14px] border border-line bg-white sm:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col gap-1 px-4 py-3",
                i % 2 === 1 && "border-l border-line",
                i >= 2 && "border-t border-line sm:border-t-0",
                i === 2 && "sm:border-l",
                s.tone === "accent" && "bg-accent text-white",
                s.tone === "signal" && "bg-signal",
                s.tone === "ink" && "bg-ink text-white",
              )}
            >
              <span className={cn("eyebrow", s.tone === "accent" || s.tone === "ink" ? "text-white/60" : "text-muted")}>{s.label}</span>
              <span className="board text-3xl">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

/** Rubber stamp (status marks on tickets / passes). */
export function Stamp({ children, tone = "accent", className }: { children: React.ReactNode; tone?: "accent" | "red" | "ink" | "green"; className?: string }) {
  const color = { accent: "text-accent border-accent", red: "text-red-600 border-red-600", ink: "text-ink border-ink", green: "text-emerald-600 border-emerald-600" }[tone];
  return (
    <motion.span
      initial={{ scale: 1.6, opacity: 0, rotate: -14 }}
      animate={{ scale: 1, opacity: 0.9, rotate: -8 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      className={cn("board inline-block rounded-[6px] border-2 px-2 py-0.5 text-sm tracking-wider", color, className)}
    >
      {children}
    </motion.span>
  );
}

/** Board-style filter tabs with counts. */
export function BoardTabs<T extends string>({
  value,
  onChange,
  options,
  dark,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  dark?: boolean;
}) {
  return (
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3.5 transition",
              on
                ? "bg-signal text-ink"
                : dark
                  ? "bg-white/[0.06] text-white/60 hover:text-white"
                  : "bg-white text-ink/60 ring-1 ring-line hover:text-ink",
            )}
          >
            <span className="board text-[15px] tracking-wide">{o.label}</span>
            {o.count !== undefined && (
              <span className={cn("board rounded-[5px] px-1.5 text-[13px]", on ? "bg-ink text-signal" : dark ? "bg-white/10" : "bg-bone-2")}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Section heading used inside drawers ("consignment note" style). */
export function NoteSection({ n, title, children, className }: { n: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-dashed border-ink/15 pt-5", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span className="board text-xl text-accent">{n}</span>
        <span className="eyebrow text-muted">{title}</span>
      </div>
      {children}
    </section>
  );
}

/** Small CSS barcode. */
export function Barcode({ className }: { className?: string }) {
  return <span aria-hidden className={cn("barcode block h-6 w-16 text-ink/70", className)} />;
}

"use client";
import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Control Tower OS — shared admin primitives.
   Signage (board) type for codes & numbers, Archivo for titles,
   ink / lime / ultramarine as the working palette.
   ───────────────────────────────────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  code,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** short signage code shown before the eyebrow, e.g. "LDS" (derived from the title when omitted) */
  code?: string;
}) {
  const tag = (code ?? title.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 3)).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 border-b border-line pb-5 sm:mb-8 sm:pb-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-muted">
          <span className="board rounded-[6px] bg-ink px-2 py-1 text-[13px] tracking-[0.08em] text-signal">{tag || "OPS"}</span>
          <span className="h-px w-8 bg-ink/20" />
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        </div>
        <span className="barcode hidden h-5 w-20 text-ink/60 sm:block" aria-hidden />
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="display text-[clamp(1.9rem,4.4vw,3rem)] [font-stretch:112%]">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[14px] border border-line bg-white", className)}>{children}</div>;
}

type BtnVariant = "ink" | "accent" | "ghost" | "danger" | "soft";
const btnStyles: Record<BtnVariant, string> = {
  ink: "bg-ink text-white hover:bg-ink-2",
  accent: "bg-accent text-accent-ink hover:brightness-110",
  ghost: "border border-line bg-white text-ink hover:border-ink/30",
  soft: "bg-bone-2 text-ink hover:bg-[#dcdad3]",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

export function Btn({
  variant = "ghost",
  className,
  loading,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean }) {
  const chip = variant === "ink" || variant === "accent";
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cn(
        "group inline-flex h-10 items-center justify-center gap-2 rounded-[10px] text-sm font-medium tracking-tight transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        chip ? "pl-4 pr-1.5" : "px-4",
        btnStyles[variant],
        className,
      )}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
      {chip && !loading && (
        <span
          className={cn(
            "ml-1 grid h-7 w-7 place-items-center rounded-[7px] transition-transform duration-300 group-hover:rotate-45",
            variant === "ink" ? "bg-signal text-ink" : "bg-ink text-signal",
          )}
          aria-hidden
        >
          <ArrowUpRight size={14} strokeWidth={2.4} />
        </span>
      )}
    </button>
  );
}

export function IconBtn({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-[9px] text-ink/70 transition hover:bg-ink hover:text-signal disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/70",
        className,
      )}
    />
  );
}

const tones: Record<string, string> = {
  gray: "bg-bone-2 text-ink/70",
  blue: "bg-tint text-accent",
  amber: "bg-amber-100 text-amber-900",
  violet: "bg-accent/12 text-accent",
  green: "bg-signal text-ink",
  red: "bg-red-100 text-red-700",
  accent: "bg-accent text-accent-ink",
  ink: "bg-ink text-signal",
};

const dots: Record<string, string> = {
  gray: "bg-ink/35",
  blue: "bg-accent",
  amber: "bg-amber-500",
  violet: "bg-accent",
  green: "bg-ink",
  red: "bg-red-500",
  accent: "bg-signal",
  ink: "bg-signal",
};

/** Status tag — signage type with a status lamp. */
export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof tones | string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "board inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] px-2 py-1 text-[12px] tracking-[0.06em]",
        tones[tone] ?? tones.gray,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone] ?? dots.gray)} />
      {children}
    </span>
  );
}

export { LEAD_TONE, SHIPMENT_TONE } from "./tones";

/** Side drawer styled as a consignment ticket. */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-night/50 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-bone shadow-2xl"
          >
            {/* ticket header */}
            <div className="relative bg-ink px-5 pb-5 pt-4 text-white sm:px-7">
              <div className="flex items-center justify-between">
                <span className="eyebrow flex items-center gap-2 text-white/50">
                  <span className="cross text-signal" /> Consignment record
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-[9px] bg-white/10 transition hover:rotate-90 hover:bg-white/20"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="display truncate text-[26px] [font-stretch:108%]">{title}</h2>
                  {subtitle && <p className="mt-1 truncate text-sm text-white/55">{subtitle}</p>}
                </div>
                <span className="barcode hidden h-8 w-24 shrink-0 text-white/70 sm:block" aria-hidden />
              </div>
              {/* perforation */}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-[6px] h-3 bg-[radial-gradient(circle_at_6px_6px,var(--bone)_5px,transparent_5.5px)] bg-[length:14px_12px] bg-repeat-x"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7" data-lenis-prevent>
              {children}
            </div>
            {footer && <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-ink/20 px-5 py-4 sm:px-7">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Scanning-bar loader with a signage label. */
export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="w-56 text-center">
        <div className="board text-xl tracking-[0.08em] text-ink">{label}…</div>
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <motion.span
            className="absolute inset-y-0 w-1/3 rounded-full bg-accent"
            animate={{ x: ["-110%", "320%"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="eyebrow mt-3 text-muted">Querying control tower</div>
      </div>
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="relative grid place-items-center overflow-hidden rounded-[14px] border-2 border-dashed border-ink/15 px-6 py-14 text-center">
      <span className="board pointer-events-none absolute -bottom-6 right-2 text-[7rem] leading-none text-ink/[0.04]" aria-hidden>
        000
      </span>
      <span className="board rounded-[5px] bg-bone-2 px-2 py-1 text-[12px] tracking-[0.1em] text-muted">No records</span>
      <div className="display mt-3 text-xl [font-stretch:105%]">{title}</div>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="eyebrow text-ink/70">{children}</span>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-sm"
    >
      <span className={cn("relative h-[26px] w-[48px] rounded-[8px] transition-colors", checked ? "bg-ink" : "bg-ink/15")}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn("absolute top-[3px] h-5 w-5 rounded-[6px] shadow", checked ? "right-[3px] bg-signal" : "left-[3px] bg-white")}
        />
      </span>
      {label && <span>{label}</span>}
      <span className={cn("board text-[11px] tracking-[0.1em]", checked ? "text-ink" : "text-muted")}>{checked ? "On" : "Off"}</span>
    </button>
  );
}

export function Search({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative flex h-10 items-center sm:w-64">
      <span className="board pointer-events-none absolute left-3 text-[13px] tracking-[0.06em] text-accent" aria-hidden>
        &gt;_
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field !h-10 !rounded-[10px] !py-0 !pl-9"
        type="search"
      />
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
}) {
  const id = useId();
  return (
    <div className="inline-flex rounded-[11px] bg-ink p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative flex h-8 items-center gap-1.5 rounded-[8px] px-3.5 text-[13px] font-medium transition",
            value === o.value ? "text-ink" : "text-white/60 hover:text-white",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-[8px] bg-signal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
          )}
          <span className="relative flex items-center gap-1.5">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Small panel title used across the OS (new). */
export function PanelTitle({ code, title, aside }: { code: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="board text-[13px] tracking-[0.08em] text-accent">{code}</span>
        <h2 className="board text-[19px] tracking-[0.04em]">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

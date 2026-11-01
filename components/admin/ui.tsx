"use client";
import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="eyebrow mb-2 text-muted">{eyebrow}</div>}
        <h1 className="text-[28px] font-semibold tracking-[-0.035em] sm:text-[34px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-white", className)}>{children}</div>;
}

type BtnVariant = "ink" | "accent" | "ghost" | "danger" | "soft";
const btnStyles: Record<BtnVariant, string> = {
  ink: "bg-ink text-white hover:bg-ink-2",
  accent: "bg-accent text-accent-ink hover:brightness-105",
  ghost: "border border-line bg-white text-ink hover:border-ink/25",
  soft: "bg-bone-2 text-ink hover:bg-[#e2ded5]",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

export function Btn({
  variant = "ghost",
  className,
  loading,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium tracking-tight transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        btnStyles[variant],
        className,
      )}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function IconBtn({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/70 transition hover:bg-bone-2 hover:text-ink disabled:opacity-30",
        className,
      )}
    />
  );
}

const tones: Record<string, string> = {
  gray: "bg-bone-2 text-ink/70",
  blue: "bg-sky-100 text-sky-800",
  amber: "bg-amber-100 text-amber-800",
  violet: "bg-violet-100 text-violet-800",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-700",
  accent: "bg-accent/15 text-ink",
  ink: "bg-ink text-white",
};

export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof tones | string; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium", tones[tone] ?? tones.gray, className)}>
      {children}
    </span>
  );
}

export { LEAD_TONE, SHIPMENT_TONE } from "./tones";

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
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
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
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-bone shadow-2xl sm:rounded-l-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
              </div>
              <IconBtn onClick={onClose} aria-label="Close">
                <X size={18} />
              </IconBtn>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7" data-lenis-prevent>
              {children}
            </div>
            {footer && <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4 sm:px-7">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[40vh] place-items-center text-sm text-muted">
      <div className="flex items-center gap-2">
        <Loader2 size={16} className="animate-spin" />
        {label}…
      </div>
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-ink/15 px-6 py-14 text-center">
      <div className="text-base font-medium">{title}</div>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[13px] font-medium text-ink/80">{children}</span>
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
      <span className={cn("relative h-[26px] w-[44px] rounded-full transition-colors", checked ? "bg-ink" : "bg-ink/15")}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn("absolute top-[3px] h-5 w-5 rounded-full shadow", checked ? "right-[3px] bg-accent" : "left-[3px] bg-white")}
        />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

export function Search({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="field !h-10 !rounded-full !py-0 sm:!w-64"
      type="search"
    />
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
    <div className="inline-flex rounded-full bg-bone-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition",
            value === o.value ? "text-ink" : "text-ink/55 hover:text-ink",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
          )}
          <span className="relative flex items-center gap-1.5">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

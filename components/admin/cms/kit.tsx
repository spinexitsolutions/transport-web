"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   CMS kit — "Control Tower OS" primitives shared by every editor.
   ───────────────────────────────────────────────────────────── */

/** Hairline input skin used by every CMS field. */
export const INPUT =
  "w-full rounded-[10px] border border-ink/15 bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink/30 hover:border-ink/30 focus:border-accent focus:ring-4 focus:ring-accent/10";

export const recordCode = (singular: string, n: number) => `${singular.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase() || "REC"}-${String(n).padStart(3, "0")}`;

/** Page header: manifest strip + display title + actions. */
export function CmsHeader({
  code,
  eyebrow = "Content",
  title,
  description,
  meta,
  actions,
}: {
  code: string;
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between gap-3 border-y border-ink/10 py-2">
        <div className="eyebrow flex min-w-0 items-center gap-2.5 text-muted">
          <span className="cross shrink-0 text-accent" />
          <span className="truncate">CMS · {eyebrow}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="board text-[15px] leading-none text-ink">{code}</span>
          <span className="barcode hidden h-5 w-16 text-ink/70 sm:block" aria-hidden />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="display text-[clamp(2rem,4.4vw,3.4rem)]">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** Small signage chip used in header meta rows. */
export function MetaChip({ children, tone = "paper" }: { children: React.ReactNode; tone?: "paper" | "ink" | "lime" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium",
        tone === "paper" && "border border-ink/10 bg-white text-ink/70",
        tone === "ink" && "bg-ink text-white",
        tone === "lime" && "bg-signal text-ink",
        tone === "accent" && "bg-accent text-white",
      )}
    >
      {children}
    </span>
  );
}

/** Header action button (outline pill). */
export function HeaderBtn({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-[13.5px] font-medium transition hover:border-ink hover:bg-ink hover:text-white active:scale-[0.97]",
        className,
      )}
    />
  );
}

export const headerLinkCls =
  "inline-flex h-10 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-[13.5px] font-medium transition hover:border-ink hover:bg-ink hover:text-white";

/** Sync status chip shown in headers. */
export function SyncChip({ dirty }: { dirty: boolean }) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition", dirty ? "bg-accent text-white" : "bg-signal text-ink")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dirty ? "animate-pulse bg-signal" : "bg-ink")} />
      {dirty ? "Unsaved edits" : "Live on site"}
    </span>
  );
}

/** Floating save dock — slides up from the bottom whenever there are unsaved edits. */
export function SaveDock({
  dirty,
  saving,
  onSave,
  onDiscard,
  label = "Unsaved changes",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  label?: string;
}) {
  return (
    <AnimatePresence>
      {(dirty || saving) && (
        <motion.div
          key="dock"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-[84px] z-[75] mx-auto max-w-xl lg:bottom-6 lg:left-[264px] lg:right-0 lg:px-6"
          role="status"
        >
          <div className="flex items-center gap-2 rounded-[18px] bg-ink p-2 pl-4 text-white shadow-[0_24px_60px_-18px_rgba(8,10,20,.65)] ring-1 ring-white/10">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-signal" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="board text-[15px] leading-none tracking-wide">{saving ? "Transmitting…" : label}</div>
              <div className="mt-0.5 hidden truncate text-[11px] text-white/50 sm:block">Saving publishes straight to the live website.</div>
            </div>
            {onDiscard && (
              <button
                type="button"
                onClick={onDiscard}
                disabled={saving}
                className="inline-flex h-10 items-center gap-1.5 rounded-[12px] px-3 text-[13px] text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <RotateCcw size={14} /> <span className="hidden sm:inline">Discard</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-signal px-4 text-[13.5px] font-semibold text-ink transition hover:brightness-95 active:scale-[0.97] disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Numbered panel: board-font index on the left rail, content on the right. */
export function Panel({
  index,
  title,
  description,
  children,
  className,
  tone = "white",
}: {
  index?: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "white" | "tint" | "ink";
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[18px] border",
        tone === "white" && "border-ink/10 bg-white",
        tone === "tint" && "border-transparent bg-tint",
        tone === "ink" && "border-transparent bg-ink text-white",
        className,
      )}
    >
      <div className={cn("flex items-start gap-4 border-b px-4 py-4 sm:px-6", tone === "ink" ? "border-white/10" : "border-ink/10")}>
        {index !== undefined && (
          <span className={cn("board text-[34px] leading-[0.8]", tone === "ink" ? "text-signal" : "text-accent")}>{String(index).padStart(2, "0")}</span>
        )}
        <div className="min-w-0">
          <h2 className="display text-[18px] [font-stretch:110%]">{title}</h2>
          {description && <p className={cn("mt-1 text-[13px]", tone === "ink" ? "text-white/55" : "text-muted")}>{description}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

/** Lime/ink switch. */
export function Switch({ checked, onChange, label, size = "md" }: { checked: boolean; onChange: (v: boolean) => void; label?: string; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2.5 text-[13.5px]">
      <span
        className={cn(
          "relative shrink-0 rounded-full transition-colors duration-300",
          sm ? "h-[22px] w-[38px]" : "h-[28px] w-[50px]",
          checked ? "bg-ink" : "bg-ink/12 ring-1 ring-inset ring-ink/15",
        )}
      >
        <motion.span
          className={cn("absolute top-[3px] grid place-items-center rounded-full shadow-sm", sm ? "h-4 w-4" : "h-[22px] w-[22px]", checked ? "bg-signal" : "bg-white")}
          animate={{ left: checked ? (sm ? 19 : 25) : 3 }}
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
        >
          {checked && !sm && <Check size={12} strokeWidth={3} className="text-ink" />}
        </motion.span>
      </span>
      {label && <span className={cn("font-medium", checked ? "text-ink" : "text-muted")}>{label}</span>}
    </button>
  );
}

/** Field label in eyebrow style. */
export function FieldLabel({ children, hint, htmlFor }: { children: React.ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="eyebrow text-ink/70">
        {children}
      </label>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </div>
  );
}

/** Square toolbar button. */
export function ToolBtn({ className, danger, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-ink/60 transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30",
        danger && "hover:!bg-red-600",
        className,
      )}
    />
  );
}

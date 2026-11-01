"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ChevronDown, ImageIcon, LibraryBig, Plus, X } from "lucide-react";
import { IMAGE_LIBRARY } from "@/lib/seed";
import { Icon, ICON_CHOICES } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { FieldLabel, INPUT, Switch, ToolBtn } from "./cms/kit";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "toggle"
  | "select"
  | "color"
  | "image"
  | "icon"
  | "stringList"
  | "date";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  rows?: number;
  half?: boolean;
  step?: number;
};

export type Row = Record<string, unknown>;

const thumb = (url: string, w = 320) => url.replace(/w=\d+/, `w=${w}`);

/* ───────── atomic inputs ───────── */

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <div className="flex items-stretch gap-3">
      <label
        className="relative h-[72px] w-[72px] shrink-0 cursor-pointer overflow-hidden rounded-[14px] shadow-[inset_0_0_0_1px_rgba(11,13,23,.12)] transition hover:scale-[1.03]"
        style={{ background: valid ? value : "#ffffff" }}
        title="Pick colour"
      >
        <input type="color" value={valid ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-white/80 ring-1 ring-black/10" />
      </label>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <input className={cn(INPUT, "board !text-[18px] tracking-wide")} value={value} onChange={(e) => onChange(e.target.value)} maxLength={9} spellCheck={false} />
        <div className="flex gap-1.5">
          {["#3a2eff", "#d4ff3f", "#0b0d17", "#ffffff", "#ff5a1f"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              title={c}
              className={cn("h-6 flex-1 rounded-md shadow-[inset_0_0_0_1px_rgba(11,13,23,.12)] transition hover:-translate-y-0.5", value.toLowerCase() === c && "ring-2 ring-accent ring-offset-2")}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryModal({ value, onPick, onClose }: { value: string; onPick: (url: string) => void; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-end justify-center bg-night/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[86dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[22px] bg-bone sm:rounded-[22px]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 bg-ink px-5 py-4 text-white">
          <div>
            <div className="eyebrow text-white/50">Asset library</div>
            <div className="board mt-1 text-[24px] leading-none">{IMAGE_LIBRARY.length} images on file</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:rotate-90 hover:bg-white/20" aria-label="Close library">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-3 sm:gap-3 sm:p-5 lg:grid-cols-4" data-lenis-prevent>
          {IMAGE_LIBRARY.map((img, i) => {
            const active = value === img.url;
            return (
              <motion.button
                key={img.name}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
                onClick={() => onPick(img.url)}
                className={cn("group relative aspect-[4/3] overflow-hidden rounded-[12px] bg-bone-2 ring-2 ring-transparent transition", active ? "ring-accent" : "hover:ring-ink/40")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(img.url, 360)} alt={img.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-left">
                  <span className="board text-[13px] tracking-wide text-white">{String(i + 1).padStart(2, "0")} · {img.name}</span>
                  {active && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-signal text-ink">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2.5">
      <div className="group relative aspect-[16/9] overflow-hidden rounded-[14px] bg-bone-2 shadow-[inset_0_0_0_1px_rgba(11,13,23,.1)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {value ? (
            <motion.img
              key={value}
              src={thumb(value, 1000)}
              alt=""
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <motion.div key="empty" className="absolute inset-0 grid place-items-center text-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={26} />
                <span className="eyebrow">No image</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-2.5 pt-10">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-medium text-ink shadow transition hover:bg-signal"
          >
            <LibraryBig size={14} /> Library
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-red-600" aria-label="Clear image">
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <input className={cn(INPUT, "!py-2 text-[12.5px] text-ink/70")} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image URL — https://images.unsplash.com/…" spellCheck={false} />
      <AnimatePresence>
        {open && (
          <LibraryModal
            value={value}
            onClose={() => setOpen(false)}
            onPick={(url) => {
              onChange(url);
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function IconInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1.5 xs:grid-cols-6 sm:grid-cols-9">
      {ICON_CHOICES.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            title={n}
            onClick={() => onChange(n)}
            className={cn(
              "relative grid aspect-square place-items-center rounded-[12px] transition",
              active ? "bg-accent text-white shadow-[0_10px_24px_-10px_var(--accent)]" : "bg-white text-ink/60 shadow-[inset_0_0_0_1px_rgba(11,13,23,.1)] hover:-translate-y-0.5 hover:text-ink",
            )}
          >
            <Icon name={n} size={19} strokeWidth={1.8} />
            {active && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-signal" />}
          </button>
        );
      })}
    </div>
  );
}

export function StringListInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    if (!draft.trim()) return;
    onChange([...value, draft.trim()]);
    setDraft("");
  };
  return (
    <div className="overflow-hidden rounded-[12px] border border-ink/15 bg-white">
      <AnimatePresence initial={false}>
        {value.map((v, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 border-b border-ink/10 pr-1"
          >
            <span className="board w-10 shrink-0 self-stretch border-r border-ink/10 py-2.5 text-center text-[17px] leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
            <input
              className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[14px] outline-none"
              value={v}
              onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))}
            />
            <ToolBtn onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
              <ArrowUp size={14} />
            </ToolBtn>
            <ToolBtn onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
              <ArrowDown size={14} />
            </ToolBtn>
            <ToolBtn danger onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove">
              <X size={14} />
            </ToolBtn>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex items-center gap-1 bg-bone/60 pr-1">
        <span className="board w-10 shrink-0 text-center text-[17px] leading-none text-ink/25">{String(value.length + 1).padStart(2, "0")}</span>
        <input
          className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[14px] outline-none placeholder:text-ink/35"
          value={draft}
          placeholder={placeholder ?? "Add an item and press Enter"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-ink text-white transition hover:bg-accent" aria-label="Add item">
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

const toDateInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

export function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="datetime-local"
      className={INPUT}
      value={toDateInput(value)}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
    />
  );
}

/* ───────── schema-driven field ───────── */

export function FieldInput({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const str = typeof value === "string" ? value : value == null ? "" : String(value);
  switch (def.type) {
    case "textarea":
      return <textarea className={cn(INPUT, "resize-y leading-relaxed")} rows={def.rows ?? 4} value={str} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <input
          type="number"
          className={cn(INPUT, "board !text-[20px] tracking-wide")}
          step={def.step ?? "any"}
          value={typeof value === "number" ? value : str}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      );
    case "toggle":
      return (
        <div className="flex h-[46px] items-center">
          <Switch checked={Boolean(value)} onChange={onChange} label={value ? "On" : "Off"} />
        </div>
      );
    case "select":
      return (
        <div className="relative">
          <select className={cn(INPUT, "appearance-none pr-10")} value={str} onChange={(e) => onChange(e.target.value)}>
            {def.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
        </div>
      );
    case "color":
      return <ColorInput value={str} onChange={onChange} />;
    case "image":
      return <ImageInput value={str} onChange={onChange} />;
    case "icon":
      return <IconInput value={str} onChange={onChange} />;
    case "stringList":
      return <StringListInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} placeholder={def.placeholder} />;
    case "date":
      return <DateInput value={str} onChange={onChange} />;
    default:
      return <input className={INPUT} value={str} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function FieldGrid({ fields, row, onChange }: { fields: FieldDef[]; row: Row; onChange: (name: string, v: unknown) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      {fields.map((f) => (
        <div key={f.name} className={f.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
          <FieldLabel hint={f.hint}>{f.label}</FieldLabel>
          <FieldInput def={f} value={row[f.name]} onChange={(v) => onChange(f.name, v)} />
        </div>
      ))}
    </div>
  );
}

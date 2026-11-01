"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ImageIcon, Plus, X } from "lucide-react";
import { IMAGE_LIBRARY } from "@/lib/seed";
import { Icon, ICON_CHOICES } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { IconBtn, Label, Toggle } from "./ui";

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

/* ───────── atomic inputs ───────── */

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line" style={{ background: value }}>
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
      <input className="field font-mono uppercase" value={value} onChange={(e) => onChange(e.target.value)} maxLength={9} />
    </div>
  );
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex gap-3">
        <div className="relative h-[72px] w-[104px] shrink-0 overflow-hidden rounded-xl border border-line bg-bone-2">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-ink/30">
              <ImageIcon size={20} />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input className="field !py-2 text-[13px]" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://images.unsplash.com/…" />
          <button type="button" onClick={() => setOpen((o) => !o)} className="self-start text-[13px] font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline">
            {open ? "Close library" : "Choose from library"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-xl bg-bone-2 p-2 sm:grid-cols-4" data-lenis-prevent>
              {IMAGE_LIBRARY.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  title={img.name}
                  onClick={() => {
                    onChange(img.url);
                    setOpen(false);
                  }}
                  className={cn("relative aspect-[4/3] overflow-hidden rounded-lg ring-2 ring-transparent transition hover:ring-ink/40", value === img.url && "ring-accent")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url.replace("w=1600", "w=240")} alt={img.name} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IconInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
      {ICON_CHOICES.map((n) => (
        <button
          key={n}
          type="button"
          title={n}
          onClick={() => onChange(n)}
          className={cn(
            "grid aspect-square place-items-center rounded-xl border transition",
            value === n ? "border-ink bg-ink text-accent" : "border-line bg-white text-ink/70 hover:border-ink/30",
          )}
        >
          <Icon name={n} size={18} strokeWidth={1.8} />
        </button>
      ))}
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
    <div className="space-y-1.5">
      {value.map((v, i) => (
        <div key={i} className="flex items-center gap-1 rounded-xl border border-line bg-white pl-3">
          <input
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
            value={v}
            onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))}
          />
          <IconBtn onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
            <ArrowUp size={14} />
          </IconBtn>
          <IconBtn onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
            <ArrowDown size={14} />
          </IconBtn>
          <IconBtn onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove">
            <X size={14} />
          </IconBtn>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          className="field !py-2 text-sm"
          value={draft}
          placeholder={placeholder ?? "Add item and press Enter"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-ink text-white">
          <Plus size={16} />
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
      className="field"
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
      return <textarea className="field resize-y leading-relaxed" rows={def.rows ?? 4} value={str} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <input
          type="number"
          className="field"
          step={def.step ?? "any"}
          value={typeof value === "number" ? value : str}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      );
    case "toggle":
      return <Toggle checked={Boolean(value)} onChange={onChange} label={value ? "On" : "Off"} />;
    case "select":
      return (
        <select className="field appearance-none" value={str} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
      return <input className="field" value={str} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function FieldGrid({ fields, row, onChange }: { fields: FieldDef[]; row: Row; onChange: (name: string, v: unknown) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((f) => (
        <div key={f.name} className={f.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
          <Label hint={f.hint}>{f.label}</Label>
          <FieldInput def={f} value={row[f.name]} onChange={(v) => onChange(f.name, v)} />
        </div>
      ))}
    </div>
  );
}

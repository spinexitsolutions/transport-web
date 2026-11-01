"use client";
import { ArrowDown, ArrowUp, ArrowUpRight, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { SingletonEditor } from "./SingletonEditor";
import type { Row } from "./fields";
import { INPUT, ToolBtn } from "./cms/kit";
import { cn } from "@/lib/utils";

type Social = { label: string; url: string };

function SocialsInput({ value, onChange }: { value: Social[]; onChange: (v: Social[]) => void }) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="grid grid-cols-[40px_1fr] items-start gap-2 rounded-[14px] border border-ink/10 bg-bone/50 p-2 sm:grid-cols-[40px_160px_1fr_auto] sm:items-center">
          <span className="board grid h-10 place-items-center rounded-[10px] bg-ink text-[17px] leading-none text-signal">{String(i + 1).padStart(2, "0")}</span>
          <input className={cn(INPUT, "!py-2")} placeholder="Label" value={s.label} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
          <input className={cn(INPUT, "col-start-2 !py-2 sm:col-start-auto")} placeholder="https://" value={s.url} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))} />
          <div className="col-start-2 flex justify-end sm:col-start-auto">
            <ToolBtn onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
              <ArrowUp size={14} />
            </ToolBtn>
            <ToolBtn onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
              <ArrowDown size={14} />
            </ToolBtn>
            <ToolBtn danger onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove">
              <X size={14} />
            </ToolBtn>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { label: "", url: "" }])}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-dashed border-ink/25 px-4 text-[13px] font-medium transition hover:border-ink hover:bg-ink hover:text-white"
      >
        <Plus size={14} /> Add social link
      </button>
    </div>
  );
}

const LIME = "#d4ff3f";

/** Live brand preview that mimics the public site: route rail + hero snippet. */
function BrandPreview({ v }: { v: Row }) {
  const accent = String(v.accent || "#3a2eff");
  const onAccent = String(v.accentInk || "#ffffff");
  const brand = String(v.brandName || "Brand");
  const swatches: [string, string][] = [
    ["Accent", accent],
    ["On accent", onAccent],
    ["Signal", LIME],
    ["Ink", "#0b0d17"],
    ["Paper", "#efeeea"],
  ];
  return (
    <div className="overflow-hidden rounded-[18px] border border-ink/10 bg-white">
      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <span className="eyebrow flex items-center gap-2 text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live preview
        </span>
        <span className="board text-[13px] leading-none text-ink/50">{brand.slice(0, 3).toUpperCase()}-WEB</span>
      </div>

      {/* site mock: rail + hero */}
      <div className="flex h-[250px] bg-bone">
        <div className="flex w-11 shrink-0 flex-col items-center bg-[#0b0d17] py-2.5">
          <span className="relative grid h-7 w-7 place-items-center rounded-[8px] text-[11px] font-bold" style={{ background: accent, color: onAccent }}>
            {brand.charAt(0)}
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-[#0b0d17]" style={{ background: LIME }} />
          </span>
          <div className="relative my-3 w-px flex-1 bg-white/20">
            <motion.span className="absolute left-0 top-0 w-px" style={{ background: LIME }} animate={{ height: ["10%", "70%", "10%"] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            {[15, 38, 60, 82].map((t) => (
              <span key={t} className="absolute left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/50" style={{ top: `${t}%` }} />
            ))}
          </div>
          <span className="flex flex-col gap-[3px]">
            <span className="h-[2px] w-3.5 bg-white" />
            <span className="h-[2px] w-2 rounded" style={{ background: LIME }} />
          </span>
        </div>
        <div className="relative min-w-0 flex-1 p-3.5">
          <div className="flex justify-end gap-1.5">
            <span className="rounded-full bg-white px-2 py-1 text-[9px] font-medium ring-1 ring-black/5">Track</span>
            <span className="flex items-center gap-1 rounded-full py-1 pl-2 pr-1 text-[9px] font-medium" style={{ background: accent, color: onAccent }}>
              Get a quote
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full text-[#0b0d17]" style={{ background: LIME }}>
                <ArrowUpRight size={8} />
              </span>
            </span>
          </div>
          <div className="mt-2 border-y border-black/10 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-black/45">In motion 1,284 · On-time 99.4%</div>
          <div className="display mt-3 text-[25px] leading-[0.92] text-[#0b0d17]">
            Freight that
            <br />
            <span className="mr-1 inline-block h-[0.7em] w-[1.7em] translate-y-[0.06em] overflow-hidden rounded-full bg-cover bg-center align-baseline" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=200&q=60)" }} />
            moves by
            <br />
            <span style={{ color: accent }}>road.</span>
          </div>
          <p className="mt-2 line-clamp-2 max-w-[90%] text-[10px] leading-snug text-black/55">{String(v.tagline || "")}</p>
          {String(v.announcement || "") && (
            <div className="absolute bottom-2.5 left-3.5 right-3.5 truncate rounded-full bg-white px-2.5 py-1 text-[9px] ring-1 ring-black/5">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: accent }} /> {String(v.announcement)}
            </div>
          )}
        </div>
      </div>

      {/* palette */}
      <div className="grid grid-cols-5 border-t border-ink/10">
        {swatches.map(([name, c]) => (
          <div key={name} className="border-r border-ink/10 last:border-r-0">
            <motion.div key={c} initial={{ scaleY: 0.4, opacity: 0.4 }} animate={{ scaleY: 1, opacity: 1 }} className="h-14 origin-bottom" style={{ background: c }} />
            <div className="px-1.5 py-2 text-center">
              <div className="eyebrow text-[8px] text-muted">{name}</div>
              <div className="board mt-0.5 text-[11px] leading-none">{c.replace("#", "")}</div>
            </div>
          </div>
        ))}
      </div>

      {/* footer wordmark */}
      <div className="flex items-end justify-between bg-[#080a14] px-4 pb-2 pt-3 text-white">
        <span className="board text-[44px] leading-[0.8]">
          {brand.slice(0, -1).toUpperCase()}
          <span style={{ color: LIME }}>{brand.slice(-1).toUpperCase()}</span>
        </span>
        <span className="pb-1 text-[10px] text-white/45">{String(v.brandSuffix || "")}</span>
      </div>
    </div>
  );
}

export function SettingsEditor() {
  return (
    <SingletonEditor
      dbKey="settings"
      code="SYS-01"
      eyebrow="Brand system"
      title="Site & brand"
      description="Brand identity, colours, contact details and SEO. Changes apply across the whole website instantly."
      aside={(v) => <BrandPreview v={v} />}
      sections={[
        {
          title: "Brand",
          description: "Name, colours and the lines that follow you around the site.",
          fields: [
            { name: "brandName", label: "Brand name", type: "text", half: true },
            { name: "brandSuffix", label: "Suffix", type: "text", half: true, placeholder: "Logistics" },
            { name: "tagline", label: "Tagline", type: "text" },
            { name: "accent", label: "Accent colour", type: "color", half: true },
            { name: "accentInk", label: "Text on accent", type: "color", half: true },
            { name: "announcement", label: "Navbar announcement", type: "text", hint: "leave empty to hide" },
            { name: "footerNote", label: "Footer note", type: "text" },
          ],
        },
        {
          title: "Contact",
          description: "Shown in the menu, footer, contact page and quote confirmations.",
          fields: [
            { name: "email", label: "Email", type: "text", half: true },
            { name: "phone", label: "Phone", type: "text", half: true },
            { name: "whatsapp", label: "WhatsApp", type: "text", half: true },
            { name: "hours", label: "Hours", type: "text", half: true },
            { name: "address", label: "Address", type: "textarea", rows: 2 },
          ],
        },
        {
          title: "Social links",
          description: "Order here is the order on the site.",
          custom: (v, set) => <SocialsInput value={(v.socials as Social[]) ?? []} onChange={(x) => set("socials", x)} />,
        },
        {
          title: "SEO",
          description: "Used for search results and link previews.",
          fields: [
            { name: "seoTitle", label: "Meta title", type: "text" },
            { name: "seoDescription", label: "Meta description", type: "textarea", rows: 3 },
          ],
        },
      ]}
    />
  );
}

"use client";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { SingletonEditor } from "./SingletonEditor";
import type { Row } from "./fields";
import { IconBtn } from "./ui";

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
        <div key={i} className="flex flex-col gap-2 rounded-2xl border border-line p-2 sm:flex-row sm:items-center sm:p-1.5">
          <input className="field !py-2 sm:!w-40" placeholder="Label" value={s.label} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
          <input className="field !py-2" placeholder="https://" value={s.url} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))} />
          <div className="flex justify-end">
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
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { label: "", url: "" }])} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bone-2 px-3.5 text-[13px] font-medium">
        <Plus size={14} /> Add social link
      </button>
    </div>
  );
}

function BrandPreview({ v }: { v: Row }) {
  const accent = String(v.accent || "#3a2eff");
  const ink = String(v.accentInk || "#0b0b0c");
  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-white">
      <div className="eyebrow border-b border-line px-5 py-3 text-muted">Live preview</div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between rounded-full bg-ink/90 py-1.5 pl-4 pr-1.5 text-white">
          <span className="text-[13px] font-semibold tracking-tight">
            {String(v.brandName)}
            <span className="font-normal text-white/50"> {String(v.brandSuffix)}</span>
          </span>
          <span className="rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ background: accent, color: ink }}>
            Get quote
          </span>
        </div>
        <div className="rounded-2xl bg-bone p-5">
          <div className="display text-[34px]">
            Move what <span className="hl-soft" style={{ color: accent }}>matters.</span>
          </div>
          <p className="mt-2 text-[13px] text-muted">{String(v.tagline)}</p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full px-4 py-2 text-[13px] font-medium" style={{ background: accent, color: ink }}>
              Primary
            </span>
            <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white">Secondary</span>
          </div>
        </div>
        <div className="flex gap-2">
          {[accent, ink, "#0b0b0c", "#f3f1ec"].map((c, i) => (
            <div key={i} className="flex-1">
              <div className="h-10 rounded-xl border border-line" style={{ background: c }} />
              <div className="mt-1 text-center font-mono text-[10px] uppercase text-muted">{c}</div>
            </div>
          ))}
        </div>
        {String(v.announcement || "") && (
          <div className="rounded-full bg-bone-2 px-3 py-2 text-center text-[12px]">📣 {String(v.announcement)}</div>
        )}
      </div>
    </div>
  );
}

export function SettingsEditor() {
  return (
    <SingletonEditor
      dbKey="settings"
      title="Site & brand"
      description="Brand identity, colours, contact details and SEO. Changes apply across the whole website instantly."
      aside={(v) => <BrandPreview v={v} />}
      sections={[
        {
          title: "Brand",
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

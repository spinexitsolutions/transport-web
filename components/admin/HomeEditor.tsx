"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, GripVertical } from "lucide-react";
import type { HeroContent, HomeContent, HomeSection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getKey, putKey } from "./api";
import { SaveBar, useUnsavedWarning } from "./CollectionEditor";
import { FieldGrid, type FieldDef, type Row } from "./fields";
import { useToast } from "./Toast";
import { IconBtn, Loading, PageHeader, Toggle } from "./ui";

const HERO_FIELDS: FieldDef[] = [
  { name: "eyebrow", label: "Eyebrow", type: "text" },
  { name: "titleLine1", label: "Title — line 1", type: "text", half: true },
  { name: "titleAccent", label: "Accent word (serif italic)", type: "text", half: true },
  { name: "titleLine2", label: "Title — line 2", type: "text" },
  { name: "subtitle", label: "Subtitle", type: "textarea", rows: 3 },
  { name: "primaryCta", label: "Primary button", type: "text", half: true },
  { name: "secondaryCta", label: "Secondary button", type: "text", half: true },
  { name: "image", label: "Hero image", type: "image" },
];

const HOME_FIELDS: FieldDef[] = [
  { name: "statement", label: "Scroll statement", type: "textarea", rows: 4, hint: "Words light up as visitors scroll" },
  { name: "ctaTitle", label: "Final CTA title", type: "text" },
  { name: "ctaSubtitle", label: "Final CTA subtitle", type: "text" },
];

export function HomeEditor() {
  const toast = useToast();
  const [orig, setOrig] = useState<{ hero: HeroContent; home: HomeContent } | null>(null);
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [home, setHome] = useState<HomeContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getKey("hero"), getKey("home")])
      .then(([h, m]) => {
        setOrig({ hero: h, home: m });
        setHero(h);
        setHome(m);
      })
      .catch((e: Error) => toast(e.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = useMemo(() => !!orig && JSON.stringify(orig) !== JSON.stringify({ hero, home }), [orig, hero, home]);
  useUnsavedWarning(dirty);

  if (!orig || !hero || !home) return <Loading label="Loading homepage" />;

  const save = async () => {
    setSaving(true);
    try {
      const [h, m] = await Promise.all([putKey("hero", hero), putKey("home", home)]);
      setOrig({ hero: h, home: m });
      toast("Homepage saved — live on the site");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const setSections = (sections: HomeSection[]) => setHome({ ...home, sections });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= home.sections.length || from === to) return;
    const next = [...home.sections];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setSections(next);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Homepage"
        description="Edit the hero, the scroll statement and the final call-to-action — then reorder or hide any section of the homepage."
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium hover:border-ink/25">
              <ExternalLink size={15} /> Preview
            </a>
            <SaveBar
              dirty={dirty}
              saving={saving}
              onSave={save}
              onDiscard={() => {
                setHero(orig.hero);
                setHome(orig.home);
              }}
            />
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <section className="rounded-[22px] border border-line bg-white p-4 sm:p-6">
            <h2 className="text-[17px] font-semibold tracking-tight">Hero</h2>
            <p className="mb-5 mt-0.5 text-[13px] text-muted">The first thing every visitor sees.</p>
            {/* live mini preview */}
            <div className="relative mb-6 overflow-hidden rounded-2xl bg-night p-5 text-white sm:p-7">
              {hero.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
              )}
              <div className="relative">
                <div className="eyebrow text-white/60">{hero.eyebrow}</div>
                <div className="display mt-3 text-[clamp(1.8rem,4vw,3rem)]">
                  {hero.titleLine1} <span className="serif text-accent">{hero.titleAccent}</span>
                  <br />
                  {hero.titleLine2}
                </div>
                <p className="mt-3 max-w-md text-[13px] text-white/70">{hero.subtitle}</p>
                <div className="mt-4 flex gap-2 text-[12px]">
                  <span className="rounded-full bg-accent px-3 py-1.5 font-medium text-accent-ink">{hero.primaryCta}</span>
                  <span className="rounded-full px-3 py-1.5 ring-1 ring-white/30">{hero.secondaryCta}</span>
                </div>
              </div>
            </div>
            <FieldGrid fields={HERO_FIELDS} row={hero as unknown as Row} onChange={(n, v) => setHero({ ...hero, [n]: v })} />
          </section>

          <section className="rounded-[22px] border border-line bg-white p-4 sm:p-6">
            <h2 className="mb-5 text-[17px] font-semibold tracking-tight">Statement & call-to-action</h2>
            <FieldGrid fields={HOME_FIELDS} row={home as unknown as Row} onChange={(n, v) => setHome({ ...home, [n]: v })} />
          </section>
        </div>

        <section className="self-start rounded-[22px] border border-line bg-white p-4 sm:p-6 xl:sticky xl:top-6">
          <h2 className="text-[17px] font-semibold tracking-tight">Sections</h2>
          <p className="mb-4 mt-0.5 text-[13px] text-muted">Drag to reorder. Toggle to show or hide.</p>
          <ol className="space-y-1.5">
            {home.sections.map((s, i) => (
              <li
                key={s.id}
                draggable
                onDragStart={(e) => {
                  setDragIdx(i);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragIdx !== null && dragIdx !== i) {
                    move(dragIdx, i);
                    setDragIdx(i);
                  }
                }}
                onDragEnd={() => setDragIdx(null)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border bg-white py-1.5 pl-2 pr-1.5 transition",
                  dragIdx === i ? "border-accent shadow-lg" : "border-line",
                  !s.enabled && "opacity-55",
                )}
              >
                <GripVertical size={16} className="hidden shrink-0 cursor-grab text-ink/30 sm:block" />
                <span className="w-5 shrink-0 text-center font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{s.label}</span>
                <IconBtn onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                  <ArrowUp size={14} />
                </IconBtn>
                <IconBtn onClick={() => move(i, i + 1)} disabled={i === home.sections.length - 1} aria-label="Move down">
                  <ArrowDown size={14} />
                </IconBtn>
                <Toggle checked={s.enabled} onChange={(v) => setSections(home.sections.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)))} />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

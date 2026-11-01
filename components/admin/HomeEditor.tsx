"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink, GripVertical } from "lucide-react";
import type { HeroContent, HomeContent, HomeSection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getKey, putKey } from "./api";
import { SaveBar, useUnsavedWarning } from "./CollectionEditor";
import { FieldGrid, ImageInput, type FieldDef, type Row } from "./fields";
import { useToast } from "./Toast";
import { Loading } from "./ui";
import { CmsHeader, FieldLabel, MetaChip, Panel, Switch, ToolBtn, headerLinkCls } from "./cms/kit";

const HERO_FIELDS: FieldDef[] = [
  { name: "eyebrow", label: "Eyebrow", type: "text" },
  { name: "titleLine1", label: "Title — line 1", type: "text", half: true },
  { name: "titleLine2", label: "Title — line 2 (after the image capsule)", type: "text", half: true },
  { name: "modes", label: "Rotating words (line 3)", type: "stringList", hint: "e.g. road, air, sea, rail" },
];

const HERO_FIELDS_2: FieldDef[] = [
  { name: "subtitle", label: "Subtitle", type: "textarea", rows: 3 },
  { name: "primaryCta", label: "Primary button", type: "text", half: true },
  { name: "secondaryCta", label: "Secondary button", type: "text", half: true },
  { name: "image", label: "Fallback image", type: "image", hint: "used when a word has no capsule image" },
];

const HOME_FIELDS: FieldDef[] = [
  { name: "statement", label: "Scroll statement", type: "textarea", rows: 4, hint: "Words light up as visitors scroll" },
  { name: "ctaTitle", label: "Final CTA title", type: "text" },
  { name: "ctaSubtitle", label: "Final CTA subtitle", type: "text" },
];

/** Miniature of the public hero: manifest strip, headline with image capsule, rolling word. */
function HeroPreview({ hero }: { hero: HeroContent }) {
  const modes = hero.modes?.length ? hero.modes : ["road"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % modes.length), 2200);
    return () => clearInterval(t);
  }, [modes.length]);
  const idx = i % modes.length;
  const img = hero.modeImages?.[idx] || hero.image;
  return (
    <div className="relative overflow-hidden rounded-[16px] bg-bone p-4 ring-1 ring-ink/10 sm:p-6">
      <div className="grid grid-cols-3 border-y border-ink/10 text-[8px] font-semibold uppercase tracking-[0.12em] text-ink/45 sm:text-[9px]">
        <span className="py-1.5">● In motion 1,284</span>
        <span className="border-l border-ink/10 py-1.5 pl-2">On-time 99.4%</span>
        <span className="truncate border-l border-ink/10 py-1.5 pl-2">{hero.eyebrow}</span>
      </div>
      <div className="display mt-5 text-[clamp(1.9rem,5.2vw,3.4rem)] [font-stretch:115%]">
        <div>{hero.titleLine1}</div>
        <div className="flex items-center">
          <span className="relative mr-[0.14em] inline-block h-[0.74em] w-[1.85em] shrink-0 overflow-hidden rounded-full bg-ink">
            <AnimatePresence initial={false}>
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img
                  key={img}
                  src={img.replace(/w=\d+/, "w=400")}
                  alt=""
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
          </span>
          {hero.titleLine2}
        </div>
        <div className="relative h-[1.02em] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={idx}
              className="block text-accent"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {modes[idx]}
              <span className="text-ink">.</span>
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="line-clamp-2 max-w-sm text-[12px] text-ink/60">{hero.subtitle}</p>
        <div className="flex shrink-0 gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent py-1.5 pl-3 pr-1.5 font-medium text-white">
            {hero.primaryCta}
            <span className="grid h-5 w-5 place-items-center rounded-full bg-signal text-ink">
              <ArrowRight size={11} />
            </span>
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-ink/10">{hero.secondaryCta}</span>
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        {modes.map((m, k) => (
          <span key={`${m}-${k}`} className={cn("h-1 flex-1 rounded-full transition-colors", k === idx ? "bg-accent" : "bg-ink/10")} />
        ))}
      </div>
    </div>
  );
}

/** One capsule image per rotating word. */
function CapsuleImages({ hero, onChange }: { hero: HeroContent; onChange: (imgs: string[]) => void }) {
  const modes = hero.modes ?? [];
  if (!modes.length) return <p className="text-[13px] text-muted">Add rotating words first — each one gets its own capsule image.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modes.map((m, k) => (
        <div key={`${m}-${k}`} className="rounded-[14px] border border-ink/10 bg-bone/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="board text-[20px] leading-none text-accent">{String(k + 1).padStart(2, "0")}</span>
            <span className="display text-[15px] [font-stretch:110%]">{m}.</span>
          </div>
          <ImageInput
            value={hero.modeImages?.[k] ?? ""}
            onChange={(url) => {
              const next = modes.map((_, j) => hero.modeImages?.[j] ?? "");
              next[k] = url;
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

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
      setHero(h);
      setHome(m);
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
  const enabledCount = home.sections.filter((s) => s.enabled).length;
  const setHeroField = (n: string, v: unknown) => setHero({ ...hero, [n]: v } as HeroContent);

  return (
    <div className="pb-32">
      <CmsHeader
        code="PG-HOME"
        eyebrow="Pages"
        title="Homepage"
        description="Edit the hero, the scroll statement and the final call-to-action — then reorder or hide any stop on the homepage route."
        meta={
          <>
            <MetaChip tone="ink">
              <span className="board text-[14px] leading-none">{enabledCount}</span>/{home.sections.length} stops live
            </MetaChip>
            <MetaChip>{(hero.modes ?? []).length} rotating words</MetaChip>
          </>
        }
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer" className={headerLinkCls}>
              <ExternalLink size={15} /> Open site
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5">
          <Panel index={1} title="Hero" description="The first thing every visitor sees — the preview is live.">
            <HeroPreview hero={hero} />
            <div className="mt-6">
              <FieldGrid fields={HERO_FIELDS} row={hero as unknown as Row} onChange={setHeroField} />
            </div>
            <div className="mt-6">
              <FieldLabel hint="one per rotating word">Capsule images</FieldLabel>
              <CapsuleImages hero={hero} onChange={(imgs) => setHero({ ...hero, modeImages: imgs })} />
            </div>
            <div className="mt-6">
              <FieldGrid fields={HERO_FIELDS_2} row={hero as unknown as Row} onChange={setHeroField} />
            </div>
          </Panel>

          <Panel index={2} title="Statement & call-to-action" description="The scroll-lit promise and the closing signage block.">
            <FieldGrid fields={HOME_FIELDS} row={home as unknown as Row} onChange={(n, v) => setHome({ ...home, [n]: v })} />
          </Panel>
        </div>

        {/* ── route of sections ── */}
        <section className="self-start overflow-hidden rounded-[18px] bg-ink text-white xl:sticky xl:top-6">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <div className="eyebrow text-white/45">Homepage route</div>
              <h2 className="display mt-1 text-[18px] [font-stretch:110%]">Sections</h2>
              <p className="mt-1 text-[12px] text-white/50">Drag or use arrows to reorder. Switch a stop off to hide it.</p>
            </div>
            <span className="board text-[34px] leading-[0.8] text-signal">{String(enabledCount).padStart(2, "0")}</span>
          </div>
          <ol className="relative px-3 py-3">
            <span className="pointer-events-none absolute bottom-6 left-[34px] top-6 w-[2px] bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,.18)_0_4px,transparent_4px_9px)]" />
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
                className={cn("relative flex items-center gap-2 rounded-[12px] py-1.5 pl-1 pr-1.5 transition", dragIdx === i ? "bg-white/10 ring-1 ring-signal" : "hover:bg-white/[0.05]")}
              >
                <GripVertical size={15} className="hidden shrink-0 cursor-grab text-white/25 sm:block" />
                <span
                  className={cn(
                    "relative z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0px] transition",
                    s.enabled ? "bg-signal ring-4 ring-signal/15" : "bg-ink ring-2 ring-inset ring-white/25",
                  )}
                >
                  <span className={cn("board text-[13px] leading-none", s.enabled ? "text-ink" : "text-white/40")}>{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className={cn("min-w-0 flex-1 truncate pl-1 text-[14px] font-medium", !s.enabled && "text-white/35 line-through decoration-white/20")}>{s.label}</span>
                <ToolBtn className="!text-white/50 hover:!bg-white/15" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                  <ArrowUp size={14} />
                </ToolBtn>
                <ToolBtn className="!text-white/50 hover:!bg-white/15" onClick={() => move(i, i + 1)} disabled={i === home.sections.length - 1} aria-label="Move down">
                  <ArrowDown size={14} />
                </ToolBtn>
                <span className="[&_[role=switch]>span:first-child]:!bg-white/15 [&_[role=switch][aria-checked=true]>span:first-child]:!bg-accent">
                  <Switch size="sm" checked={s.enabled} onChange={(v) => setSections(home.sections.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)))} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

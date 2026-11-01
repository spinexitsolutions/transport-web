"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, Plus, Save, Search as SearchIcon, Trash2 } from "lucide-react";
import type { DB, DBKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { getKey, newId, putKey } from "./api";
import { FieldGrid, type FieldDef, type Row } from "./fields";
import { useToast } from "./Toast";
import { Empty, Loading } from "./ui";
import { CmsHeader, HeaderBtn, MetaChip, SaveDock, Switch, SyncChip, ToolBtn, recordCode } from "./cms/kit";

export type CollectionConfig = {
  dbKey: DBKey;
  eyebrow?: string;
  title: string;
  description?: string;
  singular: string;
  fields: FieldDef[];
  newItem: () => Row;
  itemTitle: (r: Row) => string;
  itemSubtitle?: (r: Row) => string;
  imageField?: string;
  iconField?: string;
  publishField?: string;
  idPrefix?: string;
  /** Normalise rows before saving (e.g. auto slugs). */
  prepare?: (rows: Row[]) => Row[];
  /** Optional link to the item on the public site. */
  viewHref?: (r: Row) => string | null;
};

export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}

/** Header save status + compact save button. The floating SaveDock handles the main save action. */
export function SaveBar({ dirty, saving, onSave, onDiscard }: { dirty: boolean; saving: boolean; onSave: () => void; onDiscard?: () => void }) {
  return (
    <>
      <SyncChip dirty={dirty} />
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition active:scale-[0.97] disabled:cursor-default",
          dirty ? "bg-ink text-white hover:bg-accent" : "bg-ink/5 text-ink/40",
        )}
      >
        <Save size={15} /> {saving ? "Saving…" : dirty ? "Save" : "Saved"}
      </button>
      <SaveDock dirty={dirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </>
  );
}

export function CollectionEditor(cfg: CollectionConfig) {
  const toast = useToast();
  const [original, setOriginal] = useState<Row[] | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [mobileEditing, setMobileEditing] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getKey(cfg.dbKey)
      .then((d) => {
        const list = (Array.isArray(d) ? d : []) as unknown as Row[];
        setOriginal(list);
        setRows(list);
        setSelected(list[0] ? String(list[0].id) : null);
      })
      .catch((e: Error) => toast(e.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.dbKey]);

  const dirty = useMemo(() => original !== null && JSON.stringify(original) !== JSON.stringify(rows), [original, rows]);
  useUnsavedWarning(dirty);

  // lock page scroll while the mobile editor sheet is open
  useEffect(() => {
    if (!mobileEditing || window.matchMedia("(min-width: 1024px)").matches) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [mobileEditing]);

  const current = rows.find((r) => String(r.id) === selected) ?? null;
  const currentIndex = current ? rows.findIndex((r) => r.id === current.id) : -1;
  const filtered = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const liveCount = cfg.publishField ? rows.filter((r) => Boolean(r[cfg.publishField!])).length : rows.length;
  const code = recordCode(cfg.singular, 0).split("-")[0];

  const patch = (id: string, name: string, v: unknown) => setRows((rs) => rs.map((r) => (String(r.id) === id ? { ...r, [name]: v } : r)));

  const add = () => {
    const item = { ...cfg.newItem(), id: newId(cfg.idPrefix ?? "") };
    setRows((rs) => [item, ...rs]);
    setSelected(String(item.id));
    setQ("");
    setMobileEditing(true);
  };
  const duplicate = (r: Row) => {
    const copy: Row = { ...JSON.parse(JSON.stringify(r)), id: newId(cfg.idPrefix ?? "") };
    if (typeof copy.slug === "string") copy.slug = `${copy.slug}-copy`;
    const firstKey = cfg.fields[0]?.name;
    if (firstKey && typeof copy[firstKey] === "string") copy[firstKey] = `${copy[firstKey]} (copy)`;
    setRows((rs) => {
      const i = rs.findIndex((x) => x.id === r.id);
      const next = [...rs];
      next.splice(i + 1, 0, copy);
      return next;
    });
    setSelected(String(copy.id));
  };
  const remove = (r: Row) => {
    if (!confirm(`Delete “${cfg.itemTitle(r) || cfg.singular}”? This takes effect when you save.`)) return;
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    setSelected(null);
    setMobileEditing(false);
  };
  const move = (r: Row, d: number) =>
    setRows((rs) => {
      const i = rs.findIndex((x) => x.id === r.id);
      const j = i + d;
      if (j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const prepared = cfg.prepare ? cfg.prepare(rows) : rows;
      const saved = (await putKey(cfg.dbKey, prepared as unknown as DB[DBKey])) as unknown as Row[];
      setOriginal(saved);
      setRows(saved);
      toast(`${cfg.title} saved — live on the site`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!original) return <Loading label={`Loading ${cfg.title.toLowerCase()}`} />;

  const viewHref = current && cfg.viewHref ? cfg.viewHref(current) : null;
  const thumbOf = (r: Row) => (cfg.imageField ? String(r[cfg.imageField] ?? "") : "");

  return (
    <div className="pb-32">
      <CmsHeader
        code={`${code} · ${String(rows.length).padStart(2, "0")}`}
        eyebrow={cfg.eyebrow ?? "Content"}
        title={cfg.title}
        description={cfg.description}
        meta={
          <>
            <MetaChip tone="ink">
              <span className="board text-[14px] leading-none">{rows.length}</span> records
            </MetaChip>
            {cfg.publishField && (
              <MetaChip>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {liveCount} live · {rows.length - liveCount} draft
              </MetaChip>
            )}
          </>
        }
        actions={
          <>
            <HeaderBtn onClick={add}>
              <Plus size={15} /> New {cfg.singular.toLowerCase()}
            </HeaderBtn>
            <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setRows(original)} />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(290px,380px)_1fr]">
        {/* ── manifest index ── */}
        <div className="min-w-0">
          <div className="overflow-hidden rounded-[18px] border border-ink/10 bg-white">
            <div className="flex items-center gap-2 border-b border-ink/10 bg-ink px-3 py-2.5 text-white">
              <SearchIcon size={15} className="ml-1 shrink-0 text-white/40" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${cfg.title.toLowerCase()}…`}
                className="min-w-0 flex-1 bg-transparent py-1 text-[14px] text-white outline-none placeholder:text-white/35"
              />
              <span className="board shrink-0 rounded-md bg-white/10 px-2 py-1 text-[13px] leading-none text-signal">
                {filtered.length}/{rows.length}
              </span>
            </div>
            <div className="eyebrow grid grid-cols-[44px_1fr_auto] gap-2 border-b border-ink/10 px-3 py-2 text-muted">
              <span>No.</span>
              <span>{cfg.singular}</span>
              <span>Status</span>
            </div>
            {filtered.length === 0 ? (
              <div className="p-4">
                <Empty
                  title={q ? "No matches" : `No ${cfg.title.toLowerCase()} yet`}
                  action={
                    !q && (
                      <HeaderBtn onClick={add}>
                        <Plus size={15} /> Add {cfg.singular.toLowerCase()}
                      </HeaderBtn>
                    )
                  }
                />
              </div>
            ) : (
              <ul className="max-h-none divide-y divide-ink/[0.07] lg:max-h-[calc(100dvh-280px)] lg:overflow-y-auto" data-lenis-prevent>
                {filtered.map((r) => {
                  const id = String(r.id);
                  const active = id === selected;
                  const published = cfg.publishField ? Boolean(r[cfg.publishField]) : true;
                  const img = thumbOf(r);
                  const n = rows.findIndex((x) => x.id === r.id) + 1;
                  return (
                    <li key={id} className="relative">
                      {active && <motion.span layoutId={`active-${cfg.dbKey}`} className="absolute inset-y-0 left-0 w-[3px] bg-accent" />}
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(id);
                          setMobileEditing(true);
                        }}
                        className={cn("group grid w-full grid-cols-[44px_1fr_auto] items-center gap-2 px-3 py-2.5 text-left transition", active ? "bg-tint" : "hover:bg-bone/70")}
                      >
                        <span className={cn("board text-[22px] leading-none transition-colors", active ? "text-accent" : "text-ink/25 group-hover:text-ink/50")}>
                          {String(n).padStart(2, "0")}
                        </span>
                        <span className="flex min-w-0 items-center gap-3">
                          {cfg.imageField ? (
                            <span className="h-10 w-12 shrink-0 overflow-hidden rounded-[8px] bg-bone-2">
                              {img && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={img.replace(/w=\d+/, "w=160")} alt="" className="h-full w-full object-cover" />
                              )}
                            </span>
                          ) : cfg.iconField ? (
                            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[10px] transition", active ? "bg-accent text-white" : "bg-ink text-signal")}>
                              <Icon name={String(r[cfg.iconField] ?? "")} size={17} />
                            </span>
                          ) : null}
                          <span className="min-w-0">
                            <span className="block truncate text-[14px] font-semibold tracking-tight">{cfg.itemTitle(r) || <em className="font-normal text-muted">Untitled</em>}</span>
                            {cfg.itemSubtitle && <span className="block truncate text-[12px] text-muted">{cfg.itemSubtitle(r)}</span>}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 pl-1" title={published ? "Published" : "Draft"}>
                          <span className={cn("h-2 w-2 rounded-full", published ? "bg-emerald-500" : "bg-ink/20 ring-1 ring-ink/30")} />
                          <span className="eyebrow hidden text-[9px] text-muted xl:inline">{published ? "Live" : "Draft"}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── spec sheet editor (full-screen sheet on mobile) ── */}
        <div
          className={cn(
            "min-w-0",
            mobileEditing ? "fixed inset-0 z-[60] overflow-y-auto bg-bone px-3 pb-40 pt-3 lg:static lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0" : "hidden lg:block",
          )}
          data-lenis-prevent
        >
          <AnimatePresence mode="wait" initial={false}>
            {current ? (
              <motion.div
                key={String(current.id)}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden rounded-[18px] border border-ink/10 bg-white lg:sticky lg:top-6"
              >
                {/* sheet header */}
                <div className="relative bg-ink px-4 pb-4 pt-3 text-white sm:px-6">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileEditing(false)}
                      className="-ml-1 inline-flex h-9 items-center gap-1.5 rounded-[10px] px-2 text-[13px] text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
                    >
                      <ArrowLeft size={16} /> Index
                    </button>
                    <span className="eyebrow text-white/45 max-lg:hidden">Spec sheet · {cfg.singular}</span>
                    <span className="barcode ml-auto h-6 w-20 text-white/60" aria-hidden />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <div className="board text-[40px] leading-[0.85] text-signal sm:text-[52px]">{recordCode(cfg.singular, currentIndex + 1)}</div>
                      <div className="mt-2 truncate text-[15px] font-medium text-white/85">{cfg.itemTitle(current) || "Untitled"}</div>
                    </div>
                    {cfg.imageField && thumbOf(current) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbOf(current).replace(/w=\d+/, "w=240")} alt="" className="hidden h-16 w-24 shrink-0 rounded-[10px] object-cover ring-1 ring-white/20 sm:block" />
                    )}
                  </div>
                </div>

                {/* toolbar */}
                <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-ink/10 bg-white/95 px-2 py-2 backdrop-blur sm:px-4">
                  {cfg.publishField && (
                    <div className="mr-auto pl-1">
                      <Switch
                        size="sm"
                        checked={Boolean(current[cfg.publishField])}
                        onChange={(v) => patch(String(current.id), cfg.publishField!, v)}
                        label={current[cfg.publishField] ? "Published" : "Draft"}
                      />
                    </div>
                  )}
                  {!cfg.publishField && <span className="eyebrow mr-auto pl-2 text-muted">Record {currentIndex + 1} of {rows.length}</span>}
                  <ToolBtn onClick={() => move(current, -1)} disabled={currentIndex === 0} aria-label="Move up" title="Move up">
                    <ArrowUp size={16} />
                  </ToolBtn>
                  <ToolBtn onClick={() => move(current, 1)} disabled={currentIndex === rows.length - 1} aria-label="Move down" title="Move down">
                    <ArrowDown size={16} />
                  </ToolBtn>
                  <ToolBtn onClick={() => duplicate(current)} aria-label="Duplicate" title="Duplicate">
                    <Copy size={16} />
                  </ToolBtn>
                  <span className="mx-1 h-5 w-px bg-ink/10" />
                  <ToolBtn danger onClick={() => remove(current)} aria-label="Delete" title="Delete">
                    <Trash2 size={16} />
                  </ToolBtn>
                </div>

                <div className="p-4 sm:p-6">
                  <FieldGrid fields={cfg.fields} row={current} onChange={(name, v) => patch(String(current.id), name, v)} />
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-ink/15 pt-4">
                    <span className="eyebrow text-muted">ID · {String(current.id)}</span>
                    {viewHref && (
                      <a href={viewHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3.5 py-2 text-[13px] font-medium text-accent transition hover:bg-accent hover:text-white">
                        <ExternalLink size={14} /> View on site
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid min-h-[360px] place-items-center rounded-[18px] border border-dashed border-ink/15 p-8 text-center">
                <div>
                  <div className="board text-[64px] leading-none text-ink/10">—</div>
                  <div className="display mt-2 text-[18px]">Select a {cfg.singular.toLowerCase()}</div>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">Pick a record from the index to open its spec sheet, or create a new one.</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <HeaderBtn onClick={add}>
                      <Plus size={15} /> New {cfg.singular.toLowerCase()}
                    </HeaderBtn>
                    <button type="button" onClick={() => setMobileEditing(false)} className="inline-flex h-10 items-center rounded-full px-4 text-[13.5px] text-muted lg:hidden">
                      Back
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

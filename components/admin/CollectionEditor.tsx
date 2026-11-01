"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import type { DB, DBKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { getKey, newId, putKey } from "./api";
import { FieldGrid, type FieldDef, type Row } from "./fields";
import { useToast } from "./Toast";
import { Badge, Btn, Empty, IconBtn, Loading, PageHeader, Search } from "./ui";

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

export function SaveBar({ dirty, saving, onSave, onDiscard }: { dirty: boolean; saving: boolean; onSave: () => void; onDiscard?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {dirty && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="mr-1 hidden items-center gap-1.5 text-[13px] text-muted sm:flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Unsaved changes
          </motion.span>
        )}
      </AnimatePresence>
      {dirty && onDiscard && (
        <Btn variant="ghost" onClick={onDiscard}>
          Discard
        </Btn>
      )}
      <Btn variant={dirty ? "accent" : "ink"} onClick={onSave} loading={saving} disabled={!dirty}>
        <Save size={15} /> {dirty ? "Save changes" : "Saved"}
      </Btn>
    </div>
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

  const current = rows.find((r) => String(r.id) === selected) ?? null;
  const filtered = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const patch = (id: string, name: string, v: unknown) => setRows((rs) => rs.map((r) => (String(r.id) === id ? { ...r, [name]: v } : r)));

  const add = () => {
    const item = { ...cfg.newItem(), id: newId(cfg.idPrefix ?? "") };
    setRows((rs) => [item, ...rs]);
    setSelected(String(item.id));
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

  return (
    <div>
      <PageHeader
        eyebrow={cfg.eyebrow ?? "Content"}
        title={cfg.title}
        description={cfg.description}
        actions={
          <>
            <Btn variant="ghost" onClick={add}>
              <Plus size={15} /> New {cfg.singular.toLowerCase()}
            </Btn>
            <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setRows(original)} />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        {/* list */}
        <div className={cn("min-w-0", mobileEditing && "hidden lg:block")}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Search value={q} onChange={setQ} placeholder={`Search ${cfg.title.toLowerCase()}…`} />
            <span className="shrink-0 text-xs text-muted">{rows.length} items</span>
          </div>
          {filtered.length === 0 ? (
            <Empty title={`No ${cfg.title.toLowerCase()} yet`} action={<Btn variant="ink" onClick={add}><Plus size={15} /> Add {cfg.singular.toLowerCase()}</Btn>} />
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((r) => {
                const id = String(r.id);
                const active = id === selected;
                const published = cfg.publishField ? Boolean(r[cfg.publishField]) : true;
                const img = cfg.imageField ? String(r[cfg.imageField] ?? "") : "";
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(id);
                        setMobileEditing(true);
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition",
                        active ? "border-ink bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,.25)]" : "border-line bg-white/60 hover:bg-white",
                      )}
                    >
                      {cfg.imageField ? (
                        <span className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-bone-2">
                          {img && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img.replace("w=1600", "w=200").replace("w=2400", "w=200")} alt="" className="h-full w-full object-cover" />
                          )}
                        </span>
                      ) : cfg.iconField ? (
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-accent">
                          <Icon name={String(r[cfg.iconField] ?? "")} size={18} />
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium">{cfg.itemTitle(r) || <em className="text-muted">Untitled</em>}</span>
                        {cfg.itemSubtitle && <span className="block truncate text-[12px] text-muted">{cfg.itemSubtitle(r)}</span>}
                      </span>
                      {!published && <Badge>Draft</Badge>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* editor */}
        <div className={cn("min-w-0", !mobileEditing && "hidden lg:block")}>
          {current ? (
            <div className="rounded-[22px] border border-line bg-white">
              <div className="sticky top-14 z-10 flex items-center gap-1 rounded-t-[22px] border-b border-line bg-white/90 px-3 py-2.5 backdrop-blur lg:top-0">
                <IconBtn className="lg:hidden" onClick={() => setMobileEditing(false)} aria-label="Back">
                  <ArrowLeft size={17} />
                </IconBtn>
                <div className="min-w-0 flex-1 truncate px-1 text-sm font-medium">{cfg.itemTitle(current) || "Untitled"}</div>
                {cfg.publishField && (
                  <Btn
                    variant="soft"
                    className="!h-9 !px-3"
                    onClick={() => patch(String(current.id), cfg.publishField!, !current[cfg.publishField!])}
                  >
                    {current[cfg.publishField] ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span className="hidden sm:inline">{current[cfg.publishField] ? "Published" : "Draft"}</span>
                  </Btn>
                )}
                <IconBtn onClick={() => move(current, -1)} aria-label="Move up" title="Move up">
                  <ArrowUp size={16} />
                </IconBtn>
                <IconBtn onClick={() => move(current, 1)} aria-label="Move down" title="Move down">
                  <ArrowDown size={16} />
                </IconBtn>
                <IconBtn onClick={() => duplicate(current)} aria-label="Duplicate" title="Duplicate">
                  <Copy size={16} />
                </IconBtn>
                <IconBtn onClick={() => remove(current)} aria-label="Delete" title="Delete" className="hover:!bg-red-50 hover:!text-red-600">
                  <Trash2 size={16} />
                </IconBtn>
              </div>
              <div className="p-4 sm:p-6">
                <FieldGrid fields={cfg.fields} row={current} onChange={(name, v) => patch(String(current.id), name, v)} />
                {viewHref && (
                  <a href={viewHref} target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
                    View on site ↗
                  </a>
                )}
              </div>
            </div>
          ) : (
            <Empty title={`Select a ${cfg.singular.toLowerCase()}`} text="Pick an item from the list to edit it, or create a new one." />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import type { DB, DBKey } from "@/lib/types";
import { getKey, putKey } from "./api";
import { FieldGrid, type FieldDef, type Row } from "./fields";
import { SaveBar, useUnsavedWarning } from "./CollectionEditor";
import { useToast } from "./Toast";
import { Loading } from "./ui";
import { CmsHeader, Panel } from "./cms/kit";

export type SingletonSection = {
  title: string;
  description?: string;
  fields?: FieldDef[];
  custom?: (value: Row, set: (name: string, v: unknown) => void) => React.ReactNode;
};

export function SingletonEditor({
  dbKey,
  code,
  eyebrow = "Content",
  title,
  description,
  sections,
  actions,
  aside,
}: {
  dbKey: DBKey;
  /** Signage code shown in the header strip, e.g. "SYS-01". */
  code?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  sections: SingletonSection[];
  actions?: React.ReactNode;
  aside?: (value: Row) => React.ReactNode;
}) {
  const toast = useToast();
  const [original, setOriginal] = useState<Row | null>(null);
  const [value, setValue] = useState<Row>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getKey(dbKey)
      .then((d) => {
        setOriginal(d as unknown as Row);
        setValue(d as unknown as Row);
      })
      .catch((e: Error) => toast(e.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbKey]);

  const dirty = useMemo(() => original !== null && JSON.stringify(original) !== JSON.stringify(value), [original, value]);
  useUnsavedWarning(dirty);

  const set = (name: string, v: unknown) => setValue((s) => ({ ...s, [name]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const saved = (await putKey(dbKey, value as unknown as DB[DBKey])) as unknown as Row;
      setOriginal(saved);
      setValue(saved);
      toast(`${title} saved — live on the site`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!original) return <Loading label={`Loading ${title.toLowerCase()}`} />;

  return (
    <div className="pb-32">
      <CmsHeader
        code={code ?? String(dbKey).toUpperCase().slice(0, 4)}
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            {actions}
            <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setValue(original)} />
          </>
        }
      />
      <div className={aside ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]" : ""}>
        <div className="space-y-5">
          {sections.map((s, i) => (
            <Panel key={s.title} index={i + 1} title={s.title} description={s.description}>
              {s.fields && <FieldGrid fields={s.fields} row={value} onChange={set} />}
              {s.custom && <div className={s.fields ? "mt-6" : ""}>{s.custom(value, set)}</div>}
            </Panel>
          ))}
        </div>
        {aside && <div className="order-first xl:order-none xl:sticky xl:top-6 xl:self-start">{aside(value)}</div>}
      </div>
    </div>
  );
}

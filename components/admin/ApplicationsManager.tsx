"use client";
import { useState } from "react";
import { ExternalLink, Mail, Phone, Trash2 } from "lucide-react";
import type { Application } from "@/lib/types";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";
import { useKey } from "./api";
import { useToast } from "./Toast";
import { Badge, Btn, Drawer, Empty, Label, Loading, PageHeader, Search } from "./ui";

const STAGES: { id: Application["status"]; label: string; tone: string }[] = [
  { id: "new", label: "New", tone: "blue" },
  { id: "screening", label: "Screening", tone: "violet" },
  { id: "interview", label: "Interview", tone: "amber" },
  { id: "offer", label: "Offer", tone: "green" },
  { id: "rejected", label: "Rejected", tone: "red" },
];
const toneOf = (s: Application["status"]) => STAGES.find((x) => x.id === s)?.tone ?? "gray";

export function ApplicationsManager() {
  const toast = useToast();
  const { data, save } = useKey("applications");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Application["status"] | "all">("all");
  const [open, setOpen] = useState<Application | null>(null);

  if (!data) return <Loading label="Loading applications" />;

  const persist = async (next: Application[], msg: string) => {
    try {
      await save(next);
      toast(msg);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const filtered = data.filter(
    (a) => (stage === "all" || a.status === stage) && (!q || `${a.name} ${a.email} ${a.jobTitle}`.toLowerCase().includes(q.toLowerCase())),
  );

  const setStatus = (a: Application, status: Application["status"]) => {
    const next = data.map((x) => (x.id === a.id ? { ...x, status } : x));
    persist(next, `${a.name} → ${STAGES.find((s) => s.id === status)?.label}`);
    setOpen((o) => (o && o.id === a.id ? { ...o, status } : o));
  };

  return (
    <div>
      <PageHeader eyebrow="CRM · Hiring" title="Applications" description="Candidates who applied from the careers page." />

      <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStage(stage === s.id ? "all" : s.id)}
            className={cn(
              "rounded-2xl border p-3 text-left transition",
              stage === s.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/25",
            )}
          >
            <div className={cn("text-[12px]", stage === s.id ? "text-white/60" : "text-muted")}>{s.label}</div>
            <div className="text-2xl font-semibold tracking-tight">{data.filter((a) => a.status === s.id).length}</div>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Search value={q} onChange={setQ} placeholder="Search candidates…" />
      </div>

      {filtered.length === 0 ? (
        <Empty title="No applications" text="Applications submitted on the careers page appear here." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[16px] border border-line bg-white">
          {filtered.map((a) => (
            <li key={a.id}>
              <button onClick={() => setOpen(a)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-bone/50 sm:px-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bone-2 text-[13px] font-semibold">
                  {a.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{a.name}</div>
                  <div className="truncate text-[13px] text-muted">{a.jobTitle}</div>
                </div>
                <span className="hidden text-[12px] text-muted sm:block">{fmtDate(a.createdAt)}</span>
                <Badge tone={toneOf(a.status)}>{a.status}</Badge>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Drawer
          open
          onClose={() => setOpen(null)}
          title={open.name}
          subtitle={`${open.jobTitle} · applied ${fmtDateTime(open.createdAt)}`}
          footer={
            <Btn
              variant="danger"
              onClick={() => {
                if (!confirm("Delete this application?")) return;
                persist(
                  data.filter((x) => x.id !== open.id),
                  "Application deleted",
                );
                setOpen(null);
              }}
            >
              <Trash2 size={15} /> Delete
            </Btn>
          }
        >
          <Label>Stage</Label>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatus(open, s.id)}
                className={cn("h-8 rounded-full px-3 text-[12px] font-medium", open.status === s.id ? "bg-ink text-white" : "bg-bone-2 text-ink/60")}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <a href={`mailto:${open.email}`} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line">
              <Mail size={16} /> {open.email}
            </a>
            {open.phone && (
              <a href={`tel:${open.phone}`} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line">
                <Phone size={16} /> {open.phone}
              </a>
            )}
            {open.link && (
              <a href={open.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 truncate rounded-2xl bg-white p-3.5 ring-1 ring-line">
                <ExternalLink size={16} /> {open.link}
              </a>
            )}
          </div>
          <Label>
            <span className="mt-6 block">Cover note</span>
          </Label>
          <p className="whitespace-pre-wrap rounded-2xl bg-white p-4 text-[14px] leading-relaxed ring-1 ring-line">{open.message || "—"}</p>
        </Drawer>
      )}
    </div>
  );
}

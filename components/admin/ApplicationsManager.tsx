"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Mail, Phone, Plane, Trash2 } from "lucide-react";
import type { Application } from "@/lib/types";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";
import { useKey } from "./api";
import { useToast } from "./Toast";
import { Btn, Drawer, Empty, Label, Loading, Search } from "./ui";
import { Barcode, CrmHeader, Stamp, initials } from "./crm/kit";

const STAGES: { id: Application["status"]; label: string; code: string; stamp: string; tone: "accent" | "red" | "ink" | "green" }[] = [
  { id: "new", label: "New", code: "NEW", stamp: "Checked in", tone: "accent" },
  { id: "screening", label: "Screening", code: "SCR", stamp: "Security", tone: "ink" },
  { id: "interview", label: "Interview", code: "INT", stamp: "Boarding", tone: "accent" },
  { id: "offer", label: "Offer", code: "OFR", stamp: "Cleared", tone: "green" },
  { id: "rejected", label: "Rejected", code: "REJ", stamp: "Denied", tone: "red" },
];
const stageOf = (s: Application["status"]) => STAGES.find((x) => x.id === s) ?? STAGES[0];
const deptCode = (t: string) => t.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 3).toUpperCase() || "GEN";

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

  const visibleStages = STAGES.filter((s) => stage === "all" || s.id === stage);

  return (
    <div>
      <CrmHeader
        code="CRM-04"
        module="Hiring"
        title="Boarding"
        accent="gate"
        description="Candidates who applied on the careers page. Move each pass from check-in to boarding."
        stats={[
          { label: "Passengers", value: String(data.length), tone: "ink" },
          { label: "Interviewing", value: String(data.filter((a) => a.status === "interview").length), tone: "accent" },
          { label: "Offers", value: String(data.filter((a) => a.status === "offer").length), tone: "signal" },
          { label: "This week", value: String(data.filter((a) => Date.now() - +new Date(a.createdAt) < 7 * 86400000).length) },
        ]}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Search value={q} onChange={setQ} placeholder="Search candidates or roles…" />
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
          {[{ id: "all" as const, code: "ALL" }, ...STAGES].map((s) => (
            <button
              key={s.id}
              onClick={() => setStage(s.id)}
              className={cn(
                "board h-10 shrink-0 rounded-[8px] px-3.5 text-[15px] tracking-wide transition",
                stage === s.id ? "bg-ink text-signal" : "bg-white text-ink/55 ring-1 ring-line hover:text-ink",
              )}
            >
              {s.code}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No applications" text="Applications submitted on the careers page appear here." />
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0" data-lenis-prevent>
          {visibleStages.map((st) => {
            const items = filtered.filter((a) => a.status === st.id);
            return (
              <div key={st.id} className="flex w-[84vw] max-w-[320px] shrink-0 snap-start flex-col rounded-[14px] bg-tint/70 p-2.5 sm:w-[300px]">
                <div className="flex items-end justify-between px-1.5 pb-3 pt-1">
                  <div>
                    <div className="eyebrow text-muted">Gate</div>
                    <div className="board text-[30px] leading-none">
                      {st.code} <span className="text-[15px] text-muted">{st.label}</span>
                    </div>
                  </div>
                  <span className="board text-[30px] leading-none text-accent">{String(items.length).padStart(2, "0")}</span>
                </div>
                <div className="flex min-h-[120px] flex-col gap-2.5">
                  {items.map((a, i) => (
                    <motion.button
                      layout
                      key={a.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setOpen(a)}
                      className="group relative flex overflow-hidden rounded-[12px] bg-white text-left ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-16px_rgba(11,13,23,.45)]"
                    >
                      <div className="min-w-0 flex-1 p-3">
                        <div className="flex items-center justify-between">
                          <span className="eyebrow text-muted">Boarding pass</span>
                          <span className="board text-[13px] text-accent">{a.id}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="board text-[22px] leading-none">{deptCode(a.jobTitle)}</span>
                          <span className="flex flex-1 items-center gap-1 text-ink/30">
                            <span className="h-px flex-1 border-t border-dashed border-ink/25" />
                            <Plane size={12} />
                            <span className="h-px flex-1 border-t border-dashed border-ink/25" />
                          </span>
                          <span className="board text-[22px] leading-none">{st.code}</span>
                        </div>
                        <div className="mt-2 truncate text-[15px] font-semibold leading-tight">{a.name}</div>
                        <div className="truncate text-[12px] text-muted">{a.jobTitle}</div>
                        <div className="mt-2 text-[11px] text-muted">{fmtDate(a.createdAt)}</div>
                        <div className="pointer-events-none absolute bottom-3 right-[78px]">
                          <Stamp tone={st.tone} className="text-[11px]">
                            {st.stamp}
                          </Stamp>
                        </div>
                      </div>
                      {/* stub */}
                      <div className="relative flex w-[68px] shrink-0 flex-col items-center justify-between border-l-2 border-dashed border-ink/15 bg-ink py-3 text-white">
                        <span aria-hidden className="absolute -left-[7px] -top-[7px] h-3 w-3 rounded-full bg-tint" />
                        <span aria-hidden className="absolute -bottom-[7px] -left-[7px] h-3 w-3 rounded-full bg-tint" />
                        <span className="eyebrow text-[8px] text-white/45">Seat</span>
                        <span className="board grid h-9 w-9 place-items-center rounded-full bg-signal text-[14px] text-ink">{initials(a.name)}</span>
                        <Barcode className="h-6 w-10 rotate-90 text-white/70" />
                      </div>
                    </motion.button>
                  ))}
                  {items.length === 0 && (
                    <div className="grid flex-1 place-items-center rounded-[10px] border-2 border-dashed border-ink/10 py-8">
                      <span className="board text-lg text-ink/25">Gate empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
          <div className="relative mb-6 overflow-hidden rounded-[14px] bg-ink p-4 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow text-white/45">Boarding pass · {open.id}</div>
                <div className="board mt-1 text-3xl">{open.name}</div>
                <div className="text-[13px] text-white/60">{open.jobTitle}</div>
              </div>
              <Stamp tone={stageOf(open.status).tone} className={stageOf(open.status).tone === "red" ? "" : "!border-signal !text-signal"}>
                {stageOf(open.status).stamp}
              </Stamp>
            </div>
          </div>
          <Label>Move to gate</Label>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatus(open, s.id)}
                className={cn(
                  "board h-10 rounded-[8px] px-3 text-[15px] tracking-wide transition",
                  open.status === s.id ? (s.id === "rejected" ? "bg-red-600 text-white" : "bg-signal text-ink") : "bg-bone-2 text-ink/55 hover:text-ink",
                )}
              >
                {s.code} · {s.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <a href={`mailto:${open.email}`} className="flex items-center gap-3 rounded-[10px] bg-white p-3.5 ring-1 ring-line">
              <Mail size={16} /> {open.email}
            </a>
            {open.phone && (
              <a href={`tel:${open.phone}`} className="flex items-center gap-3 rounded-[10px] bg-white p-3.5 ring-1 ring-line">
                <Phone size={16} /> {open.phone}
              </a>
            )}
            {open.link && (
              <a href={open.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 truncate rounded-[10px] bg-white p-3.5 ring-1 ring-line">
                <ExternalLink size={16} /> {open.link}
              </a>
            )}
          </div>
          <Label>
            <span className="mt-6 block">Cover note</span>
          </Label>
          <p className="whitespace-pre-wrap rounded-[10px] border-l-4 border-accent bg-white p-4 text-[14px] leading-relaxed ring-1 ring-line">{open.message || "—"}</p>
        </Drawer>
      )}
    </div>
  );
}

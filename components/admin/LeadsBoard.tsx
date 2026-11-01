"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Kanban, List, Plus, Send, Trash2, UserCheck } from "lucide-react";
import { LEAD_STAGES, type Customer, type Lead, type LeadStatus } from "@/lib/types";
import { cn, compactInr, fmtDate, fmtDateTime, inr } from "@/lib/utils";
import { getKey, newId, putKey, useKey } from "./api";
import { useToast } from "./Toast";
import { Btn, Drawer, Empty, Label, Loading, Search, Segmented } from "./ui";
import { Barcode, CrmHeader, NoteSection, Stamp, cityCode, initials } from "./crm/kit";

const STAGE_CODE: Record<LeadStatus, string> = { new: "NEW", contacted: "CNT", quoted: "QTD", negotiation: "NEG", won: "WON", lost: "LST" };
const STAGE_BAR: Record<LeadStatus, string> = {
  new: "bg-accent",
  contacted: "bg-sky-500",
  quoted: "bg-violet-500",
  negotiation: "bg-amber-500",
  won: "bg-signal",
  lost: "bg-red-500",
};

const SOURCES: Lead["source"][] = ["quote", "contact", "newsletter", "manual"];
const OWNERS = ["Unassigned", "Riya", "Aditya", "Zoya"];

const blankLead = (): Lead => ({
  id: newId("L-"),
  source: "manual",
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "Road Freight",
  origin: "",
  destination: "",
  weight: 0,
  message: "",
  estimate: 0,
  value: 0,
  status: "new",
  owner: "Unassigned",
  createdAt: new Date().toISOString(),
  notes: [],
});

export function LeadsBoard() {
  const toast = useToast();
  const { data, save } = useKey("leads");
  const [view, setView] = useState<"board" | "table">("board");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [source, setSource] = useState<Lead["source"] | "all">("all");
  const [editing, setEditing] = useState<{ lead: Lead; isNew: boolean } | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const leads = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (status === "all" || l.status === status) &&
          (source === "all" || l.source === source) &&
          (!q || `${l.name} ${l.company} ${l.email} ${l.service} ${l.origin} ${l.destination} ${l.id}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [leads, q, status, source],
  );

  const persist = async (next: Lead[], msg?: string) => {
    try {
      await save(next);
      if (msg) toast(msg);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const setLeadStatus = (id: string, s: LeadStatus) => {
    const l = leads.find((x) => x.id === id);
    if (!l || l.status === s) return;
    persist(
      leads.map((x) => (x.id === id ? { ...x, status: s } : x)),
      `${l.name} → ${LEAD_STAGES.find((st) => st.id === s)?.label}`,
    );
  };

  const upsert = (lead: Lead, isNew: boolean) => {
    const next = isNew ? [lead, ...leads] : leads.map((x) => (x.id === lead.id ? lead : x));
    persist(next, isNew ? "Lead created" : "Lead updated");
    setEditing(null);
  };

  const remove = (lead: Lead) => {
    if (!confirm(`Delete lead ${lead.name}?`)) return;
    persist(
      leads.filter((x) => x.id !== lead.id),
      "Lead deleted",
    );
    setEditing(null);
  };

  const convert = async (lead: Lead) => {
    try {
      const customers = await getKey("customers");
      if (customers.some((c) => c.email && c.email === lead.email)) {
        toast("Customer with this email already exists", "error");
        return;
      }
      const c: Customer = {
        id: newId("C-"),
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        city: lead.origin,
        tier: "Standard",
        totalShipments: 0,
        revenue: lead.value,
        since: new Date().toISOString(),
      };
      await putKey("customers", [c, ...customers]);
      const updated = { ...lead, status: "won" as const };
      await save(leads.map((x) => (x.id === lead.id ? updated : x)));
      setEditing(null);
      toast(`${lead.company || lead.name} added to customers`);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  if (!data) return <Loading label="Loading pipeline" />;

  const totalOpen = leads.filter((l) => l.status !== "won" && l.status !== "lost").reduce((a, l) => a + (l.value || l.estimate), 0);
  const won = leads.filter((l) => l.status === "won");
  const closed = won.length + leads.filter((l) => l.status === "lost").length;

  return (
    <div>
      <CrmHeader
        code="CRM-01"
        module="Lead manifest"
        title="Freight"
        accent="lanes"
        description="Every enquiry is a ticket. Drag tickets between lanes to move them down the pipeline."
        stats={[
          { label: "Tickets", value: String(leads.length) },
          { label: "Open pipeline", value: compactInr(totalOpen), tone: "accent" },
          { label: "Won value", value: compactInr(won.reduce((a, l) => a + (l.value || l.estimate), 0)), tone: "signal" },
          { label: "Win rate", value: closed ? `${Math.round((won.length / closed) * 100)}%` : "—" },
        ]}
        actions={
          <Btn variant="ink" onClick={() => setEditing({ lead: blankLead(), isNew: true })}>
            <Plus size={15} /> Issue ticket
          </Btn>
        }
      />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "board", label: <><Kanban size={14} /> Lanes</> },
            { value: "table", label: <><List size={14} /> Manifest</> },
          ]}
        />
        <Search value={q} onChange={setQ} placeholder="Search name, company, lane, ID…" />
        <div className="flex gap-2">
          <select className="field !h-10 !w-auto !rounded-[10px] !py-0" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | "all")} aria-label="Stage">
            <option value="all">All lanes</option>
            {LEAD_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {STAGE_CODE[s.id]} · {s.label}
              </option>
            ))}
          </select>
          <select className="field !h-10 !w-auto !rounded-[10px] !py-0 capitalize" value={source} onChange={(e) => setSource(e.target.value as Lead["source"] | "all")} aria-label="Source">
            <option value="all">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {view === "board" ? (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0" data-lenis-prevent>
          {LEAD_STAGES.filter((s) => status === "all" || s.id === status).map((stage, si) => {
            const items = filtered.filter((l) => l.status === stage.id);
            const sum = items.reduce((a, l) => a + (l.value || l.estimate), 0);
            const over = dragOver === stage.id;
            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(stage.id);
                }}
                onDragLeave={() => setDragOver((d) => (d === stage.id ? null : d))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  setDragging(null);
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) setLeadStatus(id, stage.id);
                }}
                className={cn(
                  "flex w-[84vw] max-w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-[14px] transition-all duration-300 sm:w-[284px]",
                  over ? "bg-signal/40 ring-2 ring-signal" : "bg-tint/70",
                )}
              >
                {/* lane header */}
                <div className="relative bg-ink px-3.5 pb-3 pt-3 text-white">
                  <span className={cn("absolute inset-x-0 top-0 h-1", STAGE_BAR[stage.id])} />
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="eyebrow text-white/45">Lane {String(si + 1).padStart(2, "0")}</div>
                      <div className="board mt-1 text-[28px] leading-none">
                        {STAGE_CODE[stage.id]} <span className="text-[15px] text-white/50">{stage.label}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="board text-[28px] leading-none text-signal">{String(items.length).padStart(2, "0")}</div>
                      <div className="mt-1 text-[11px] tabular-nums text-white/55">{compactInr(sum)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[160px] flex-col gap-2.5 p-2.5">
                  {items.map((l) => (
                    <motion.div
                      layout
                      key={l.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className={cn("transition-[transform,opacity] duration-200", dragging === l.id && "rotate-[4deg] scale-[1.03] opacity-60")}
                    >
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", l.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragging(l.id);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setDragOver(null);
                        }}
                        onClick={() => setEditing({ lead: l, isNew: false })}
                        className="group relative cursor-grab overflow-hidden rounded-[10px] bg-white pl-4 shadow-[0_1px_0_rgba(0,0,0,.04)] ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-16px_rgba(11,13,23,.45)] active:cursor-grabbing"
                      >
                        {/* perforated edge */}
                        <span aria-hidden className="absolute inset-y-0 left-0 w-3 border-r border-dashed border-ink/15 bg-[radial-gradient(circle_at_0_50%,var(--tint)_0_3.5px,transparent_4px)] bg-[length:12px_12px]" />
                        <div className="p-3 pl-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="board text-[15px] tracking-wide text-accent">{l.id}</span>
                            <span className="eyebrow text-muted">{fmtDate(l.createdAt, { day: "numeric", month: "short" })}</span>
                          </div>
                          <div className="mt-1.5 truncate text-[15px] font-semibold leading-tight">{l.company || l.name || "Unnamed"}</div>
                          <div className="truncate text-[12px] text-muted">{l.company ? l.name : l.email || "—"}</div>

                          <div className="mt-3 flex items-center gap-2">
                            <span className="board text-[22px] leading-none">{cityCode(l.origin)}</span>
                            <span className="flex flex-1 items-center">
                              <span className="h-px flex-1 border-t border-dashed border-ink/25" />
                              <ArrowRight size={12} className="text-ink/40" />
                            </span>
                            <span className="board text-[22px] leading-none">{cityCode(l.destination)}</span>
                          </div>
                          <div className="mt-1 truncate text-[11px] text-muted">{l.service}</div>

                          <div className="mt-3 flex items-end justify-between gap-2 border-t border-dashed border-ink/15 pt-2.5">
                            <div>
                              <div className="eyebrow text-muted">{l.value ? "Deal" : "Est."}</div>
                              <div className="board text-[22px] leading-none">{compactInr(l.value || l.estimate)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Barcode className="h-5 w-10" />
                              <span
                                title={l.owner}
                                className="board grid h-8 w-8 -rotate-6 place-items-center rounded-full border-2 border-accent text-[13px] text-accent"
                              >
                                {l.owner === "Unassigned" ? "—" : initials(l.owner)}
                              </span>
                            </div>
                          </div>
                          {/* touch-friendly stage switcher */}
                          <select
                            aria-label="Move to lane"
                            value={l.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setLeadStatus(l.id, e.target.value as LeadStatus)}
                            className="mt-3 w-full rounded-[8px] bg-bone-2 px-2.5 py-1.5 text-[12px] lg:hidden"
                          >
                            {LEAD_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move to lane: {STAGE_CODE[s.id]} · {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <div
                      className={cn(
                        "grid flex-1 place-items-center rounded-[10px] border-2 border-dashed py-8 transition",
                        over ? "border-ink/40 bg-signal/40" : "border-ink/10",
                      )}
                    >
                      <span className="board text-lg text-ink/30">Drop ticket</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : filtered.length === 0 ? (
        <Empty title="No leads match" text="Try clearing the filters." />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-white">
          <div className="flex items-center justify-between bg-ink px-4 py-2.5 text-white">
            <span className="board text-lg tracking-wide">Lead manifest</span>
            <span className="eyebrow text-white/50">{filtered.length} entries</span>
          </div>
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full min-w-[880px] text-left text-[14px]">
              <thead className="border-b-2 border-ink text-muted">
                <tr>
                  {["Ticket", "Shipper", "Lane", "Service", "Source", "Owner", "Value", "Lane status", "Logged"].map((h) => (
                    <th key={h} className="eyebrow px-4 py-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-ink/15">
                {filtered.map((l) => (
                  <tr key={l.id} className="cursor-pointer transition hover:bg-tint/50" onClick={() => setEditing({ lead: l, isNew: false })}>
                    <td className="board px-4 py-3 text-[16px] text-accent">{l.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.company || l.name}</div>
                      <div className="text-[12px] text-muted">{l.company ? l.name : l.email}</div>
                    </td>
                    <td className="board px-4 py-3 text-[18px]">
                      {cityCode(l.origin)} <span className="text-ink/30">→</span> {cityCode(l.destination)}
                    </td>
                    <td className="px-4 py-3">{l.service}</td>
                    <td className="px-4 py-3 capitalize text-muted">{l.source}</td>
                    <td className="px-4 py-3">{l.owner}</td>
                    <td className="board px-4 py-3 text-[18px]">{inr(l.value || l.estimate)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", STAGE_BAR[l.status])} />
                        <span className="board text-[15px] tracking-wide">{STAGE_CODE[l.status]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{fmtDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <LeadDrawer
          key={editing.lead.id}
          lead={editing.lead}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={upsert}
          onDelete={remove}
          onConvert={convert}
        />
      )}
    </div>
  );
}

function LeadDrawer({
  lead,
  isNew,
  onClose,
  onSave,
  onDelete,
  onConvert,
}: {
  lead: Lead;
  isNew: boolean;
  onClose: () => void;
  onSave: (l: Lead, isNew: boolean) => void;
  onDelete: (l: Lead) => void;
  onConvert: (l: Lead) => void;
}) {
  const [d, setD] = useState<Lead>(lead);
  const [note, setNote] = useState("");
  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => setD((x) => ({ ...x, [k]: v }));

  const addNote = () => {
    if (!note.trim()) return;
    setD((x) => ({ ...x, notes: [{ id: newId("n"), text: note.trim(), at: new Date().toISOString(), by: "Admin" }, ...x.notes] }));
    setNote("");
  };

  const text = (k: keyof Lead, label: string, half = true, type = "text") => (
    <div className={half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
      <Label>{label}</Label>
      <input
        className="field"
        type={type}
        value={String(d[k] ?? "")}
        onChange={(e) => set(k, (type === "number" ? Number(e.target.value) : e.target.value) as never)}
      />
    </div>
  );

  return (
    <Drawer
      open
      onClose={onClose}
      title={isNew ? "Issue new ticket" : d.company || d.name || "Lead"}
      subtitle={isNew ? "Add a lead manually" : `${d.id} · created ${fmtDateTime(d.createdAt)}`}
      footer={
        <>
          <Btn variant="ink" onClick={() => onSave(d, isNew)} disabled={!d.name.trim()}>
            {isNew ? "Issue ticket" : "Save ticket"}
          </Btn>
          {!isNew && (
            <>
              <Btn variant="ghost" onClick={() => onConvert(d)}>
                <UserCheck size={15} /> Convert to customer
              </Btn>
              <Btn variant="danger" className="ml-auto" onClick={() => onDelete(d)}>
                <Trash2 size={15} />
              </Btn>
            </>
          )}
        </>
      }
    >
      {/* ticket stub */}
      <div className="relative mb-6 overflow-hidden rounded-[14px] bg-ink p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow text-white/45">Consignment ticket</div>
            <div className="board mt-1 text-3xl text-signal">{d.id}</div>
          </div>
          <Stamp tone={d.status === "lost" ? "red" : d.status === "won" ? "green" : "accent"} className="!border-signal !text-signal">
            {STAGE_CODE[d.status]}
          </Stamp>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="board text-4xl">{cityCode(d.origin)}</span>
          <span className="h-px flex-1 border-t border-dashed border-white/30" />
          <span className="board text-4xl">{cityCode(d.destination)}</span>
        </div>
        <div className="mt-1 flex justify-between text-[12px] text-white/55">
          <span>{d.origin || "Origin"}</span>
          <span>{d.destination || "Destination"}</span>
        </div>
        <span aria-hidden className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle_at_50%_100%,var(--bone)_0_6px,transparent_6.5px)] bg-[length:16px_16px]" />
      </div>

      {/* lane stepper */}
      <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar">
        {LEAD_STAGES.map((s, i) => {
          const on = d.status === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => set("status", s.id)}
              className={cn(
                "flex h-11 shrink-0 flex-col items-start justify-center rounded-[8px] px-3 transition",
                on ? (s.id === "lost" ? "bg-red-600 text-white" : s.id === "won" ? "bg-signal text-ink" : "bg-accent text-white") : "bg-bone-2 text-ink/55 hover:text-ink",
              )}
            >
              <span className="text-[9px] uppercase tracking-widest opacity-60">0{i + 1}</span>
              <span className="board text-[15px] leading-none tracking-wide">{STAGE_CODE[s.id]}</span>
            </button>
          );
        })}
      </div>

      <NoteSection n="01" title="Shipper">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {text("name", "Full name")}
          {text("company", "Company")}
          {text("email", "Email", true, "email")}
          {text("phone", "Phone", true, "tel")}
        </div>
      </NoteSection>

      <NoteSection n="02" title="Cargo & lane" className="mt-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="col-span-2 sm:col-span-1">
            <Label>Service</Label>
            <input className="field" value={d.service} onChange={(e) => set("service", e.target.value)} list="service-list" />
            <datalist id="service-list">
              {["Road Freight", "Air Freight", "Ocean Freight", "Warehousing", "Last-Mile Delivery", "Cold Chain", "Rail Freight", "Customs & Compliance"].map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          {text("weight", "Weight (kg)", true, "number")}
          {text("origin", "Origin")}
          {text("destination", "Destination")}
          <div className="col-span-2">
            <Label>Message</Label>
            <textarea className="field" rows={3} value={d.message} onChange={(e) => set("message", e.target.value)} />
          </div>
        </div>
      </NoteSection>

      <NoteSection n="03" title="Deal" className="mt-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="col-span-2 sm:col-span-1">
            <Label>Owner</Label>
            <select className="field" value={d.owner} onChange={(e) => set("owner", e.target.value)}>
              {Array.from(new Set([...OWNERS, d.owner])).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Source</Label>
            <select className="field capitalize" value={d.source} onChange={(e) => set("source", e.target.value as Lead["source"])}>
              {SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {text("estimate", "Quote estimate (₹)", true, "number")}
          {text("value", "Deal value (₹)", true, "number")}
        </div>
      </NoteSection>

      <NoteSection n="04" title="Activity log" className="mt-6">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center rounded-[10px] bg-ink pl-3 text-white">
            <span className="board text-signal">&gt;</span>
            <input
              className="h-[46px] w-full min-w-0 bg-transparent px-2 text-[14px] placeholder:text-white/35 focus:outline-none"
              placeholder="log call, email or next step…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addNote();
                }
              }}
            />
          </div>
          <button type="button" onClick={addNote} className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[10px] bg-signal text-ink" aria-label="Add note">
            <Send size={16} />
          </button>
        </div>
        <ol className="relative mt-5 space-y-4 border-l-2 border-dashed border-ink/15 pl-5">
          {d.notes.map((n, i) => (
            <motion.li key={n.id} className="relative" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-bone bg-accent" />
              <div className="board text-[13px] tracking-wide text-muted">
                {fmtDateTime(n.at)} · {n.by}
              </div>
              <p className="mt-0.5 text-[14px]">{n.text}</p>
            </motion.li>
          ))}
          <li className="relative">
            <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-bone bg-ink/30" />
            <div className="board text-[13px] tracking-wide text-muted">{fmtDateTime(d.createdAt)} · System</div>
            <p className="mt-0.5 text-[14px] text-muted">Ticket issued via {d.source}</p>
          </li>
        </ol>
        {!isNew && <p className="mt-4 text-[12px] text-muted">Log entries are saved when you press “Save ticket”.</p>}
      </NoteSection>
    </Drawer>
  );
}

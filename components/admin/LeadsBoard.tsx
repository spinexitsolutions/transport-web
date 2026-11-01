"use client";
import { useMemo, useState } from "react";
import { Kanban, List, Plus, Send, Trash2, UserCheck } from "lucide-react";
import { LEAD_STAGES, type Customer, type Lead, type LeadStatus } from "@/lib/types";
import { cn, compactInr, fmtDate, fmtDateTime, inr } from "@/lib/utils";
import { getKey, newId, putKey, useKey } from "./api";
import { useToast } from "./Toast";
import { Badge, Btn, Drawer, Empty, Label, LEAD_TONE, Loading, PageHeader, Search, Segmented } from "./ui";

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

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export function LeadsBoard() {
  const toast = useToast();
  const { data, save } = useKey("leads");
  const [view, setView] = useState<"board" | "table">("board");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [source, setSource] = useState<Lead["source"] | "all">("all");
  const [editing, setEditing] = useState<{ lead: Lead; isNew: boolean } | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

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

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Leads pipeline"
        description={`${leads.length} leads · ${compactInr(totalOpen)} open pipeline. Drag cards between stages to update them.`}
        actions={
          <Btn variant="ink" onClick={() => setEditing({ lead: blankLead(), isNew: true })}>
            <Plus size={15} /> Add lead
          </Btn>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "board", label: <><Kanban size={14} /> Board</> },
            { value: "table", label: <><List size={14} /> Table</> },
          ]}
        />
        <Search value={q} onChange={setQ} placeholder="Search name, company, lane…" />
        <div className="flex gap-2">
          <select className="field !h-10 !w-auto !rounded-full !py-0" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | "all")}>
            <option value="all">All stages</option>
            {LEAD_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select className="field !h-10 !w-auto !rounded-full !py-0 capitalize" value={source} onChange={(e) => setSource(e.target.value as Lead["source"] | "all")}>
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
          {LEAD_STAGES.filter((s) => status === "all" || s.id === status).map((stage) => {
            const items = filtered.filter((l) => l.status === stage.id);
            const sum = items.reduce((a, l) => a + (l.value || l.estimate), 0);
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
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) setLeadStatus(id, stage.id);
                }}
                className={cn(
                  "flex w-[82vw] max-w-[300px] shrink-0 snap-start flex-col rounded-[16px] p-2 transition-colors sm:w-[280px]",
                  dragOver === stage.id ? "bg-accent/15 ring-2 ring-accent" : "bg-[#ebe8e1]",
                )}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    <Badge tone={LEAD_TONE[stage.id]}>{stage.label}</Badge>
                    <span className="text-muted">{items.length}</span>
                  </div>
                  <span className="text-[12px] tabular-nums text-muted">{compactInr(sum)}</span>
                </div>
                <div className="flex min-h-[120px] flex-col gap-2">
                  {items.map((l) => (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", l.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => setEditing({ lead: l, isNew: false })}
                      className="cursor-grab rounded-2xl border border-line bg-white p-3.5 shadow-[0_1px_0_rgba(0,0,0,.03)] transition-shadow hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,.3)] active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">{initials(l.name)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-medium leading-tight">{l.name || "Unnamed"}</div>
                          <div className="truncate text-[12px] text-muted">{l.company || "—"}</div>
                        </div>
                        <span className="text-[13px] font-semibold tabular-nums">{compactInr(l.value || l.estimate)}</span>
                      </div>
                      <div className="mt-3 truncate text-[12px] text-ink/70">
                        {l.service}
                        {l.origin && ` · ${l.origin} → ${l.destination}`}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted">
                        <span className="capitalize">
                          {l.source} · {fmtDate(l.createdAt, { day: "numeric", month: "short" })}
                        </span>
                        <span>{l.owner}</span>
                      </div>
                      {/* touch-friendly stage switcher */}
                      <select
                        aria-label="Move to stage"
                        value={l.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setLeadStatus(l.id, e.target.value as LeadStatus)}
                        className="mt-3 w-full rounded-xl bg-bone-2 px-2.5 py-1.5 text-[12px] lg:hidden"
                      >
                        {LEAD_STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            Move to: {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {items.length === 0 && <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-ink/10 py-8 text-[12px] text-muted">Drop here</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : filtered.length === 0 ? (
        <Empty title="No leads match" text="Try clearing the filters." />
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-line bg-white">
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full min-w-[820px] text-left text-[14px]">
              <thead className="border-b border-line bg-bone/60 text-[12px] text-muted">
                <tr>
                  {["Lead", "Service & lane", "Source", "Owner", "Value", "Stage", "Created"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((l) => (
                  <tr key={l.id} className="cursor-pointer transition hover:bg-bone/50" onClick={() => setEditing({ lead: l, isNew: false })}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-[12px] text-muted">{l.company || l.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{l.service}</div>
                      <div className="text-[12px] text-muted">{l.origin ? `${l.origin} → ${l.destination}` : "—"}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{l.source}</td>
                    <td className="px-4 py-3">{l.owner}</td>
                    <td className="px-4 py-3 tabular-nums">{inr(l.value || l.estimate)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={LEAD_TONE[l.status]}>{l.status}</Badge>
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
      title={isNew ? "New lead" : d.name || "Lead"}
      subtitle={isNew ? "Add a lead manually" : `${d.id} · created ${fmtDateTime(d.createdAt)}`}
      footer={
        <>
          <Btn variant="ink" onClick={() => onSave(d, isNew)} disabled={!d.name.trim()}>
            {isNew ? "Create lead" : "Save changes"}
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
      {/* stage stepper */}
      <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar">
        {LEAD_STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => set("status", s.id)}
            className={cn(
              "h-8 shrink-0 rounded-full px-3 text-[12px] font-medium transition",
              d.status === s.id ? (s.id === "lost" ? "bg-red-600 text-white" : s.id === "won" ? "bg-accent text-accent-ink" : "bg-ink text-white") : "bg-bone-2 text-ink/60 hover:text-ink",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {text("name", "Full name")}
        {text("company", "Company")}
        {text("email", "Email", true, "email")}
        {text("phone", "Phone", true, "tel")}
        <div className="col-span-2 sm:col-span-1">
          <Label>Service</Label>
          <input className="field" value={d.service} onChange={(e) => set("service", e.target.value)} list="service-list" />
          <datalist id="service-list">
            {["Road Freight", "Air Freight", "Ocean Freight", "Warehousing", "Last-Mile Delivery", "Cold Chain", "Rail Freight", "Customs & Compliance"].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Owner</Label>
          <select className="field" value={d.owner} onChange={(e) => set("owner", e.target.value)}>
            {Array.from(new Set([...OWNERS, d.owner])).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        {text("origin", "Origin")}
        {text("destination", "Destination")}
        {text("weight", "Weight (kg)", true, "number")}
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
        <div className="col-span-2">
          <Label>Message</Label>
          <textarea className="field" rows={3} value={d.message} onChange={(e) => set("message", e.target.value)} />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-[15px] font-semibold tracking-tight">Activity & notes</h3>
        <div className="flex gap-2">
          <input
            className="field"
            placeholder="Log a call, email or next step…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNote();
              }
            }}
          />
          <button type="button" onClick={addNote} className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-ink text-white" aria-label="Add note">
            <Send size={16} />
          </button>
        </div>
        <ol className="relative mt-5 space-y-4 border-l border-line pl-5">
          {d.notes.map((n) => (
            <li key={n.id} className="relative">
              <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bone bg-accent" />
              <p className="text-[14px]">{n.text}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {n.by} · {fmtDateTime(n.at)}
              </p>
            </li>
          ))}
          <li className="relative">
            <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bone bg-ink/30" />
            <p className="text-[14px] text-muted">Lead created via {d.source}</p>
            <p className="mt-0.5 text-[12px] text-muted">{fmtDateTime(d.createdAt)}</p>
          </li>
        </ol>
        {!isNew && <p className="mt-4 text-[12px] text-muted">Notes are saved when you press “Save changes”.</p>}
      </div>
    </Drawer>
  );
}

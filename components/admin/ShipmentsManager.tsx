"use client";
import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Plus, Trash2, X } from "lucide-react";
import { SHIPMENT_FLOW, SHIPMENT_STATUS_LABEL, type Shipment, type ShipmentEvent, type ShipmentStatus } from "@/lib/types";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";
import { newId, useKey } from "./api";
import { DateInput } from "./fields";
import { useToast } from "./Toast";
import { Badge, Btn, Drawer, Empty, Label, Loading, PageHeader, Search, SHIPMENT_TONE } from "./ui";

const ALL_STATUSES: ShipmentStatus[] = [...SHIPMENT_FLOW, "exception"];

const trackingId = () => `KNT-${Math.floor(100000 + Math.random() * 900000)}`;

const blank = (): Shipment => {
  const now = new Date();
  const eta = new Date(now.getTime() + 3 * 86400000);
  return {
    id: trackingId(),
    customer: "",
    service: "Road Freight",
    origin: "",
    destination: "",
    weight: 0,
    pieces: 1,
    status: "booked",
    eta: eta.toISOString(),
    createdAt: now.toISOString(),
    events: [{ id: newId("e"), status: "booked", location: "", note: "Shipment booked & documents verified", at: now.toISOString() }],
  };
};

function progress(s: ShipmentStatus) {
  if (s === "exception") return 50;
  return Math.round(((SHIPMENT_FLOW.indexOf(s) + 1) / SHIPMENT_FLOW.length) * 100);
}

export function ShipmentsManager() {
  const toast = useToast();
  const { data, save } = useKey("shipments");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ShipmentStatus | "all" | "active">("active");
  const [editing, setEditing] = useState<{ s: Shipment; isNew: boolean } | null>(null);

  const list = useMemo(() => data ?? [], [data]);
  const filtered = list.filter(
    (s) =>
      (filter === "all" || (filter === "active" ? s.status !== "delivered" : s.status === filter)) &&
      (!q || `${s.id} ${s.customer} ${s.origin} ${s.destination} ${s.service}`.toLowerCase().includes(q.toLowerCase())),
  );

  const persist = async (next: Shipment[], msg: string) => {
    try {
      await save(next);
      toast(msg);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  if (!data) return <Loading label="Loading shipments" />;

  const counts: Record<string, number> = { all: list.length, active: list.filter((s) => s.status !== "delivered").length };
  ALL_STATUSES.forEach((st) => (counts[st] = list.filter((s) => s.status === st).length));

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Shipments"
        description="Create shipments and post tracking events — customers see every update instantly on the public tracking page."
        actions={
          <Btn variant="ink" onClick={() => setEditing({ s: blank(), isNew: true })}>
            <Plus size={15} /> New shipment
          </Btn>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <Search value={q} onChange={setQ} placeholder="Tracking ID, customer, city…" />
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          {(["active", "all", ...ALL_STATUSES] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-[12px] font-medium transition",
                filter === f ? "bg-ink text-white" : "bg-white text-ink/60 ring-1 ring-line hover:text-ink",
              )}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : SHIPMENT_STATUS_LABEL[f]} <span className="opacity-50">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No shipments here" text="Change the filter or create a new shipment." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setEditing({ s, isNew: false })}
              className="group rounded-[22px] border border-line bg-white p-5 text-left transition hover:border-ink/25 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,.3)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[13px] font-semibold">{s.id}</span>
                <Badge tone={SHIPMENT_TONE[s.status]}>{SHIPMENT_STATUS_LABEL[s.status]}</Badge>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-muted">From</div>
                  <div className="truncate font-medium">{s.origin || "—"}</div>
                </div>
                <div className="flex flex-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                  <span className="h-px flex-1 border-t border-dashed border-ink/30" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <div className="text-[11px] text-muted">To</div>
                  <div className="truncate font-medium">{s.destination || "—"}</div>
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-bone-2">
                <div className={cn("h-full rounded-full", s.status === "exception" ? "bg-red-500" : s.status === "delivered" ? "bg-emerald-500" : "bg-accent")} style={{ width: `${progress(s.status)}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
                <span className="truncate">{s.customer || "No customer"} · {s.service}</span>
                <span className="shrink-0">ETA {fmtDate(s.eta, { day: "numeric", month: "short" })}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <ShipmentDrawer
          key={editing.s.id + String(editing.isNew)}
          shipment={editing.s}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={(s) => {
            if (editing.isNew && list.some((x) => x.id === s.id)) {
              toast("Tracking ID already exists", "error");
              return;
            }
            persist(editing.isNew ? [s, ...list] : list.map((x) => (x.id === editing.s.id ? s : x)), editing.isNew ? "Shipment created" : "Shipment updated");
            setEditing(null);
          }}
          onDelete={(s) => {
            if (!confirm(`Delete shipment ${s.id}?`)) return;
            persist(
              list.filter((x) => x.id !== s.id),
              "Shipment deleted",
            );
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ShipmentDrawer({
  shipment,
  isNew,
  onClose,
  onSave,
  onDelete,
}: {
  shipment: Shipment;
  isNew: boolean;
  onClose: () => void;
  onSave: (s: Shipment) => void;
  onDelete: (s: Shipment) => void;
}) {
  const [d, setD] = useState<Shipment>(shipment);
  const nextStatus = SHIPMENT_FLOW[Math.min(SHIPMENT_FLOW.indexOf(d.status) + 1, SHIPMENT_FLOW.length - 1)] ?? "in_transit";
  const [ev, setEv] = useState<Omit<ShipmentEvent, "id">>({ status: nextStatus, location: "", note: "", at: new Date().toISOString() });
  const set = <K extends keyof Shipment>(k: K, v: Shipment[K]) => setD((x) => ({ ...x, [k]: v }));

  const sortEvents = (events: ShipmentEvent[]) => [...events].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  const addEvent = () => {
    const events = sortEvents([{ ...ev, id: newId("e"), note: ev.note || SHIPMENT_STATUS_LABEL[ev.status] }, ...d.events]);
    setD((x) => ({ ...x, events, status: events[0].status }));
    const after = SHIPMENT_FLOW[Math.min(SHIPMENT_FLOW.indexOf(ev.status) + 1, SHIPMENT_FLOW.length - 1)] ?? ev.status;
    setEv({ status: after, location: "", note: "", at: new Date().toISOString() });
  };

  const removeEvent = (id: string) =>
    setD((x) => {
      const events = x.events.filter((e) => e.id !== id);
      return { ...x, events, status: events[0]?.status ?? "booked" };
    });

  const input = (k: keyof Shipment, label: string, type = "text") => (
    <div className="col-span-2 sm:col-span-1">
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
      title={isNew ? "New shipment" : d.id}
      subtitle={isNew ? "Booking a new consignment" : `${d.customer || "—"} · ${SHIPMENT_STATUS_LABEL[d.status]}`}
      footer={
        <>
          <Btn variant="ink" onClick={() => onSave(d)} disabled={!d.id.trim() || !d.origin.trim() || !d.destination.trim()}>
            {isNew ? "Create shipment" : "Save changes"}
          </Btn>
          {!isNew && (
            <>
              <a
                href={`/track?id=${encodeURIComponent(d.id)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium hover:border-ink/25"
              >
                <ExternalLink size={15} /> Public tracking
              </a>
              <Btn variant="danger" className="ml-auto" onClick={() => onDelete(d)}>
                <Trash2 size={15} />
              </Btn>
            </>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <div className="col-span-2 sm:col-span-1">
          <Label>Tracking ID</Label>
          <input className="field font-mono uppercase" value={d.id} disabled={!isNew} onChange={(e) => set("id", e.target.value.toUpperCase())} />
        </div>
        {input("customer", "Customer")}
        <div className="col-span-2 sm:col-span-1">
          <Label>Service</Label>
          <select className="field" value={d.service} onChange={(e) => set("service", e.target.value)}>
            {["Road Freight", "Air Freight", "Ocean Freight", "Warehousing", "Last-Mile Delivery", "Cold Chain", "Rail Freight", "Customs & Compliance"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>ETA</Label>
          <DateInput value={d.eta} onChange={(v) => set("eta", v)} />
        </div>
        {input("origin", "Origin")}
        {input("destination", "Destination")}
        {input("weight", "Weight (kg)", "number")}
        {input("pieces", "Pieces", "number")}
      </div>

      <div className="mt-8 rounded-[20px] bg-white p-4 ring-1 ring-line">
        <h3 className="text-[15px] font-semibold tracking-tight">Post a tracking update</h3>
        <p className="mt-0.5 text-[12px] text-muted">The latest event sets the shipment status.</p>
        <div className="mt-4 -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar">
          {ALL_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setEv((x) => ({ ...x, status: st }))}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-[12px] font-medium transition",
                ev.status === st ? (st === "exception" ? "bg-red-600 text-white" : "bg-ink text-white") : "bg-bone-2 text-ink/60",
              )}
            >
              {SHIPMENT_STATUS_LABEL[st]}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input className="field" placeholder="Location (e.g. Gurugram Hub)" value={ev.location} onChange={(e) => setEv((x) => ({ ...x, location: e.target.value }))} />
          <DateInput value={ev.at} onChange={(v) => setEv((x) => ({ ...x, at: v || new Date().toISOString() }))} />
          <input className="field sm:col-span-2" placeholder="Note for the customer (optional)" value={ev.note} onChange={(e) => setEv((x) => ({ ...x, note: e.target.value }))} />
        </div>
        <Btn variant="accent" className="mt-3" onClick={addEvent}>
          <Plus size={15} /> Add event
        </Btn>
      </div>

      <h3 className="mb-3 mt-8 text-[15px] font-semibold tracking-tight">Timeline</h3>
      <ol className="relative space-y-5 border-l border-line pl-5">
        {d.events.map((e, i) => (
          <li key={e.id} className="group relative">
            <span className={cn("absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-bone", i === 0 ? (e.status === "exception" ? "bg-red-500" : "bg-accent") : "bg-ink/30")} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[14px] font-medium">{SHIPMENT_STATUS_LABEL[e.status]}</div>
                <div className="text-[13px] text-ink/70">{e.note}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                  <MapPin size={11} /> {e.location || "—"} · {fmtDateTime(e.at)}
                </div>
              </div>
              <button onClick={() => removeEvent(e.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-red-50 hover:text-red-600" aria-label="Remove event">
                <X size={14} />
              </button>
            </div>
          </li>
        ))}
        {d.events.length === 0 && <li className="text-sm text-muted">No events yet.</li>}
      </ol>
    </Drawer>
  );
}

"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, MapPin, Plus, ScanLine, Trash2, X } from "lucide-react";
import { SHIPMENT_FLOW, SHIPMENT_STATUS_LABEL, type Shipment, type ShipmentEvent, type ShipmentStatus } from "@/lib/types";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";
import { newId, useKey } from "./api";
import { DateInput } from "./fields";
import { useToast } from "./Toast";
import { Btn, Drawer, Empty, Label, Loading, Search } from "./ui";
import { BoardTabs, CrmHeader, NoteSection, Stamp, cityCode } from "./crm/kit";

const MODE: Record<string, string> = {
  "Road Freight": "ROAD",
  "Air Freight": "AIR",
  "Ocean Freight": "SEA",
  Warehousing: "WHS",
  "Last-Mile Delivery": "LMD",
  "Cold Chain": "COLD",
  "Rail Freight": "RAIL",
  "Customs & Compliance": "CUS",
};
const SHORT: Record<ShipmentStatus, string> = {
  booked: "Booked",
  picked: "Picked up",
  in_transit: "In transit",
  customs: "Customs",
  out_for_delivery: "Out for dlv",
  delivered: "Delivered",
  exception: "Exception",
};

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

  const delayed = list.filter((s) => s.status === "exception").length;

  return (
    <div>
      <CrmHeader
        code="CRM-02"
        module="Movements"
        title="Departures"
        accent="board"
        description="Book consignments and post scans — every event shows up instantly on the public tracking page."
        stats={[
          { label: "On the move", value: String(counts.active), tone: "ink" },
          { label: "Delivered", value: String(counts.delivered ?? 0), tone: "signal" },
          { label: "Exceptions", value: String(delayed) },
          { label: "Total booked", value: String(list.length) },
        ]}
        actions={
          <Btn variant="ink" onClick={() => setEditing({ s: blank(), isNew: true })}>
            <Plus size={15} /> Book shipment
          </Btn>
        }
      />

      <div className="overflow-hidden rounded-[16px] bg-ink text-white">
        <div className="flex flex-col gap-3 border-b border-white/10 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="board text-[26px] leading-none text-signal">Departures</span>
              <span className="eyebrow flex items-center gap-1.5 text-white/50">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> Live
              </span>
            </div>
            <div className="[&_input]:!bg-white/10 [&_input]:!text-white [&_input]:placeholder:!text-white/40 [&_svg]:!text-white/50 sm:w-72">
              <Search value={q} onChange={setQ} placeholder="Tracking ID, customer, city…" />
            </div>
          </div>
          <BoardTabs
            dark
            value={filter}
            onChange={setFilter}
            options={(["active", "all", ...ALL_STATUSES] as const).map((f) => ({
              value: f,
              label: f === "all" ? "All" : f === "active" ? "Active" : SHORT[f],
              count: counts[f],
            }))}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-6 [&_*]:!text-white/70">
            <Empty title="No departures here" text="Change the filter or book a new shipment." />
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.1fr_1.4fr_.6fr_.7fr_1fr] gap-4 px-5 pt-3 md:grid">
              {["Flight / ID", "Route", "Mode", "ETA", "Status"].map((h) => (
                <span key={h} className="eyebrow text-white/35">
                  {h}
                </span>
              ))}
            </div>
            <ul className="divide-y divide-white/[0.07]">
              {filtered.map((s, i) => (
                <motion.li key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}>
                  <button
                    onClick={() => setEditing({ s, isNew: false })}
                    className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left transition hover:bg-white/[0.05] md:grid-cols-[1.1fr_1.4fr_.6fr_.7fr_1fr] md:px-5"
                  >
                    <div className="min-w-0">
                      <div className="board text-[20px] leading-none tracking-wide text-white">{s.id}</div>
                      <div className="mt-1 truncate text-[12px] text-white/45">{s.customer || "No customer"}</div>
                    </div>
                    <div className="order-3 col-span-2 flex items-center gap-2 md:order-none md:col-span-1">
                      <span className="board text-[24px] leading-none">{cityCode(s.origin)}</span>
                      <span className="relative flex h-3 flex-1 items-center">
                        <span className="h-px w-full border-t border-dashed border-white/25" />
                        <span
                          className={cn("absolute h-1.5 w-1.5 rounded-full", s.status === "exception" ? "bg-red-500" : "bg-signal")}
                          style={{ left: `calc(${progress(s.status)}% - 3px)` }}
                        />
                      </span>
                      <span className="board text-[24px] leading-none">{cityCode(s.destination)}</span>
                    </div>
                    <span className="board hidden text-[17px] tracking-wide text-white/70 md:block">{MODE[s.service] ?? "FRT"}</span>
                    <span className="board hidden text-[17px] tracking-wide md:block">{fmtDate(s.eta, { day: "2-digit", month: "short" }).toUpperCase()}</span>
                    <span className="justify-self-end md:justify-self-start">
                      <span
                        className={cn(
                          "board inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-[14px] tracking-wider",
                          s.status === "exception" ? "bg-red-500 text-white" : s.status === "delivered" ? "bg-white/10 text-white/60" : "bg-signal text-ink",
                        )}
                      >
                        {s.status !== "delivered" && s.status !== "exception" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />}
                        {SHORT[s.status]}
                      </span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </div>

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
      title={isNew ? "Book a shipment" : d.id}
      subtitle={isNew ? "Booking a new consignment" : `${d.customer || "—"} · ${SHIPMENT_STATUS_LABEL[d.status]}`}
      footer={
        <>
          <Btn variant="ink" onClick={() => onSave(d)} disabled={!d.id.trim() || !d.origin.trim() || !d.destination.trim()}>
            {isNew ? "Book shipment" : "Save consignment"}
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
      {/* consignment note header */}
      <div className="relative mb-6 overflow-hidden rounded-[14px] bg-ink p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow text-white/45">Consignment note · {MODE[d.service] ?? "FRT"}</div>
            <div className="board mt-1 text-3xl text-signal">{d.id || "KNT-——————"}</div>
          </div>
          <Stamp tone={d.status === "exception" ? "red" : "accent"} className={d.status === "exception" ? "" : "!border-signal !text-signal"}>
            {SHORT[d.status]}
          </Stamp>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="board text-4xl">{cityCode(d.origin)}</span>
          <span className="h-px flex-1 border-t border-dashed border-white/30" />
          <span className="board text-4xl">{cityCode(d.destination)}</span>
        </div>
        {/* stops */}
        <div className="relative mt-5">
          <div className="absolute left-0 right-0 top-[7px] h-[2px] bg-white/15" />
          <motion.div
            className={cn("absolute left-0 top-[7px] h-[2px]", d.status === "exception" ? "bg-red-500" : "bg-signal")}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, SHIPMENT_FLOW.indexOf(d.status === "exception" ? "in_transit" : d.status)) / (SHIPMENT_FLOW.length - 1) * 100}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="relative flex justify-between">
            {SHIPMENT_FLOW.map((st, i) => {
              const reached = d.status !== "exception" && SHIPMENT_FLOW.indexOf(d.status) >= i;
              return (
                <div key={st} className="flex w-0 flex-col items-center">
                  <span className={cn("grid h-4 w-4 place-items-center rounded-full border-2", reached ? "border-signal bg-signal text-ink" : "border-white/30 bg-ink")}>
                    {reached && <Check size={9} strokeWidth={3} />}
                  </span>
                  <span className="mt-1.5 whitespace-nowrap text-[9px] uppercase tracking-wider text-white/50">{SHORT[st].split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <NoteSection n="01" title="Booking">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="col-span-2 sm:col-span-1">
            <Label>Tracking ID</Label>
            <input className="field board !text-lg uppercase tracking-wide" value={d.id} disabled={!isNew} onChange={(e) => set("id", e.target.value.toUpperCase())} />
          </div>
          {input("customer", "Customer")}
          <div className="col-span-2 sm:col-span-1">
            <Label>Service</Label>
            <select className="field" value={d.service} onChange={(e) => set("service", e.target.value)}>
              {Object.keys(MODE).map((s) => (
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
      </NoteSection>

      <NoteSection n="02" title="Scan an update" className="mt-6">
        <div className="rounded-[14px] bg-ink p-3 text-white sm:p-4">
          <div className="flex items-center gap-2">
            <ScanLine size={16} className="text-signal" />
            <span className="board text-lg tracking-wide">Scanner</span>
            <span className="ml-auto text-[11px] text-white/45">Latest event sets the status</span>
          </div>
          <div className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar">
            {ALL_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setEv((x) => ({ ...x, status: st }))}
                className={cn(
                  "board h-9 shrink-0 rounded-[6px] px-3 text-[14px] tracking-wide transition",
                  ev.status === st ? (st === "exception" ? "bg-red-500 text-white" : "bg-signal text-ink") : "bg-white/[0.07] text-white/55 hover:text-white",
                )}
              >
                {SHORT[st]}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 [&_.field]:border-white/10 [&_.field]:bg-white/[0.06] [&_.field]:text-white [&_.field]:placeholder:text-white/35">
            <input className="field" placeholder="Location (e.g. Gurugram Hub)" value={ev.location} onChange={(e) => setEv((x) => ({ ...x, location: e.target.value }))} />
            <DateInput value={ev.at} onChange={(v) => setEv((x) => ({ ...x, at: v || new Date().toISOString() }))} />
            <input className="field sm:col-span-2" placeholder="Note for the customer (optional)" value={ev.note} onChange={(e) => setEv((x) => ({ ...x, note: e.target.value }))} />
          </div>
          <button
            type="button"
            onClick={addEvent}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-signal text-[14px] font-semibold text-ink transition active:scale-[0.99]"
          >
            <Plus size={15} /> Record scan
          </button>
        </div>
      </NoteSection>

      <NoteSection n="03" title={`Event log · ${d.events.length}`} className="mt-6">
        <ol className="relative space-y-4 border-l-2 border-dashed border-ink/15 pl-5">
          {d.events.map((e, i) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="group relative">
              <span
                className={cn(
                  "absolute -left-[28px] top-1 h-3.5 w-3.5 rounded-full border-2 border-bone",
                  i === 0 ? (e.status === "exception" ? "bg-red-500" : "bg-accent ring-4 ring-accent/20") : "bg-ink/30",
                )}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="board text-[18px] leading-none tracking-wide">{SHIPMENT_STATUS_LABEL[e.status]}</div>
                  <div className="mt-1 text-[13px] text-ink/70">{e.note}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                    <MapPin size={11} /> {e.location || "—"} · {fmtDateTime(e.at)}
                  </div>
                </div>
                <button onClick={() => removeEvent(e.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-red-50 hover:text-red-600" aria-label="Remove event">
                  <X size={14} />
                </button>
              </div>
            </motion.li>
          ))}
          {d.events.length === 0 && <li className="text-sm text-muted">No scans yet.</li>}
        </ol>
      </NoteSection>
    </Drawer>
  );
}

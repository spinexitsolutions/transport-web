import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDB } from "@/lib/db";
import { LEAD_STAGES, SHIPMENT_STATUS_LABEL } from "@/lib/types";
import { compactInr, fmtDate } from "@/lib/utils";
import { Badge } from "@/components/admin/ui";
import { LEAD_TONE } from "@/components/admin/tones";

export const dynamic = "force-dynamic";

const DAY = 86400000;

/** 3-letter route code from a city / place name. */
const code = (place: string) => {
  const map: Record<string, string> = {
    mumbai: "BOM", delhi: "DEL", gurugram: "GGN", bengaluru: "BLR", chennai: "MAA", kolkata: "CCU", hyderabad: "HYD",
    pune: "PNQ", dubai: "DXB", singapore: "SIN", rotterdam: "RTM", kochi: "COK", mundra: "MUN", bhiwandi: "BHW",
    chakan: "CKN", "jebel ali": "JEA", jaipur: "JAI", ludhiana: "LUH", "new york": "JFK",
  };
  const key = place.toLowerCase().split(",")[0].trim();
  return map[key] ?? key.replace(/[^a-z]/g, "").slice(0, 3).toUpperCase();
};

export default async function Dashboard() {
  const db = await getDB();
  const { leads, shipments, applications, subscribers, customers } = db;
  const now = Date.now();

  const open = leads.filter((l) => l.status !== "won" && l.status !== "lost");
  const pipeline = open.reduce((a, l) => a + (l.value || l.estimate), 0);
  const won = leads.filter((l) => l.status === "won");
  const lost = leads.filter((l) => l.status === "lost");
  const wonRevenue = won.reduce((a, l) => a + l.value, 0);
  const conversion = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  const newLeads7 = leads.filter((l) => now - new Date(l.createdAt).getTime() < 7 * DAY).length;
  const active = shipments.filter((s) => s.status !== "delivered");

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY);
    const key = d.toDateString();
    return {
      label: d.toLocaleDateString("en-IN", { day: "2-digit" }),
      full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      count: leads.filter((l) => new Date(l.createdAt).toDateString() === key).length,
    };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const total14 = days.reduce((a, d) => a + d.count, 0);

  const byStage = LEAD_STAGES.map((s) => {
    const ls = leads.filter((l) => l.status === s.id);
    return { ...s, count: ls.length, value: ls.reduce((a, l) => a + (l.value || l.estimate), 0) };
  });
  const maxStage = Math.max(1, ...byStage.map((s) => s.value));

  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow flex items-center gap-2 text-muted">
            <span className="cross text-accent" /> Daily operations brief
          </div>
          <h1 className="board mt-3 text-[clamp(3rem,8vw,5.5rem)] leading-[0.85]">
            Ops <span className="text-accent">·</span> {dateLabel}
          </h1>
        </div>
        <Link href="/admin/leads" className="group inline-flex h-11 items-center gap-2 self-start rounded-[11px] bg-ink pl-4 pr-1.5 text-sm font-medium text-white sm:self-auto">
          Open pipeline
          <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-signal text-ink transition-transform group-hover:rotate-45">
            <ArrowUpRight size={15} />
          </span>
        </Link>
      </div>

      {/* KPI colour blocks */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-12">
        <Link href="/admin/leads" className="group relative col-span-2 overflow-hidden rounded-[16px] bg-accent p-5 text-white lg:col-span-4 lg:row-span-2 lg:p-6">
          <span className="board pointer-events-none absolute -bottom-6 -right-2 text-[9rem] leading-none text-white/[0.07]" aria-hidden>
            ₹
          </span>
          <div className="flex items-center justify-between">
            <span className="board text-[13px] tracking-[0.14em] text-white/70">KPI-01 · Open pipeline</span>
            <ArrowUpRight size={18} className="transition-transform group-hover:rotate-45" />
          </div>
          <div className="board mt-6 text-[clamp(3.6rem,9vw,6.5rem)] leading-[0.85]">{compactInr(pipeline)}</div>
          <div className="mt-3 text-sm text-white/70">{open.length} open deals moving through the lanes</div>
          <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-white/15">
            {byStage
              .filter((s) => s.id !== "won" && s.id !== "lost")
              .map((s, i) => (
                <span key={s.id} style={{ width: `${(s.value / Math.max(1, pipeline)) * 100}%` }} className={i % 2 ? "bg-white/50" : "bg-signal"} />
              ))}
          </div>
        </Link>

        <div className="rounded-[16px] bg-signal p-5 text-ink lg:col-span-4">
          <div className="board text-[13px] tracking-[0.14em] text-ink/60">KPI-02 · Won revenue</div>
          <div className="board mt-4 text-[clamp(2.6rem,5vw,3.6rem)] leading-none">{compactInr(wonRevenue)}</div>
          <div className="mt-2 text-[13px] text-ink/70">{won.length} deals closed</div>
        </div>

        <div className="rounded-[16px] bg-ink p-5 text-white lg:col-span-4">
          <div className="board text-[13px] tracking-[0.14em] text-white/50">KPI-03 · Win rate</div>
          <div className="mt-4 flex items-end gap-3">
            <span className="board text-[clamp(2.6rem,5vw,3.6rem)] leading-none text-signal">{conversion}%</span>
            <span className="mb-1 text-[13px] text-white/55">
              {won.length} won · {lost.length} lost
            </span>
          </div>
        </div>

        <div className="rounded-[16px] border border-line bg-white p-5 lg:col-span-4">
          <div className="board text-[13px] tracking-[0.14em] text-muted">KPI-04 · New leads · 7D</div>
          <div className="board mt-4 text-[clamp(2.6rem,5vw,3.6rem)] leading-none">{String(newLeads7).padStart(2, "0")}</div>
          <div className="mt-2 text-[13px] text-muted">{leads.filter((l) => l.status === "new").length} awaiting first contact</div>
        </div>

        <div className="rounded-[16px] bg-tint p-5 lg:col-span-4">
          <div className="board text-[13px] tracking-[0.14em] text-accent">KPI-05 · Active shipments</div>
          <div className="board mt-4 text-[clamp(2.6rem,5vw,3.6rem)] leading-none">{String(active.length).padStart(2, "0")}</div>
          <div className="mt-2 text-[13px] text-muted">{shipments.length - active.length} delivered</div>
        </div>
      </div>

      {/* charts */}
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* departure-board columns */}
        <section className="rounded-[16px] bg-ink p-5 text-white sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="board text-[13px] tracking-[0.1em] text-signal">CH-01</span>
              <h2 className="board text-[20px] tracking-[0.04em]">Inbound leads · 14 days</h2>
            </div>
            <span className="board text-[13px] text-white/50">{total14} total</span>
          </div>
          <div className="mt-6 grid h-48 items-end gap-[5px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {days.map((d, i) => {
              const last = i === days.length - 1;
              const cells = 8;
              const lit = d.count ? Math.max(1, Math.round((d.count / maxDay) * cells)) : 0;
              return (
                <div key={i} className="flex h-full flex-col items-center justify-end gap-[3px]" title={`${d.full}: ${d.count} lead${d.count === 1 ? "" : "s"}`}>
                  <span className={`board text-[12px] ${d.count ? (last ? "text-signal" : "text-white/80") : "text-transparent"}`}>{d.count}</span>
                  {Array.from({ length: cells }).map((_, c) => {
                    const on = cells - c <= lit;
                    return (
                      <span
                        key={c}
                        className={`w-full flex-1 rounded-[3px] ${on ? (last ? "bg-signal" : "bg-white/85") : "bg-white/[0.06]"}`}
                        style={{ maxHeight: 16 }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="mt-2 grid gap-[5px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {days.map((d, i) => (
              <span key={i} className={`board text-center text-[11px] ${i === days.length - 1 ? "text-signal" : "text-white/35"}`}>
                {d.label}
              </span>
            ))}
          </div>
        </section>

        {/* freight lanes */}
        <section className="rounded-[16px] border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="board text-[13px] tracking-[0.1em] text-accent">CH-02</span>
              <h2 className="board text-[20px] tracking-[0.04em]">Pipeline lanes</h2>
            </div>
            <span className="eyebrow text-muted">Deal value</span>
          </div>
          <ul className="mt-5 space-y-3">
            {byStage.map((s, i) => {
              const pct = Math.max(3, (s.value / maxStage) * 100);
              return (
                <li key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2">
                      <span className="board w-6 text-muted">L{i + 1}</span>
                      {s.label}
                      <span className="board text-muted">×{s.count}</span>
                    </span>
                    <span className="board text-[15px]">{compactInr(s.value)}</span>
                  </div>
                  {/* lane: dashed road with a vehicle at the value position */}
                  <div className="relative h-3 rounded-[4px] bg-bone-2">
                    <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-ink/20" />
                    <span
                      className={`absolute inset-y-0 left-0 rounded-[4px] ${s.id === "won" ? "bg-signal" : s.id === "lost" ? "bg-ink/20" : "bg-accent"}`}
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-[2px] bg-ink" style={{ left: `calc(${pct}% - 3px)` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* departures board */}
        <section className="overflow-hidden rounded-[16px] bg-deep text-white">
          <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="board text-[13px] tracking-[0.1em] text-signal">BRD-01</span>
              <h2 className="board text-[20px] tracking-[0.04em]">Departures · live</h2>
            </div>
            <Link href="/admin/shipments" className="board text-[13px] tracking-[0.08em] text-white/55 hover:text-signal">
              Manage →
            </Link>
          </div>
          <div className="board grid grid-cols-[1.2fr_1.3fr_0.8fr_1.2fr] gap-2 border-y border-white/10 px-5 py-2 text-[11px] tracking-[0.12em] text-white/40 sm:px-6">
            <span>Shipment</span>
            <span>Route</span>
            <span>ETA</span>
            <span className="text-right">Status</span>
          </div>
          <ul className="divide-y divide-white/[0.07]">
            {active.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link href="/admin/shipments" className="grid grid-cols-[1.2fr_1.3fr_0.8fr_1.2fr] items-center gap-2 px-5 py-3 transition hover:bg-white/[0.04] sm:px-6">
                  <span className="board truncate text-[15px] tracking-[0.04em]">{s.id}</span>
                  <span className="board truncate text-[17px]">
                    {code(s.origin)} <span className="text-white/35">→</span> {code(s.destination)}
                  </span>
                  <span className="board text-[14px] text-white/70">{fmtDate(s.eta, { day: "2-digit", month: "short" })}</span>
                  <span className="board truncate text-right text-[13px] tracking-[0.06em] text-signal">{SHIPMENT_STATUS_LABEL[s.status]}</span>
                </Link>
              </li>
            ))}
            {active.length === 0 && <li className="px-6 py-8 text-center text-sm text-white/50">No active shipments.</li>}
          </ul>
        </section>

        {/* ticket rows */}
        <section className="rounded-[16px] border border-line bg-white p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="board text-[13px] tracking-[0.1em] text-accent">TKT-01</span>
              <h2 className="board text-[20px] tracking-[0.04em]">Recent leads</h2>
            </div>
            <Link href="/admin/leads" className="board text-[13px] tracking-[0.08em] text-muted hover:text-accent">
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {[...leads]
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
              .slice(0, 6)
              .map((l) => (
                <li key={l.id}>
                  <Link
                    href="/admin/leads"
                    className="relative flex items-center gap-3 rounded-[10px] border border-line bg-bone/50 py-2.5 pl-3 pr-3 transition hover:border-ink/25 hover:bg-white"
                  >
                    <span className="board w-[72px] shrink-0 border-r border-dashed border-ink/15 pr-2 text-[13px] tracking-[0.04em] text-muted">{l.id}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium">
                        {l.name} <span className="font-normal text-muted">· {l.company || "—"}</span>
                      </div>
                      <div className="truncate text-[12px] text-muted">
                        {l.service}
                        {l.origin && ` · ${l.origin} → ${l.destination}`}
                      </div>
                    </div>
                    <Badge tone={LEAD_TONE[l.status]}>{l.status}</Badge>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>

      {/* counters */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Customers", code: "CUS", value: customers.length, href: "/admin/customers" },
          { label: "Applications", code: "APP", value: applications.length, href: "/admin/applications" },
          { label: "Subscribers", code: "SUB", value: subscribers.length, href: "/admin/subscribers" },
        ].map((x) => (
          <Link key={x.label} href={x.href} className="group flex items-end justify-between rounded-[14px] border border-line bg-white p-4 transition hover:border-ink sm:p-5">
            <div>
              <div className="board text-[12px] tracking-[0.12em] text-accent">{x.code}</div>
              <div className="mt-1 text-[12px] text-muted sm:text-[13px]">{x.label}</div>
            </div>
            <div className="board text-[clamp(2rem,5vw,3rem)] leading-none transition-colors group-hover:text-accent">{String(x.value).padStart(2, "0")}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

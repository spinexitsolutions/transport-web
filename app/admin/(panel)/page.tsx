import Link from "next/link";
import { ArrowUpRight, IndianRupee, Inbox, Package, Percent, TrendingUp } from "lucide-react";
import { getDB } from "@/lib/db";
import { LEAD_STAGES, SHIPMENT_STATUS_LABEL } from "@/lib/types";
import { compactInr, fmtDate } from "@/lib/utils";
import { Badge } from "@/components/admin/ui";
import { LEAD_TONE, SHIPMENT_TONE } from "@/components/admin/tones";

export const dynamic = "force-dynamic";

const DAY = 86400000;

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

  // leads per day — last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY);
    const key = d.toDateString();
    return { label: d.toLocaleDateString("en-IN", { day: "numeric" }), full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), count: leads.filter((l) => new Date(l.createdAt).toDateString() === key).length };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const byStage = LEAD_STAGES.map((s) => {
    const ls = leads.filter((l) => l.status === s.id);
    return { ...s, count: ls.length, value: ls.reduce((a, l) => a + (l.value || l.estimate), 0) };
  });
  const maxStage = Math.max(1, ...byStage.map((s) => s.value));

  const kpis = [
    { label: "Open pipeline", value: compactInr(pipeline), sub: `${open.length} open deals`, icon: TrendingUp, dark: true },
    { label: "New leads · 7d", value: String(newLeads7), sub: `${leads.filter((l) => l.status === "new").length} awaiting first contact`, icon: Inbox },
    { label: "Active shipments", value: String(active.length), sub: `${shipments.length - active.length} delivered`, icon: Package },
    { label: "Won revenue", value: compactInr(wonRevenue), sub: `${won.length} deals closed`, icon: IndianRupee },
    { label: "Win rate", value: `${conversion}%`, sub: `${won.length} won · ${lost.length} lost`, icon: Percent },
  ];

  const W = 560;
  const H = 180;
  const bw = W / days.length;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow mb-2 text-muted">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1 className="text-[30px] font-semibold tracking-[-0.04em] sm:text-[40px]">
            Good day. <span className="serif font-normal text-muted">Here&apos;s the pulse.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/leads" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white">
            Open pipeline <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-5">
        {kpis.map((k) => {
          const I = k.icon;
          return (
            <div
              key={k.label}
              className={`min-w-[210px] snap-start rounded-[22px] border p-5 ${k.dark ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[13px] ${k.dark ? "text-white/60" : "text-muted"}`}>{k.label}</span>
                <span className={`grid h-8 w-8 place-items-center rounded-full ${k.dark ? "bg-accent text-accent-ink" : "bg-bone-2"}`}>
                  <I size={15} />
                </span>
              </div>
              <div className="mt-5 text-[32px] font-semibold tracking-[-0.04em]">{k.value}</div>
              <div className={`mt-0.5 text-[12px] ${k.dark ? "text-white/50" : "text-muted"}`}>{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold tracking-tight">Inbound leads</h2>
            <span className="text-xs text-muted">Last 14 days</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H + 24}`} className="mt-5 w-full" role="img" aria-label="Leads per day chart">
            {[0.25, 0.5, 0.75, 1].map((t) => (
              <line key={t} x1="0" x2={W} y1={H - H * t} y2={H - H * t} stroke="rgba(11,11,12,.06)" />
            ))}
            {days.map((d, i) => {
              const h = d.count ? Math.max(6, (d.count / maxDay) * (H - 16)) : 3;
              const last = i === days.length - 1;
              return (
                <g key={i}>
                  <title>{`${d.full}: ${d.count} lead${d.count === 1 ? "" : "s"}`}</title>
                  <rect x={i * bw + bw * 0.18} y={H - h} width={bw * 0.64} height={h} rx={Math.min(8, bw * 0.3)} fill={last ? "var(--accent)" : d.count ? "#0b0b0c" : "rgba(11,11,12,.1)"} />
                  {d.count > 0 && (
                    <text x={i * bw + bw / 2} y={H - h - 6} textAnchor="middle" fontSize="11" fill="#6f6b64">
                      {d.count}
                    </text>
                  )}
                  <text x={i * bw + bw / 2} y={H + 18} textAnchor="middle" fontSize="11" fill="#6f6b64">
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold tracking-tight">Pipeline by stage</h2>
            <span className="text-xs text-muted">Deal value</span>
          </div>
          <ul className="mt-5 space-y-3.5">
            {byStage.map((s) => (
              <li key={s.id}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2">
                    {s.label} <span className="text-muted">· {s.count}</span>
                  </span>
                  <span className="font-medium tabular-nums">{compactInr(s.value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bone-2">
                  <div
                    className={`h-full rounded-full ${s.id === "won" ? "bg-accent" : s.id === "lost" ? "bg-ink/20" : "bg-ink"}`}
                    style={{ width: `${Math.max(2, (s.value / maxStage) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* lists */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold tracking-tight">Recent leads</h2>
            <Link href="/admin/leads" className="text-[13px] text-muted hover:text-ink">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {[...leads]
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
              .slice(0, 6)
              .map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bone-2 text-[13px] font-semibold">
                    {l.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
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
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-[22px] border border-line bg-white p-5 sm:p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold tracking-tight">Live shipments</h2>
            <Link href="/admin/shipments" className="text-[13px] text-muted hover:text-ink">
              Manage →
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {active.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-accent">
                  <Package size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-[13px] font-medium">{s.id}</div>
                  <div className="truncate text-[12px] text-muted">
                    {s.origin} → {s.destination} · ETA {fmtDate(s.eta, { day: "numeric", month: "short" })}
                  </div>
                </div>
                <Badge tone={SHIPMENT_TONE[s.status]}>{SHIPMENT_STATUS_LABEL[s.status]}</Badge>
              </li>
            ))}
            {active.length === 0 && <li className="py-6 text-center text-sm text-muted">No active shipments.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Customers", value: customers.length, href: "/admin/customers" },
          { label: "Applications", value: applications.length, href: "/admin/applications" },
          { label: "Subscribers", value: subscribers.length, href: "/admin/subscribers" },
        ].map((x) => (
          <Link key={x.label} href={x.href} className="rounded-[22px] border border-line bg-white p-4 transition hover:border-ink/25 sm:p-5">
            <div className="text-[12px] text-muted sm:text-[13px]">{x.label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{x.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

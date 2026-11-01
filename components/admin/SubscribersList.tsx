"use client";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { fmtDateTime } from "@/lib/utils";
import { useKey } from "./api";
import { useToast } from "./Toast";
import { motion } from "framer-motion";
import { Btn, Empty, IconBtn, Loading, Search } from "./ui";
import { CrmHeader } from "./crm/kit";

export function SubscribersList() {
  const toast = useToast();
  const { data, save } = useKey("subscribers");
  const [q, setQ] = useState("");
  if (!data) return <Loading label="Loading subscribers" />;

  const filtered = data.filter((s) => !q || s.email.toLowerCase().includes(q.toLowerCase()));

  const exportCsv = () => {
    const rows = [["email", "subscribed_at"], ...data.map((s) => [s.email, s.createdAt])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const week = data.filter((x) => Date.now() - +new Date(x.createdAt) < 7 * 86400000).length;
  const domains = new Set(data.map((x) => x.email.split("@")[1])).size;

  return (
    <div>
      <CrmHeader
        code="CRM-05"
        module="Mailing list"
        title="Freight"
        accent="notes"
        description="Everyone who joined the monthly newsletter from the website footer."
        stats={[
          { label: "On the list", value: String(data.length).padStart(3, "0"), tone: "ink" },
          { label: "Joined this week", value: String(week), tone: "signal" },
          { label: "Companies", value: String(domains) },
          { label: "Last sign-up", value: data[0] ? fmtDateTime(data[0].createdAt).split(",")[0] : "—" },
        ]}
        actions={
          <Btn variant="ink" onClick={exportCsv} disabled={!data.length}>
            <Download size={15} /> Export CSV
          </Btn>
        }
      />
      <div className="mb-4">
        <Search value={q} onChange={setQ} placeholder="Search emails…" />
      </div>
      {filtered.length === 0 ? (
        <Empty title="No subscribers yet" text="Newsletter sign-ups from the site footer will appear here." />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-white">
          <div className="flex items-center justify-between bg-ink px-4 py-2.5 text-white">
            <span className="board text-lg tracking-wide">Mailing manifest</span>
            <span className="eyebrow text-white/50">{filtered.length} entries</span>
          </div>
          <ol className="divide-y divide-dashed divide-ink/15">
            {filtered.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 15) * 0.02 }}
                className="flex items-center gap-3 px-4 py-3 sm:px-5"
              >
                <span className="board w-10 text-[20px] text-ink/25">{String(i + 1).padStart(3, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.email}</div>
                  <div className="text-[12px] text-muted">{fmtDateTime(s.createdAt)}</div>
                </div>
                <span className="board hidden rounded-[5px] bg-tint px-2 py-0.5 text-[13px] tracking-wide text-accent sm:inline">{s.email.split("@")[1]}</span>
                <IconBtn
                  aria-label="Remove"
                  className="hover:!bg-red-50 hover:!text-red-600"
                  onClick={async () => {
                    if (!confirm(`Remove ${s.email}?`)) return;
                    try {
                      await save(data.filter((x) => x.id !== s.id));
                      toast("Subscriber removed");
                    } catch (e) {
                      toast((e as Error).message, "error");
                    }
                  }}
                >
                  <Trash2 size={15} />
                </IconBtn>
              </motion.li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { fmtDateTime } from "@/lib/utils";
import { useKey } from "./api";
import { useToast } from "./Toast";
import { Btn, Empty, IconBtn, Loading, PageHeader, Search } from "./ui";

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

  return (
    <div>
      <PageHeader
        eyebrow="CRM · Marketing"
        title="Subscribers"
        description={`${data.length} people subscribed to the newsletter from the website footer.`}
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
        <ul className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-white">
          {filtered.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{s.email}</div>
                <div className="text-[12px] text-muted">{fmtDateTime(s.createdAt)}</div>
              </div>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

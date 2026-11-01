import { NextResponse } from "next/server";
import { get, update, uid } from "@/lib/db";
import type { Application } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.email || !b?.jobId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const job = (await get("jobs")).find((j) => j.id === b.jobId);
  const app: Application = {
    id: uid("A-"),
    jobId: b.jobId,
    jobTitle: job?.title || "General application",
    name: String(b.name).slice(0, 120),
    email: String(b.email).slice(0, 160),
    phone: String(b.phone || "").slice(0, 40),
    link: String(b.link || "").slice(0, 300),
    message: String(b.message || "").slice(0, 2000),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  await update("applications", (all) => [app, ...all]);
  return NextResponse.json({ ok: true });
}

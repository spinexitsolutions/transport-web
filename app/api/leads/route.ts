import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { update, uid } from "@/lib/db";
import type { Lead } from "@/lib/types";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || !b.name || !(b.email || b.phone)) {
    return NextResponse.json({ error: "Name and email or phone are required" }, { status: 400 });
  }
  const lead: Lead = {
    id: uid("L-"),
    source: b.source === "contact" ? "contact" : "quote",
    name: String(b.name).slice(0, 120),
    company: String(b.company || "").slice(0, 120),
    email: String(b.email || "").slice(0, 160),
    phone: String(b.phone || "").slice(0, 40),
    service: String(b.service || "General enquiry"),
    origin: String(b.origin || ""),
    destination: String(b.destination || ""),
    weight: Number(b.weight) || 0,
    message: String(b.message || "").slice(0, 2000),
    estimate: Number(b.estimate) || 0,
    value: 0,
    status: "new",
    owner: "Unassigned",
    createdAt: new Date().toISOString(),
    notes: [],
  };
  await update("leads", (all) => [lead, ...all]);
  revalidatePath("/admin", "layout");
  return NextResponse.json({ ok: true, id: lead.id });
}

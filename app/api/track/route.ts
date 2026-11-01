import { NextResponse } from "next/server";
import { get } from "@/lib/db";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id")?.trim().toUpperCase();
  if (!id) return NextResponse.json({ error: "Tracking ID required" }, { status: 400 });
  const shipments = await get("shipments");
  const s = shipments.find((x) => x.id.toUpperCase() === id);
  if (!s) return NextResponse.json({ error: "No shipment found for that tracking ID" }, { status: 404 });
  return NextResponse.json(s);
}

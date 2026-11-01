import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { get, set } from "@/lib/db";
import { DB_KEYS, type DBKey } from "@/lib/types";

// Middleware guarantees an authenticated admin for /api/admin/*

type Ctx = { params: Promise<{ key: string }> };

const valid = (k: string): k is DBKey => (DB_KEYS as string[]).includes(k);

export async function GET(_: Request, { params }: Ctx) {
  const { key } = await params;
  if (!valid(key)) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  return NextResponse.json(await get(key));
}

export async function PUT(req: Request, { params }: Ctx) {
  const { key } = await params;
  if (!valid(key)) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saved = await set(key, body as any);
  revalidatePath("/", "layout");
  return NextResponse.json(saved);
}

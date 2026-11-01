import { NextResponse } from "next/server";
import { update, uid } from "@/lib/db";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  await update("subscribers", (all) =>
    all.some((s) => s.email === email) ? all : [{ id: uid("S-"), email, createdAt: new Date().toISOString() }, ...all],
  );
  return NextResponse.json({ ok: true });
}

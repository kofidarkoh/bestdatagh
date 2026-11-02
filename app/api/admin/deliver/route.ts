import { NextRequest, NextResponse } from "next/server";
import { updateOrder } from "@/lib/store";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = String(body?.ref || "");
    const password = String(body?.password || "");
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || password !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!ref) {
      return NextResponse.json({ error: "ref required" }, { status: 400 });
    }
    const order = await updateOrder(ref, {
      status: "delivered",
      deliveredAt: new Date().toISOString(),
    });
    if (!order) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

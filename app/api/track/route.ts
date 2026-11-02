import { NextRequest, NextResponse } from "next/server";
import { getOrdersByPhone, normalizePhone } from "@/lib/store";


export async function GET(req: NextRequest) {
  const phone = normalizePhone(req.nextUrl.searchParams.get("phone") || "");
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  const orders = await getOrdersByPhone(phone);
  return NextResponse.json({ orders });
}

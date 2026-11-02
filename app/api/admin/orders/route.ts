import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/store";


function checkPassword(req: NextRequest, bodyPwd?: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const fromQuery = req.nextUrl.searchParams.get("password");
  const fromHeader = req.headers.get("x-admin-password");
  const pwd = bodyPwd || fromQuery || fromHeader || "";
  return pwd === expected;
}

export async function GET(req: NextRequest) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

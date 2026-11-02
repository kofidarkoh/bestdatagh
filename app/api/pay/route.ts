import { NextRequest, NextResponse } from "next/server";
import { productPrice, productLabel } from "@/lib/bundles";
import {
  saveOrder,
  normalizePhone,
  type Order,
} from "@/lib/store";


function baseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(String(body?.phone || ""));
    const productId = String(body?.productId || "");
    const type = body?.type === "service" ? "service" : "data";
    const fullName = body?.fullName ? String(body.fullName).trim() : undefined;
    const idNumber = body?.idNumber ? String(body.idNumber).trim() : undefined;

    if (!phone || phone.length < 9) {
      return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
    }

    const price = productPrice(productId, type);
    if (price === null) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    if (type === "service") {
      if (!fullName || !idNumber) {
        return NextResponse.json(
          { error: "Full name and ID number required for services" },
          { status: 400 }
        );
      }
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Paystack not configured" }, { status: 500 });
    }

    const ref = `SD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const order: Order = {
      ref,
      phone,
      product: productId,
      productName: productLabel(productId, type),
      type,
      amount: price,
      status: "pending",
      fullName,
      idNumber,
      network:
        type === "data"
          ? productId.startsWith("mtn")
            ? "MTN"
            : productId.startsWith("at-") || productId.startsWith("airtel")
            ? "AirtelTigo"
            : "Telecel"
          : undefined,
      createdAt: new Date().toISOString(),
    };
    await saveOrder(order);

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `${phone}@smartdata.com`,
        amount: Math.round(price * 100),
        currency: "GHS",
        reference: ref,
        callback_url: `${baseUrl(req)}/success?ref=${ref}`,
        metadata: { phone, product: productId, type, fullName, idNumber },
      }),
    });

    const data = await paystackRes.json();
    if (!paystackRes.ok || !data?.status) {
      return NextResponse.json(
        { error: data?.message || "Paystack init failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: ref,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

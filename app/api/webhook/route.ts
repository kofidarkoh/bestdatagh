import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getOrder, updateOrder, saveOrder, normalizePhone } from "@/lib/store";
import { productLabel } from "@/lib/bundles";


export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const hash = createHmac("sha512", secret).update(raw).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; metadata?: Record<string, unknown>; amount?: number; customer?: { email?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (event?.event === "charge.success") {
    const d = event.data || {};
    const ref = d.reference || "";
    const meta = d.metadata || {};
    const phone = normalizePhone(String(meta.phone || d.customer?.email?.split("@")[0] || ""));
    const productId = String(meta.product || "");
    const type = meta.type === "service" ? "service" : "data";

    const existing = ref ? await getOrder(ref) : null;
    if (existing) {
      if (existing.status !== "delivered") {
        await updateOrder(ref, { status: "paid", paidAt: new Date().toISOString() });
      }
    } else if (ref) {
      await saveOrder({
        ref,
        phone,
        product: productId,
        productName: productLabel(productId, type) || productId,
        type,
        amount: (d.amount || 0) / 100,
        status: "paid",
        fullName: meta.fullName as string | undefined,
        idNumber: meta.idNumber as string | undefined,
        network: type === "data" ? (productId.startsWith("mtn") ? "MTN" : "Telecel") : undefined,
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusPill from "@/components/StatusPill";

type Order = {
  ref: string;
  phone: string;
  productName: string;
  amount: number;
  status: "pending" | "paid" | "delivered";
};

function money(n: number) {
  return `GH₵${n.toFixed(2)}`;
}

function SuccessInner() {
  const params = useSearchParams();
  const ref = params.get("ref") || "";
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!ref) return;
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/order?ref=${encodeURIComponent(ref)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data?.order) setOrder(data.order);
      } catch {}
    }
    load();
    const t = setInterval(load, 5000);
    return () => { alive = false; clearInterval(t); };
  }, [ref]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="card fade-in w-full max-w-md p-8 text-center">
          <div className="pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">Payment received</h1>
          <p className="mt-2 text-[var(--text-muted)]">Paid, waiting for delivery.</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Processing 5–15 mins.</p>

          {ref && (
            <div className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-4 text-left">
              <div className="text-xs text-[var(--text-muted)]">Reference</div>
              <div className="font-mono text-sm font-semibold">{ref}</div>
              {order && (
                <>
                  <div className="mt-3 text-xs text-[var(--text-muted)]">Product</div>
                  <div className="text-sm font-semibold">{order.productName}</div>
                  <div className="mt-3 text-xs text-[var(--text-muted)]">Amount</div>
                  <div className="text-sm font-semibold">{money(order.amount)}</div>
                  <div className="mt-3 text-xs text-[var(--text-muted)]">Status</div>
                  <div className="mt-1"><StatusPill status={order.status} /></div>
                </>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <Link href="/track" className="btn-primary rounded-xl py-3 text-sm font-bold">
              Track order
            </Link>
            <Link href="/" className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--primary)]">
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SuccessInner />
    </Suspense>
  );
}

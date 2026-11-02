"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusPill from "@/components/StatusPill";
import Link from "next/link";

type Order = {
  ref: string;
  phone: string;
  productName: string;
  amount: number;
  status: "pending" | "paid" | "delivered";
  createdAt: string;
};

function money(n: number) {
  return `GH₵${n.toFixed(2)}`;
}

export default function TrackPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    setError("");
    if (!phone.trim()) { setError("Enter phone number"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/track?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Failed"); setLoading(false); return; }
      setOrders(data.orders || []);
      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
          <div className="fade-in">
            <h1 className="text-3xl font-extrabold tracking-tight">Track your order</h1>
            <p className="mt-1 text-[var(--text-muted)]">Enter the phone number used at checkout.</p>
          </div>

          <div className="card mt-6 flex gap-2 p-2">
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="flex-1 rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-base outline-none transition focus:bg-[var(--surface)]"
            />
            <button
              onClick={search}
              disabled={loading}
              className="btn-primary rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex flex-col gap-3">
            {searched && orders.length === 0 && (
              <div className="card p-8 text-center">
                <div className="text-3xl">📦</div>
                <p className="mt-2 font-semibold">No orders found</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Check the number or place an order first.</p>
                <Link href="/" className="mt-4 inline-block text-sm font-bold text-[var(--primary)]">Go to shop →</Link>
              </div>
            )}
            {orders.map((o) => (
              <div key={o.ref} className="card fade-in p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">{o.productName}</div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">{o.ref}</div>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-[var(--primary)]">{money(o.amount)}</span>
                  <span className="text-xs text-[var(--text-muted)]">{new Date(o.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

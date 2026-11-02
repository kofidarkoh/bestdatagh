"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusPill from "@/components/StatusPill";


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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);

  async function login() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?password=${encodeURIComponent(password)}`);
      if (!res.ok) { setError("Wrong password"); setLoading(false); return; }
      const data = await res.json();
      setOrders(data.orders || []);
      setAuthed(true);
      try { sessionStorage.setItem("admin_pw", password); } catch {}
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    const pw = password || (typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") || "" : "");
    if (!pw) return;
    const res = await fetch(`/api/admin/orders?password=${encodeURIComponent(pw)}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  }

  async function deliver(ref: string) {
    const pw = password || (typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") || "" : "");
    setWorking(ref);
    try {
      const res = await fetch("/api/admin/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, password: pw }),
      });
      if (res.ok) await refresh();
      else { const d = await res.json(); setError(d?.error || "Failed"); }
    } finally {
      setWorking(null);
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="card fade-in w-full max-w-sm p-8">
            <h1 className="text-2xl font-extrabold">Admin access</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Enter the admin password to continue.</p>
            <div className="mt-6 flex flex-col gap-3">
              <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-base outline-none transition focus:border-[var(--primary)] focus:bg-[var(--surface)]"
              />
              <button
                onClick={login}
                disabled={loading}
                className="btn-primary rounded-xl py-3 text-sm font-bold disabled:opacity-60"
              >
                {loading ? "..." : "Enter"}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Admin orders</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{orders.length} total orders</p>
            </div>
            <button onClick={refresh} className="text-sm font-semibold text-[var(--primary)] hover:underline">
              Refresh
            </button>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 flex flex-col gap-3 md:hidden">
            {orders.map((o) => (
              <div
                key={o.ref}
                className={`card p-4 ${o.status === "paid" ? "border-red-300 bg-red-50 dark:bg-red-900/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">{o.productName}</div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">{o.phone}</div>
                    <div className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">{o.ref}</div>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-extrabold text-[var(--primary)]">{money(o.amount)}</span>
                  {o.status === "paid" && (
                    <button
                      onClick={() => deliver(o.ref)}
                      disabled={working === o.ref}
                      className="btn-primary rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60"
                    >
                      {working === o.ref ? "..." : "Mark Delivered"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="card mt-6 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.ref}
                    className={`border-t border-[var(--border)] transition ${
                      o.status === "paid" ? "bg-red-50 dark:bg-red-900/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs">{o.ref}</td>
                    <td className="px-4 py-3">{o.phone}</td>
                    <td className="px-4 py-3">{o.productName}</td>
                    <td className="px-4 py-3 font-bold text-[var(--primary)]">{money(o.amount)}</td>
                    <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-3">
                      {o.status === "paid" && (
                        <button
                          onClick={() => deliver(o.ref)}
                          disabled={working === o.ref}
                          className="btn-primary rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60"
                        >
                          {working === o.ref ? "..." : "Mark Delivered"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="p-8 text-center text-sm text-[var(--text-muted)]">No orders yet.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

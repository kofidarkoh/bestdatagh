"use client";

import { useState, Fragment } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { dataBundles, services } from "@/lib/bundles";
import StatusPill from "@/components/StatusPill";

type Network = "MTN" | "Telecel" | "AirtelTigo";

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

export default function Home() {
  const [network, setNetwork] = useState<Network>("MTN");
  const [selected, setSelected] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [knowOpen, setKnowOpen] = useState(false);

  // services
  const [serviceSelected, setServiceSelected] = useState<string | null>(null);
  const [servicePhone, setServicePhone] = useState("");
  const [serviceFullName, setServiceFullName] = useState("");
  const [serviceIdNumber, setServiceIdNumber] = useState("");
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState("");

  // track modal
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackMode, setTrackMode] = useState<"phone" | "ref">("phone");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackRef, setTrackRef] = useState("");
  const [trackOrders, setTrackOrders] = useState<Order[]>([]);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");

  const bundles = dataBundles.filter((b) => b.network === network);
  const selectedBundle = dataBundles.find((b) => b.id === selected) || null;

  async function pay() {
    setError("");
    if (!selected) { setError("Select a bundle first"); return; }
    if (!phone.trim()) { setError("Enter your phone number"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          productId: selected,
          type: "data",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Payment init failed"); setLoading(false); return; }
      window.location.href = data.authorization_url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
      setLoading(false);
    }
  }

  async function payService() {
    setServiceError("");
    if (!serviceSelected) { setServiceError("Select a service first"); return; }
    if (!servicePhone.trim()) { setServiceError("Enter your phone number"); return; }
    if (!serviceFullName.trim() || !serviceIdNumber.trim()) {
      setServiceError("Full name and ID number required"); return;
    }
    setServiceLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: servicePhone,
          productId: serviceSelected,
          type: "service",
          fullName: serviceFullName,
          idNumber: serviceIdNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setServiceError(data?.error || "Payment init failed"); setServiceLoading(false); return; }
      window.location.href = data.authorization_url;
    } catch (e: unknown) {
      setServiceError(e instanceof Error ? e.message : "Network error");
      setServiceLoading(false);
    }
  }

  async function doTrack() {
    setTrackError("");
    setTrackOrders([]);
    setTrackOrder(null);
    setTrackSearched(false);
    if (trackMode === "phone") {
      if (!trackPhone.trim()) { setTrackError("Enter phone number"); return; }
      setTrackLoading(true);
      try {
        const res = await fetch(`/api/track?phone=${encodeURIComponent(trackPhone)}`);
        const data = await res.json();
        if (!res.ok) { setTrackError(data?.error || "Failed"); setTrackLoading(false); return; }
        setTrackOrders(data.orders || []);
        setTrackSearched(true);
      } catch (e: unknown) {
        setTrackError(e instanceof Error ? e.message : "Network error");
      } finally {
        setTrackLoading(false);
      }
    } else {
      if (!trackRef.trim()) { setTrackError("Enter reference"); return; }
      setTrackLoading(true);
      try {
        const res = await fetch(`/api/order?ref=${encodeURIComponent(trackRef.trim())}`);
        const data = await res.json();
        if (!res.ok) { setTrackError(data?.error || "Not found"); setTrackLoading(false); return; }
        setTrackOrder(data.order || null);
        setTrackSearched(true);
      } catch (e: unknown) {
        setTrackError(e instanceof Error ? e.message : "Network error");
      } finally {
        setTrackLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black transition-colors dark:bg-gray-900 dark:text-white">
      <Header />
      <main>
        <div className="mx-auto max-w-5xl px-2 py-3 sm:px-4 sm:py-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-1">Buy Data Bundles</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No account needed • Pay via MoMo • 24/7 Service
            </p>
          </div>

          {/* Estimated delivery */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-1.5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Estimated delivery
            </p>
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-green-500">
              <span aria-hidden="true">⚡</span> Deliveries are blazing fast — arriving within minutes.
            </p>
            <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 px-2 py-1.5 text-[11px] text-gray-500">
                <span className="font-bold text-green-500">
                  <span aria-hidden="true">⚡</span> Fast lane · 7 min
                </span>
                <span className="text-gray-400">#518350 · placed 19:49 → delivered 19:56</span>
              </div>
              <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 px-2 py-1.5 text-[11px] text-gray-500">
                <span className="font-bold text-blue-500">
                  <span aria-hidden="true">🕐</span> Standard queue · 1 hr 1 min
                </span>
                <span className="text-gray-400">#2274992 · placed 17:50 → delivered 18:50</span>
              </div>
            </div>
          </div>

          {/* Track Order button */}
          <div className="mb-4">
            <button
              onClick={() => setTrackOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a3a5c] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#14304a] hover:shadow-lg active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Track Order
            </button>
          </div>

          {/* Good to know */}
          <div className="mb-4">
            <button
              aria-expanded={knowOpen}
              onClick={() => setKnowOpen((v) => !v)}
              className="flex w-full items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-left transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0 text-blue-600">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
              <span className="flex-1 text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                Good to know before you buy
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${knowOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {knowOpen && (
              <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <ul className="list-disc space-y-1 pl-5">
                  <li>All bundles are non-expiry — use at your own pace.</li>
                  <li>Delivery usually within minutes after payment.</li>
                  <li>Pay securely with MTN MoMo, Telecel Cash or card via Paystack.</li>
                  <li>No account or registration required.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Network tabs */}
          <div className="mb-5">
            <div className="inline-flex w-full flex-wrap gap-1.5 rounded-2xl bg-gray-100 p-1.5 sm:w-auto dark:bg-gray-800">
              {(["MTN", "AirtelTigo", "Telecel"] as Network[]).map((n) => {
                const active = network === n;
                const baseColor =
                  n === "MTN"
                    ? "bg-yellow-400 text-black"
                    : n === "AirtelTigo"
                    ? "bg-[#1a3a5c] text-white"
                    : "bg-red-600 text-white";
                return (
                  <button
                    key={n}
                    onClick={() => {
                      setNetwork(n);
                      setSelected(null);
                    }}
                    className={`flex-1 rounded-xl px-4 py-3 text-[13px] font-extrabold tracking-wide transition-all duration-200 sm:flex-none sm:px-8 ${baseColor} ${
                      active ? "ring-2 ring-white shadow-lg z-10" : "shadow-sm hover:brightness-105"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bundle grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bundles.map((b) => {
              const isMtn = b.network === "MTN";
              const isAt = b.network === "AirtelTigo";
              const cardBg = isMtn ? "bg-yellow-400" : isAt ? "bg-[#1a3a5c]" : "bg-red-600";
              const textColor = isMtn ? "text-black" : "text-white";
              const subText = isMtn ? "text-black/60" : "text-white/70";
              const iconFill = isMtn ? "#FFCC00" : isAt ? "#1a3a5c" : "#dc2626";
              const iconLabel = isMtn ? "MTN" : isAt ? "AT" : "TC";
              const isSelected = selected === b.id;
              return (
                <Fragment key={b.id}>
                  <div className="relative">
                    <div
                      onClick={() => setSelected(isSelected ? null : b.id)}
                      className={`${cardBg} cursor-pointer overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg ${isSelected ? "ring-2 ring-white/60" : ""}`}
                    >
                      <div className="p-5">
                        <div className="mb-3 flex items-start justify-between">
                          <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
                            <rect width="80" height="80" rx="16" fill={iconFill} />
                            <ellipse cx="40" cy="40" rx="30" ry="20" stroke="#fff" strokeWidth="3" fill="none" />
                            <text x="40" y="46" textAnchor="middle" fontFamily="Arial Black" fontSize="14" fontWeight="900" fill="#fff">
                              {iconLabel}
                            </text>
                          </svg>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(isSelected ? null : b.id);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-4 w-4 transition-transform ${isSelected ? "rotate-180" : ""}`}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        </div>
                        <h3 className={`text-3xl font-bold ${textColor}`}>{b.size}</h3>
                        <p className={`mb-3 text-sm ${subText}`}>
                          {b.network} Bundle
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-2xl font-bold ${textColor}`}>{money(b.price)}</span>
                          <span className={`text-xs ${subText}`}>
                            {b.nonExpiry ? "No Expiry" : b.network === "AirtelTigo" ? "60-Day" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isSelected && selectedBundle && (
                    <div className="col-span-1 mt-2 rounded-2xl border border-yellow-300 bg-white p-3 shadow-md sm:col-span-2 lg:col-span-3 xl:col-span-4 dark:border-yellow-700 dark:bg-gray-800">
                      <div className="mb-3 flex items-center justify-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 80 80" fill="none">
                          <rect
                            width="80"
                            height="80"
                            rx="16"
                            fill={
                              selectedBundle.network === "MTN"
                                ? "#FFCC00"
                                : selectedBundle.network === "AirtelTigo"
                                ? "#1a3a5c"
                                : "#dc2626"
                            }
                          />
                          <ellipse cx="40" cy="40" rx="30" ry="20" stroke="#fff" strokeWidth="3" fill="none" />
                          <text x="40" y="46" textAnchor="middle" fontFamily="Arial Black" fontSize="14" fontWeight="900" fill="#fff">
                            {selectedBundle.network === "MTN" ? "MTN" : selectedBundle.network === "AirtelTigo" ? "AT" : "TC"}
                          </text>
                        </svg>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedBundle.size}</span>
                        <span className="text-sm text-gray-400">—</span>
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">{money(selectedBundle.price)}</span>
                      </div>
                      <div className="mx-auto max-w-md space-y-2">
                        <input
                          placeholder="Your name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-center text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                        />
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            placeholder="0XXXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-center text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                          />
                          <button
                            onClick={pay}
                            disabled={loading}
                            className="whitespace-nowrap rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-yellow-600 disabled:opacity-60"
                          >
                            {loading ? "..." : `Buy ${money(selectedBundle.price)}`}
                          </button>
                        </div>
                        <p className="text-center text-xs text-gray-400">Data will be sent to this number</p>
                        {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
                      </div>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* Services */}
          <div className="mt-8">
            <h2 className="mb-3 text-xl font-bold">SIM Services</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => {
                const isSelected = serviceSelected === s.id;
                return (
                  <Fragment key={s.id}>
                    <div className="relative">
                      <div
                        onClick={() => setServiceSelected(isSelected ? null : s.id)}
                        className={`cursor-pointer overflow-hidden rounded-2xl bg-gray-700 text-white transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 ${
                          isSelected ? "ring-2 ring-white/60" : ""
                        }`}
                      >
                        <div className="p-5">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg font-extrabold">
                            S
                          </div>
                          <h3 className="text-lg font-bold">{s.name}</h3>
                          <div className="mt-2 text-2xl font-extrabold">{money(s.price)}</div>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="col-span-1 mt-2 rounded-2xl border border-gray-300 bg-white p-4 shadow-md sm:col-span-2 lg:col-span-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-3 text-center font-bold text-gray-900 dark:text-white">
                          {services.find((x) => x.id === serviceSelected)?.name} —{" "}
                          {money(services.find((x) => x.id === serviceSelected)?.price || 0)}
                        </div>
                        <div className="mx-auto max-w-md space-y-2">
                          <input
                            placeholder="Full name"
                            value={serviceFullName}
                            onChange={(e) => setServiceFullName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-center text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                          />
                          <input
                            type="text"
                            placeholder="ID number (Ghana Card)"
                            value={serviceIdNumber}
                            onChange={(e) => setServiceIdNumber(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-center text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                          />
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              placeholder="0XXXXXXXXX"
                              value={servicePhone}
                              onChange={(e) => setServicePhone(e.target.value)}
                              className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-center text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                            />
                            <button
                              onClick={payService}
                              disabled={serviceLoading}
                              className="whitespace-nowrap rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-yellow-600 disabled:opacity-60"
                            >
                              {serviceLoading ? "..." : "Buy"}
                            </button>
                          </div>
                          {serviceError && <p className="text-center text-sm font-medium text-red-600">{serviceError}</p>}
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Track modal */}
      {trackOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a3a5c]/10 dark:bg-blue-400/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a3a5c] dark:text-blue-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Track Your Order</h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setTrackOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-5">
              <div className="mb-4 flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                <button
                  type="button"
                  onClick={() => setTrackMode("phone")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    trackMode === "phone" ? "bg-white text-[#1a3a5c] shadow dark:bg-gray-600 dark:text-white" : "text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  }`}
                >
                  Phone Number
                </button>
                <button
                  type="button"
                  onClick={() => setTrackMode("ref")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    trackMode === "ref" ? "bg-white text-[#1a3a5c] shadow dark:bg-gray-600 dark:text-white" : "text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  }`}
                >
                  Reference
                </button>
              </div>

              {trackMode === "phone" ? (
                <input
                  placeholder="Enter phone number (e.g., 0241234567)"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doTrack()}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <input
                  placeholder="Enter order reference"
                  value={trackRef}
                  onChange={(e) => setTrackRef(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doTrack()}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              )}

              <button
                onClick={doTrack}
                disabled={trackLoading}
                className="mt-3 w-full rounded-xl bg-[#1a3a5c] py-3 text-sm font-bold text-white transition-colors hover:bg-[#14304a] disabled:opacity-60"
              >
                {trackLoading ? "Searching..." : "Track Order"}
              </button>

              {trackError && <p className="mt-3 text-sm text-red-600">{trackError}</p>}

              {trackSearched && trackMode === "phone" && (
                <div className="mt-4 space-y-3">
                  {trackOrders.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
                      <p className="font-semibold">No orders found</p>
                      <p className="mt-1 text-sm text-gray-500">Check the number or place an order first.</p>
                    </div>
                  )}
                  {trackOrders.map((o) => (
                    <div key={o.ref} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold">{o.productName}</div>
                          <div className="mt-1 text-xs text-gray-500">{o.ref}</div>
                        </div>
                        <StatusPill status={o.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-extrabold text-[#1a3a5c] dark:text-blue-400">{money(o.amount)}</span>
                        <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {trackSearched && trackMode === "ref" && trackOrder && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{trackOrder.productName}</div>
                      <div className="mt-1 text-xs text-gray-500">{trackOrder.ref}</div>
                    </div>
                    <StatusPill status={trackOrder.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-extrabold text-[#1a3a5c] dark:text-blue-400">{money(trackOrder.amount)}</span>
                    <span className="text-xs text-gray-500">{new Date(trackOrder.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
              {trackSearched && trackMode === "ref" && !trackOrder && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
                  <p className="font-semibold">Order not found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
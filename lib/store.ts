import { Redis } from "@upstash/redis";

export type OrderStatus = "pending" | "paid" | "delivered";

export interface Order {
  ref: string;
  phone: string;
  product: string;
  productName: string;
  type: "data" | "service";
  amount: number;
  status: OrderStatus;
  fullName?: string;
  idNumber?: string;
  network?: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
}

export function normalizePhone(phone: string): string {
  return (phone || "").replace(/[\s\-()]/g, "").trim();
}

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.KV_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  // Ignore placeholder / invalid values so dev falls back to in-memory storage
  if (/xxx|your[-_]?token|example|localhost/i.test(url + " " + token)) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  return new Redis({ url, token });
}

// In-memory fallback (dev only)
const memOrders = new Map<string, Order>();
const memPhoneIndex = new Map<string, string[]>();
const memAll = new Set<string>();

export async function saveOrder(order: Order): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.set(`order:${order.ref}`, order);
      await r.lpush(`phone:${order.phone}`, order.ref);
      await r.lpush(`orders:all`, order.ref);
      return;
    } catch {
      // fall through to in-memory
    }
  }
  memOrders.set(order.ref, order);
  const list = memPhoneIndex.get(order.phone) || [];
  if (!list.includes(order.ref)) list.push(order.ref);
  memPhoneIndex.set(order.phone, list);
  memAll.add(order.ref);
}

export async function getOrder(ref: string): Promise<Order | null> {
  const r = getRedis();
  if (r) {
    try {
      const o = await r.get<Order>(`order:${ref}`);
      return o || null;
    } catch {
      // fall through
    }
  }
  return memOrders.get(ref) || null;
}

export async function updateOrder(
  ref: string,
  patch: Partial<Order>
): Promise<Order | null> {
  const existing = await getOrder(ref);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  const r = getRedis();
  if (r) {
    try {
      await r.set(`order:${ref}`, updated);
    } catch {
      memOrders.set(ref, updated);
    }
  } else {
    memOrders.set(ref, updated);
  }
  return updated;
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const norm = normalizePhone(phone);
  const r = getRedis();
  if (r) {
    try {
      const refs = (await r.lrange(`phone:${norm}`, 0, -1)) as string[];
      const orders = await Promise.all(
        (refs || []).map((ref) => r.get<Order>(`order:${ref}`))
      );
      return orders.filter((o): o is Order => !!o);
    } catch {
      // fall through
    }
  }
  const refs = memPhoneIndex.get(norm) || [];
  return refs
    .map((ref) => memOrders.get(ref))
    .filter((o): o is Order => !!o);
}

export async function getAllOrders(): Promise<Order[]> {
  const r = getRedis();
  if (r) {
    try {
      const refs = (await r.lrange(`orders:all`, 0, -1)) as string[];
      const unique = Array.from(new Set(refs || []));
      const orders = await Promise.all(
        unique.map((ref) => r.get<Order>(`order:${ref}`))
      );
      const list = orders.filter((o): o is Order => !!o);
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      // fall through
    }
  }
  const list = Array.from(memAll)
    .map((ref) => memOrders.get(ref))
    .filter((o): o is Order => !!o);
  return list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function upsertOrder(order: Order): Promise<void> {
  const existing = await getOrder(order.ref);
  if (existing) {
    const merged = { ...existing, ...order };
    const r = getRedis();
    if (r) await r.set(`order:${order.ref}`, merged);
    else memOrders.set(order.ref, merged);
  } else {
    await saveOrder(order);
  }
}

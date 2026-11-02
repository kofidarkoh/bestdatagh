export type ProductType = "data" | "service";

export interface DataBundle {
  id: string;
  network: "MTN" | "Telecel" | "AirtelTigo";
  size: string;
  price: number;
  nonExpiry?: boolean;
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export const dataBundles: DataBundle[] = [
  { id: "mtn-1gb", network: "MTN", size: "1GB", price: 5.5, nonExpiry: true },
  { id: "mtn-2gb", network: "MTN", size: "2GB", price: 10, nonExpiry: true },
  { id: "mtn-3gb", network: "MTN", size: "3GB", price: 15, nonExpiry: true },
  { id: "mtn-5gb", network: "MTN", size: "5GB", price: 25, nonExpiry: true },
  { id: "mtn-10gb", network: "MTN", size: "10GB", price: 45, nonExpiry: true },
  { id: "telecel-5gb", network: "Telecel", size: "5GB", price: 25 },
  { id: "telecel-10gb", network: "Telecel", size: "10GB", price: 45 },
  { id: "telecel-15gb", network: "Telecel", size: "15GB", price: 70 },
  { id: "telecel-20gb", network: "Telecel", size: "20GB", price: 90 },
  { id: "at-1gb", network: "AirtelTigo", size: "1GB", price: 3.95 },
  { id: "at-2gb", network: "AirtelTigo", size: "2GB", price: 8.14 },
  { id: "at-5gb", network: "AirtelTigo", size: "5GB", price: 20.35 },
  { id: "at-10gb", network: "AirtelTigo", size: "10GB", price: 40.15 },
  { id: "at-20gb", network: "AirtelTigo", size: "20GB", price: 80.3 },
  { id: "at-30gb", network: "AirtelTigo", size: "30GB", price: 120.0 },
  { id: "at-50gb", network: "AirtelTigo", size: "50GB", price: 200.75 },
];

export const services: Service[] = [
  { id: "mtn-afa", name: "MTN AFA Registration", price: 20 },
  { id: "agent-sim-reg", name: "Agent SIM Registration (MTN/Telecel)", price: 30 },
  { id: "sim-replacement", name: "SIM Replacement", price: 25 },
];

export function getProduct(id: string, type: ProductType) {
  if (type === "data") return dataBundles.find((b) => b.id === id) || null;
  return services.find((s) => s.id === id) || null;
}

export function productPrice(id: string, type: ProductType): number | null {
  const p = getProduct(id, type);
  return p ? p.price : null;
}

export function productLabel(id: string, type: ProductType): string {
  const p = getProduct(id, type);
  if (!p) return id;
  if (type === "data") {
    const d = p as DataBundle;
    return `${d.network} ${d.size}`;
  }
  return (p as Service).name;
}

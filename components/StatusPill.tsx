type Status = "pending" | "paid" | "delivered";

const map: Record<Status, { label: string; cls: string }> = {
  pending: { label: "Pending Verification", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  paid: { label: "Processing", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  delivered: { label: "Delivered", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
};

export default function StatusPill({ status }: { status: Status }) {
  const m = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

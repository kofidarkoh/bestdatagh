"use client";

type Accent = "mtn" | "telecel" | "service";

const accentMap: Record<Accent, { bg: string; text: string; ring: string }> = {
  mtn: { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-400" },
  telecel: { bg: "bg-red-100", text: "text-red-600", ring: "ring-red-500" },
  service: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-[var(--primary)]" },
};

export default function ProductCard({
  title,
  price,
  selected,
  onClick,
  badge,
  accent = "service",
  icon,
}: {
  title: string;
  price: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
  accent?: Accent;
  icon?: string;
}) {
  const a = accentMap[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-start gap-3 rounded-2xl border bg-[var(--surface)] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] ${
        selected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-[var(--shadow-lg)]"
          : "border-[var(--border)] shadow-[var(--shadow)]"
      }`}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white pop">
          ✓
        </span>
      )}
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${a.bg} ${a.text} text-lg font-extrabold`}>
        {icon || title.charAt(0)}
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="text-sm font-semibold leading-tight text-[var(--text)]">{title}</div>
        {badge && (
          <span className="w-fit rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-auto text-lg font-extrabold text-[var(--primary)]">{price}</div>
    </button>
  );
}

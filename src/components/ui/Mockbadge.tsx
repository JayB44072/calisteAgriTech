// src/components/ui/MockBadge.tsx
// Affiché systématiquement quand les données IoT/IA sont simulées

interface MockBadgeProps {
  label?: string;
  size?: "sm" | "md";
}

export function MockBadge({ label = "DONNÉES SIMULÉES", size = "sm" }: MockBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-mono font-semibold tracking-wider uppercase ${
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      {label}
    </span>
  );
}




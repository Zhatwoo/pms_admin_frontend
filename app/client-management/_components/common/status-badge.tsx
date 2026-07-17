"use client";

// ═══════════════════════════════════════════════════════════
// Status Badge — Color-coded status indicators
// ═══════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: string;
  colors: { bg: string; text: string; dot?: string };
  className?: string;
}

export function StatusBadge({ status, colors, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${className}`}
    >
      {colors.dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      )}
      {status}
    </span>
  );
}

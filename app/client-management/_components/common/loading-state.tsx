"use client";

// ═══════════════════════════════════════════════════════════
// Loading State — Skeleton loaders
// ═══════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ background: "var(--cm-surface-tertiary)" }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
    >
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="mb-2 h-7 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
    >
      {/* Header */}
      <div className="flex gap-4 border-b px-4 py-3" style={{ borderColor: "var(--cm-border)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex gap-4 border-b px-4 py-4 last:border-b-0"
          style={{ borderColor: "var(--cm-border-subtle)" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
    >
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-4 h-3 w-48" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="mb-2 h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

export { Skeleton };

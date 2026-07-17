"use client";

// ═══════════════════════════════════════════════════════════
// Stat Card — Premium KPI metric card
// ═══════════════════════════════════════════════════════════

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className = "" }: StatCardProps) {
  const trendColor =
    !trend ? "" :
    trend.value > 0 ? "var(--cm-success)" :
    trend.value < 0 ? "var(--cm-error)" :
    "var(--cm-text-muted)";

  const TrendIcon =
    !trend ? null :
    trend.value > 0 ? TrendingUp :
    trend.value < 0 ? TrendingDown :
    Minus;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 ${className}`}
      style={{
        background: "var(--cm-surface)",
        borderColor: "var(--cm-border)",
        boxShadow: "var(--cm-shadow-xs)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--cm-shadow-md)";
        e.currentTarget.style.borderColor = "var(--cm-border-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--cm-shadow-xs)";
        e.currentTarget.style.borderColor = "var(--cm-border)";
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium" style={{ color: "var(--cm-text-tertiary)" }}>
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight" style={{ color: "var(--cm-text-primary)" }}>
            {value}
          </p>
          {(trend || subtitle) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && TrendIcon && (
                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: trendColor }}>
                  <TrendIcon size={13} />
                  {trend.value > 0 ? "+" : ""}{trend.value}%
                </span>
              )}
              {(trend?.label || subtitle) && (
                <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
                  {trend?.label || subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
            style={{
              background: "var(--cm-accent-lighter)",
              color: "var(--cm-accent)",
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

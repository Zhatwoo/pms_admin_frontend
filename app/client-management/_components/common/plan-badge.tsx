"use client";

// ═══════════════════════════════════════════════════════════
// Plan Badge — Styled plan tier badge
// ═══════════════════════════════════════════════════════════

import type { PlanTier } from "../../_lib/types";
import { PLAN_TIER_LABELS, PLAN_TIER_COLORS } from "../../_lib/constants";

interface PlanBadgeProps {
  tier: PlanTier;
  className?: string;
}

export function PlanBadge({ tier, className = "" }: PlanBadgeProps) {
  const colors = PLAN_TIER_COLORS[tier];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {PLAN_TIER_LABELS[tier]}
    </span>
  );
}

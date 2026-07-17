"use client";

// ═══════════════════════════════════════════════════════════
// Section Header — Section divider with title and actions
// ═══════════════════════════════════════════════════════════

import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, actions, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--cm-text-primary)" }}>
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm" style={{ color: "var(--cm-text-tertiary)" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

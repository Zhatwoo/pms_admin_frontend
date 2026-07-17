"use client";

// ═══════════════════════════════════════════════════════════
// Empty State — Illustrated placeholder for empty pages
// ═══════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center ${className}`}
      style={{ borderColor: "var(--cm-border)" }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: "var(--cm-surface-secondary)", color: "var(--cm-text-muted)" }}
      >
        {icon || <Inbox size={24} />}
      </div>
      <h3 className="text-base font-semibold" style={{ color: "var(--cm-text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm" style={{ color: "var(--cm-text-tertiary)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

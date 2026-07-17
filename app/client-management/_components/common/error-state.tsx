"use client";

// ═══════════════════════════════════════════════════════════
// Error State — Error display with retry
// ═══════════════════════════════════════════════════════════

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border px-6 py-16 text-center ${className}`}
      style={{
        background: "var(--cm-surface)",
        borderColor: "var(--cm-border)",
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: "var(--cm-error-light)", color: "var(--cm-error)" }}
      >
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-base font-semibold" style={{ color: "var(--cm-text-primary)" }}>
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm" style={{ color: "var(--cm-text-tertiary)" }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: "var(--cm-accent)",
            color: "#fff",
          }}
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

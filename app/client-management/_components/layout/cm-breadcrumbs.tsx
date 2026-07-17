"use client";

// ═══════════════════════════════════════════════════════════
// Client Management — Breadcrumbs
// Auto-generated from pathname.
// ═══════════════════════════════════════════════════════════

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  "client-management": "Dashboard",
  clients: "Clients",
  subscriptions: "Subscriptions",
  plans: "Plans",
  billing: "Billing",
  revenue: "Revenue",
  transactions: "Transactions",
  invoices: "Invoices",
  analytics: "Usage Analytics",
  storage: "Storage",
  "api-usage": "API Usage",
  support: "Support Tickets",
  "audit-logs": "Audit Logs",
  announcements: "Announcements",
  "system-health": "System Health",
  settings: "Settings",
};

export function CMBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = LABEL_MAP[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px]">
      <Link
        href="/client-management"
        className="flex items-center gap-1 transition-colors"
        style={{ color: "var(--cm-text-muted)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--cm-text-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--cm-text-muted)"; }}
      >
        <Home size={14} />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight size={12} style={{ color: "var(--cm-text-muted)" }} />
          {crumb.isLast ? (
            <span className="font-medium" style={{ color: "var(--cm-text-primary)" }}>
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="transition-colors"
              style={{ color: "var(--cm-text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--cm-text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--cm-text-muted)"; }}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

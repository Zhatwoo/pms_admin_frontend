"use client";

// ═══════════════════════════════════════════════════════════
// System Health Page
// ═══════════════════════════════════════════════════════════

import { PageHeader } from "../_components/common/page-header";
import { StatusBadge } from "../_components/common/status-badge";
import { MOCK_SYSTEM_HEALTH } from "../_lib/mock-data";
import { HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS } from "../_lib/constants";
import { formatRelativeTime } from "../_lib/utils";
import { Activity } from "lucide-react";

export default function SystemHealthPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Health" description="Real-time status of platform services and infrastructure." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_SYSTEM_HEALTH.map((service) => (
          <div
            key={service.name}
            className="rounded-xl border p-5 transition-colors"
            style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-semibold" style={{ color: "var(--cm-text-primary)" }}>
                  {service.name}
                </h3>
                {service.details && (
                  <p className="mt-1 text-xs" style={{ color: "var(--cm-text-tertiary)" }}>
                    {service.details}
                  </p>
                )}
              </div>
              <StatusBadge
                status={HEALTH_STATUS_LABELS[service.status]}
                colors={HEALTH_STATUS_COLORS[service.status]}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t pt-4" style={{ borderColor: "var(--cm-border-subtle)" }}>
              <div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--cm-text-muted)" }}>Uptime</p>
                <p className="mt-1 text-sm font-medium" style={{ color: "var(--cm-text-secondary)" }}>{service.uptime}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--cm-text-muted)" }}>Latency</p>
                <p className="mt-1 text-sm font-medium" style={{ color: "var(--cm-text-secondary)" }}>{service.responseTime}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--cm-text-muted)" }}>
              <Activity size={12} />
              Last checked {formatRelativeTime(service.lastChecked)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

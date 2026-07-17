"use client";

// ═══════════════════════════════════════════════════════════
// Analytics (Usage) Page
// ═══════════════════════════════════════════════════════════

import { PageHeader } from "../_components/common/page-header";
import { StatCard } from "../_components/common/stat-card";
import { MOCK_USAGE_METRICS } from "../_lib/mock-data";
import { formatStorage, formatNumber, formatNumberCompact } from "../_lib/utils";
import { HardDrive, Activity, Users, Database } from "lucide-react";

export default function AnalyticsPage() {
  const metrics = MOCK_USAGE_METRICS;

  return (
    <div className="space-y-8">
      <PageHeader title="Usage Analytics" description="Platform-wide resource consumption." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Storage Used"
          value={formatStorage(metrics.totalStorageUsedGb)}
          subtitle={`${formatStorage(metrics.totalStorageAllocatedGb)} allocated`}
          icon={<HardDrive size={20} />}
        />
        <StatCard
          title="API Requests (MTD)"
          value={formatNumberCompact(metrics.totalApiRequests)}
          icon={<Activity size={20} />}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(metrics.activeUsers)}
          subtitle={`${metrics.peakConcurrentUsers} peak concurrent`}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Total Database Size"
          value={`${metrics.totalDatabaseSizeMb} MB`}
          icon={<Database size={20} />}
        />
      </div>
      
      <div
        className="flex h-64 items-center justify-center rounded-xl border border-dashed"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}
      >
        <p className="text-sm" style={{ color: "var(--cm-text-muted)" }}>
          Detailed usage charts would be rendered here (e.g., API requests over time).
        </p>
      </div>
    </div>
  );
}

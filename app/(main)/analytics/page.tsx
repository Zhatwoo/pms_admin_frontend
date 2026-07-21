"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Platform Analytics" 
        description="Monitor system usage, adoption metrics, and API health." 
      />
      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-text-muted">Analytics dashboard coming soon.</p>
      </div>
    </div>
  );
}

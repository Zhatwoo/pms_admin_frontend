"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your SaaS platform." 
      />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Tenants", value: "124" },
          { label: "Active Subscriptions", value: "118" },
          { label: "MRR", value: "$42,500" },
          { label: "System Health", value: "99.9%" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-text-tertiary">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-text-muted">Analytics chart placeholder</p>
      </div>
    </div>
  );
}

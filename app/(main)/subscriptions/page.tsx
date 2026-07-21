"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subscriptions" 
        description="Manage active tenant subscriptions and tier plans." 
      />
      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-text-muted">Subscription management coming soon.</p>
      </div>
    </div>
  );
}

"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function FinancialPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Reports" 
        description="View platform-wide revenue generation and payout schedules." 
      />
      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-text-muted">Financial reports coming soon.</p>
      </div>
    </div>
  );
}

"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Audit Logs" 
        description="System-wide audit trail of SaaS administrative actions." 
      />
      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-text-muted">Audit logs coming soon.</p>
      </div>
    </div>
  );
}

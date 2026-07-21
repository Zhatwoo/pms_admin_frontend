"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Roles & Permissions" 
        description="Configure granular access control for SaaS administrators." 
      />
      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-text-muted">Role management coming soon.</p>
      </div>
    </div>
  );
}

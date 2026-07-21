"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clients" 
        description="Manage corporate entities and their billing accounts." 
      />
      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-text-muted">Client management coming soon.</p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: "Active" | "Suspended" | "Pending";
  created: string;
}

const mockTenants: Tenant[] = [
  {
    id: "t-1",
    name: "Golden Gate Pawn",
    subdomain: "goldengate",
    plan: "Enterprise",
    status: "Active",
    created: "Oct 12, 2024",
  },
  {
    id: "t-2",
    name: "Silver Star Lending",
    subdomain: "silverstar",
    plan: "Professional",
    status: "Active",
    created: "Nov 05, 2024",
  },
  {
    id: "t-3",
    name: "Quick Cash Exchange",
    subdomain: "quickcash",
    plan: "Starter",
    status: "Suspended",
    created: "Jan 18, 2025",
  },
];

export default function TenantsPage() {
  const [search, setSearch] = useState("");

  const filteredTenants = mockTenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Tenant Management" 
          description="Manage client organizations, their subdomains, and overarching access." 
        />
        <button className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]">
          + Provision Tenant
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 pl-10 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Subdomain</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    No tenants found matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="transition-colors hover:bg-surface-hover group">
                    <td className="px-6 py-4 font-medium">{tenant.name}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      <span className="rounded-md bg-badge-muted-bg px-2 py-1 text-xs font-medium text-badge-muted-text">
                        {tenant.subdomain}.pms.com
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{tenant.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tenant.status === "Active" 
                          ? "bg-emerald-surface text-emerald-text border border-emerald-border"
                          : tenant.status === "Suspended"
                          ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30"
                          : "bg-badge-muted-bg text-badge-muted-text border border-border-main"
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-tertiary">{tenant.created}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-pawn-gold hover:text-pawn-gold-light opacity-0 group-hover:opacity-100 transition-opacity">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

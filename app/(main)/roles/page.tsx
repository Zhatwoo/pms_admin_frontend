"use client";

import { PageHeader } from "@/components/ui/page-header";

const MODULES = [
  "Dashboard",
  "Clients",
  "Tenants",
  "Subscriptions",
  "Billing",
  "Financial Reports",
  "Analytics",
  "Users",
  "Roles & Permissions",
  "Settings",
  "Audit Logs",
];

const ACCESS: Record<string, { admin: boolean; superAdmin: boolean }> = {
  Dashboard: { admin: true, superAdmin: true },
  Clients: { admin: true, superAdmin: true },
  Tenants: { admin: true, superAdmin: true },
  Subscriptions: { admin: true, superAdmin: true },
  Billing: { admin: true, superAdmin: true },
  "Financial Reports": { admin: false, superAdmin: true },
  Analytics: { admin: true, superAdmin: true },
  Users: { admin: false, superAdmin: true },
  "Roles & Permissions": { admin: false, superAdmin: true },
  Settings: { admin: false, superAdmin: true },
  "Audit Logs": { admin: false, superAdmin: true },
};

function AccessCell({ granted }: { granted: boolean }) {
  return (
    <td className="px-6 py-3 text-center">
      {granted ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-surface text-emerald-text">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      ) : (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-badge-muted-bg text-text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      )}
    </td>
  );
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Access control matrix for SaaS administrator roles."
      />

      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Admin</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {MODULES.map((mod) => (
                <tr key={mod} className="hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-3 font-medium">{mod}</td>
                  <AccessCell granted={ACCESS[mod].admin} />
                  <AccessCell granted={ACCESS[mod].superAdmin} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-text-tertiary">
        Roles are fixed for this platform (Admin, Super Admin). Custom granular permissions are not currently supported.
      </p>
    </div>
  );
}

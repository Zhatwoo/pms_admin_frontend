"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface RevenueReport {
  byMonth: { month: string; total: number }[];
  byPlan: { planName: string; total: number }[];
  topTenants: { tenantName: string; total: number }[];
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function FinancialPage() {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<RevenueReport>("/financial/revenue-report");
        setReport(data);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load financial report");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        description="View platform-wide revenue generation and payout schedules."
      />

      <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-text-primary">Revenue by Month</h3>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
        ) : !report?.byMonth.length ? (
          <div className="flex h-64 items-center justify-center text-text-muted">
            No paid invoices yet.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.byMonth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total" fill="#d4af37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-text-primary">Revenue by Plan</h3>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-text-muted">Loading...</p>
          ) : !report?.byPlan.length ? (
            <p className="py-8 text-center text-sm text-text-muted">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {report.byPlan.map((plan) => (
                <div
                  key={plan.planName}
                  className="flex items-center justify-between rounded-lg bg-surface-secondary p-3"
                >
                  <span className="text-sm font-medium text-text-primary">{plan.planName}</span>
                  <span className="text-sm font-semibold text-text-secondary">
                    {formatCurrency(plan.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-text-primary">Top Tenants by Revenue</h3>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-text-muted">Loading...</p>
          ) : !report?.topTenants.length ? (
            <p className="py-8 text-center text-sm text-text-muted">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {report.topTenants.map((tenant) => (
                <div
                  key={tenant.tenantName}
                  className="flex items-center justify-between rounded-lg bg-surface-secondary p-3"
                >
                  <span className="text-sm font-medium text-text-primary">{tenant.tenantName}</span>
                  <span className="text-sm font-semibold text-text-secondary">
                    {formatCurrency(tenant.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface GrowthData {
  tenantSignups: { month: string; count: number }[];
  newSubscriptions: { month: string; count: number }[];
}

export default function AnalyticsPage() {
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<GrowthData>("/analytics/growth");
        setGrowth(data);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        description="Monitor system usage, adoption metrics, and API health."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-text-primary">Tenant Signups (Last 6 Months)</h3>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth?.tenantSignups ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#d4af37" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-text-primary">New Subscriptions (Last 6 Months)</h3>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth?.newSubscriptions ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

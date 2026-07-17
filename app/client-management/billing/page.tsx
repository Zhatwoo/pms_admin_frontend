"use client";

// ═══════════════════════════════════════════════════════════
// Billing / Revenue Dashboard
// ═══════════════════════════════════════════════════════════

import { PageHeader } from "../_components/common/page-header";
import { StatCard } from "../_components/common/stat-card";
import { SectionHeader } from "../_components/common/section-header";
import { MOCK_DASHBOARD_KPIS, MOCK_REVENUE_TREND, MOCK_REVENUE_BY_PLAN } from "../_lib/mock-data";
import { CHART_COLORS } from "../_lib/constants";
import { formatCurrencyCompact, formatCurrency, formatPercentage } from "../_lib/utils";
import { DollarSign, TrendingUp, CreditCard, RefreshCw, PieChart as PieIcon } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const kpis = MOCK_DASHBOARD_KPIS;

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Billing & Revenue" description="Financial overview and revenue analytics." />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="MRR" value={formatCurrencyCompact(kpis.mrr)} icon={<DollarSign size={20} />} trend={{ value: 12.4 }} />
        <StatCard title="ARR" value={formatCurrencyCompact(kpis.arr)} icon={<TrendingUp size={20} />} trend={{ value: 18.7 }} />
        <StatCard title="Collection Rate" value={`${kpis.collectionRate}%`} icon={<CreditCard size={20} />} trend={{ value: 1.2 }} />
        <StatCard title="Refund Rate" value={`${kpis.refundRate}%`} icon={<RefreshCw size={20} />} trend={{ value: -0.3, label: "vs last month" }} />
        <StatCard title="ARPC" value={formatCurrencyCompact(kpis.avgRevenuePerClient)} icon={<PieIcon size={20} />} trend={{ value: 4.1 }} />
      </div>

      {/* Revenue Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          className="overflow-hidden rounded-xl border p-5"
          style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
        >
          <SectionHeader title="Revenue Trend" description="Monthly revenue performance" />
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={MOCK_REVENUE_TREND} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="billingRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cm-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "var(--cm-surface)", border: "1px solid var(--cm-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area type="monotone" dataKey="value" stroke={CHART_COLORS.emerald} strokeWidth={2} fill="url(#billingRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-xl border p-5"
          style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
        >
          <SectionHeader title="Revenue by Plan" description="Breakdown by subscription tier" />
          <div className="mt-6 space-y-5">
            {MOCK_REVENUE_BY_PLAN.map((item) => (
              <div key={item.plan}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--cm-text-secondary)" }}>{item.plan}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--cm-text-primary)" }}>{formatCurrencyCompact(item.revenue)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--cm-surface-tertiary)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percentage}%`, background: item.color }} />
                </div>
                <p className="mt-0.5 text-xs" style={{ color: "var(--cm-text-muted)" }}>{item.percentage}% of total revenue</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

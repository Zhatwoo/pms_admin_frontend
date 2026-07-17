"use client";

// ═══════════════════════════════════════════════════════════
// Client Management — Overview Dashboard
// Premium executive dashboard with KPIs, charts, and activity
// ═══════════════════════════════════════════════════════════

import { useState } from "react";
import { PageHeader } from "./_components/common/page-header";
import { StatCard } from "./_components/common/stat-card";
import { SectionHeader } from "./_components/common/section-header";
import { StatusBadge } from "./_components/common/status-badge";
import {
  MOCK_DASHBOARD_KPIS, MOCK_MRR_TREND, MOCK_REVENUE_TREND,
  MOCK_CLIENT_GROWTH, MOCK_SUBSCRIPTION_DISTRIBUTION,
  MOCK_REVENUE_BY_PLAN, MOCK_ACTIVITIES,
} from "./_lib/mock-data";
import { ACTIVITY_TYPE_COLORS, CHART_COLORS } from "./_lib/constants";
import { formatCurrency, formatCurrencyCompact, formatNumberCompact, formatStorage, formatRelativeTime, formatPercentage } from "./_lib/utils";
import {
  Users, DollarSign, TrendingUp, Clock, AlertTriangle,
  HardDrive, Activity, CreditCard, UserPlus, Zap,
  Plus, FileText, Megaphone, Download, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Link from "next/link";

const kpis = MOCK_DASHBOARD_KPIS;

export default function ClientManagementOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Overview of your SaaS platform performance and metrics."
        actions={
          <div className="flex gap-2">
            <CMButton href="/client-management/clients" variant="secondary" icon={<Plus size={14} />}>
              New Client
            </CMButton>
            <CMButton href="/client-management/invoices" variant="secondary" icon={<Download size={14} />}>
              Export Report
            </CMButton>
          </div>
        }
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={kpis.totalClients}
          icon={<Users size={20} />}
          trend={{ value: kpis.monthlyGrowth, label: "vs last month" }}
        />
        <StatCard
          title="Active Clients"
          value={kpis.activeClients}
          icon={<UserPlus size={20} />}
          trend={{ value: 5.2, label: "vs last month" }}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={formatCurrencyCompact(kpis.mrr)}
          icon={<DollarSign size={20} />}
          trend={{ value: 12.4, label: "MRR growth" }}
        />
        <StatCard
          title="Annual Recurring Revenue"
          value={formatCurrencyCompact(kpis.arr)}
          icon={<TrendingUp size={20} />}
          trend={{ value: 18.7, label: "YoY" }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MiniStat label="Trial Accounts" value={kpis.trialAccounts} icon={<Clock size={16} />} />
        <MiniStat label="Expired" value={kpis.expiredAccounts} icon={<AlertTriangle size={16} />} color="var(--cm-warning)" />
        <MiniStat label="Storage Used" value={formatStorage(kpis.storageUsedGb)} icon={<HardDrive size={16} />} />
        <MiniStat label="API Requests" value={formatNumberCompact(kpis.apiRequests)} icon={<Activity size={16} />} />
        <MiniStat label="Total Revenue" value={formatCurrencyCompact(kpis.totalRevenue)} icon={<CreditCard size={16} />} />
        <MiniStat label="Outstanding" value={formatCurrencyCompact(kpis.outstandingPayments)} icon={<DollarSign size={16} />} color="var(--cm-error)" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="MRR Growth" description="Monthly recurring revenue trend">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MOCK_MRR_TREND} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cm-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  background: "var(--cm-surface)",
                  border: "1px solid var(--cm-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "var(--cm-shadow-lg)",
                }}
                labelStyle={{ color: "var(--cm-text-primary)", fontWeight: 600 }}
                formatter={(value: number) => [formatCurrency(value), "MRR"]}
              />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.indigo} strokeWidth={2} fill="url(#mrrGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend" description="Total revenue over time">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MOCK_REVENUE_TREND} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cm-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  background: "var(--cm-surface)",
                  border: "1px solid var(--cm-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "var(--cm-shadow-lg)",
                }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.emerald} strokeWidth={2} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Client Growth" description="New vs churned clients">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MOCK_CLIENT_GROWTH} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cm-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--cm-text-muted)" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--cm-surface)",
                  border: "1px solid var(--cm-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "var(--cm-shadow-lg)",
                }}
              />
              <Bar dataKey="newClients" name="New" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan Distribution" description="Clients by subscription plan">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={MOCK_SUBSCRIPTION_DISTRIBUTION}
                dataKey="count"
                nameKey="plan"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                strokeWidth={2}
                stroke="var(--cm-surface)"
              >
                {MOCK_SUBSCRIPTION_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.plan} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--cm-surface)",
                  border: "1px solid var(--cm-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "var(--cm-shadow-lg)",
                }}
                formatter={(value: number, name: string) => [`${value} clients`, name]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: "var(--cm-text-secondary)", fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Plan" description="Revenue distribution across plans">
          <div className="space-y-4 pt-2">
            {MOCK_REVENUE_BY_PLAN.map((item) => (
              <div key={item.plan}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--cm-text-secondary)" }}>
                    {item.plan}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--cm-text-primary)" }}>
                    {formatCurrencyCompact(item.revenue)}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{ background: "var(--cm-surface-tertiary)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%`, background: item.color }}
                  />
                </div>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--cm-text-muted)" }}>
                  {item.percentage}% of total
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <div
          className="col-span-1 lg:col-span-2 overflow-hidden rounded-xl border"
          style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
        >
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <SectionHeader title="Recent Activity" description="Latest events across the platform" />
          </div>
          <div className="divide-y" style={{ borderColor: "var(--cm-border-subtle)" }}>
            {MOCK_ACTIVITIES.slice(0, 8).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3 transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cm-surface-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${ACTIVITY_TYPE_COLORS[activity.type]}`}
                  style={{ background: "var(--cm-surface-secondary)" }}
                >
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: "var(--cm-text-secondary)" }}>
                    {activity.description}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--cm-text-muted)" }}>
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-5 py-3" style={{ borderColor: "var(--cm-border)" }}>
            <Link
              href="/client-management/audit-logs"
              className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: "var(--cm-accent)" }}
            >
              View all activity <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="overflow-hidden rounded-xl border"
          style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
        >
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <SectionHeader title="Quick Actions" />
          </div>
          <div className="space-y-1 p-3">
            <QuickAction icon={<UserPlus size={16} />} label="Create Client" href="/client-management/clients" />
            <QuickAction icon={<Plus size={16} />} label="Create Plan" href="/client-management/plans" />
            <QuickAction icon={<FileText size={16} />} label="Generate Invoice" href="/client-management/invoices" />
            <QuickAction icon={<Megaphone size={16} />} label="Send Announcement" href="/client-management/announcements" />
            <QuickAction icon={<Download size={16} />} label="Export Report" href="/client-management/revenue" />
          </div>

          {/* Platform Stats */}
          <div className="border-t px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--cm-text-muted)" }}>
              Key Metrics
            </p>
            <div className="space-y-2.5">
              <MetricRow label="Churn Rate" value={`${kpis.churnRate}%`} />
              <MetricRow label="ARPC" value={formatCurrencyCompact(kpis.avgRevenuePerClient)} />
              <MetricRow label="Collection Rate" value={`${kpis.collectionRate}%`} />
              <MetricRow label="Refund Rate" value={`${kpis.refundRate}%`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────

function MiniStat({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div
      className="rounded-xl border p-3.5 transition-all duration-200"
      style={{
        background: "var(--cm-surface)",
        borderColor: "var(--cm-border)",
        boxShadow: "var(--cm-shadow-xs)",
      }}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span style={{ color: color || "var(--cm-text-muted)" }}>{icon}</span>
        <span className="text-[11px] font-medium" style={{ color: "var(--cm-text-tertiary)" }}>{label}</span>
      </div>
      <p className="text-lg font-bold" style={{ color: color || "var(--cm-text-primary)" }}>{value}</p>
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-xl border p-5"
      style={{
        background: "var(--cm-surface)",
        borderColor: "var(--cm-border)",
        boxShadow: "var(--cm-shadow-xs)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--cm-text-primary)" }}>{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--cm-text-muted)" }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
      style={{ color: "var(--cm-text-secondary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--cm-surface-hover)";
        e.currentTarget.style.color = "var(--cm-text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--cm-text-secondary)";
      }}
    >
      <span style={{ color: "var(--cm-accent)" }}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <ArrowRight size={12} className="ml-auto" style={{ color: "var(--cm-text-muted)" }} />
    </Link>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "var(--cm-text-tertiary)" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "var(--cm-text-primary)" }}>{value}</span>
    </div>
  );
}

function CMButton({ children, href, variant = "primary", icon }: { children: React.ReactNode; href: string; variant?: "primary" | "secondary"; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
      style={{
        background: variant === "primary" ? "var(--cm-accent)" : "var(--cm-surface)",
        color: variant === "primary" ? "#fff" : "var(--cm-text-secondary)",
        border: variant === "secondary" ? "1px solid var(--cm-border)" : "none",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const size = 14;
  switch (type) {
    case "signup": return <UserPlus size={size} />;
    case "payment": return <DollarSign size={size} />;
    case "upgrade": return <TrendingUp size={size} />;
    case "downgrade": return <TrendingUp size={size} style={{ transform: "rotate(180deg)" }} />;
    case "cancellation": return <AlertTriangle size={size} />;
    case "ticket": return <Zap size={size} />;
    case "invoice": return <FileText size={size} />;
    default: return <Activity size={size} />;
  }
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  Building2,
  Users,
  GitBranch,
  CreditCard,
  UserCheck,
  Receipt,
  TrendingUp,
  Clock,
  ShieldAlert,
  Plus,
  FileText,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DashboardStats {
  overview: {
    totalTenants: number;
    totalUsers: number;
    totalBranches: number;
    totalCustomers: number;
    totalTransactions: number;
    activeSubscriptions: number;
  };
  subscriptionsByPlan: { planName: string; count: number }[];
  recentTenants: {
    id: string;
    name: string;
    createdAt: string;
    userCount: number;
    branchCount: number;
    subscriptionPlan: string | null;
    subscriptionStatus: string | null;
  }[];
}

interface GrowthData {
  tenantSignups: { month: string; count: number }[];
  newSubscriptions: { month: string; count: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get<DashboardStats>("/dashboard/stats");
        setStats(data);
      } catch (err: any) {
        console.error("Failed to load dashboard stats:", err);
        setError("Failed to load live stats from backend.");
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadGrowth() {
      try {
        const data = await api.get<GrowthData>("/analytics/growth");
        setGrowth(data);
      } catch (err) {
        // Analytics growth data is optional — don't show error toast
        console.error("Failed to load growth analytics:", err);
      } finally {
        setIsLoadingGrowth(false);
      }
    }
    loadGrowth();
  }, []);

  const overviewCards = [
    {
      label: "Total Tenants",
      value: stats?.overview?.totalTenants ?? 0,
      icon: Building2,
      color: "from-sky-500 to-blue-600",
    },
    {
      label: "Active Subscriptions",
      value: stats?.overview?.activeSubscriptions ?? 0,
      icon: CreditCard,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Total Users",
      value: stats?.overview?.totalUsers ?? 0,
      icon: Users,
      color: "from-purple-500 to-indigo-600",
    },
    {
      label: "Total Branches",
      value: stats?.overview?.totalBranches ?? 0,
      icon: GitBranch,
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "Registered Customers",
      value: stats?.overview?.totalCustomers ?? 0,
      icon: UserCheck,
      color: "from-pink-500 to-rose-600",
    },
    {
      label: "Total Transactions",
      value: stats?.overview?.totalTransactions ?? 0,
      icon: Receipt,
      color: "from-cyan-500 to-blue-500",
    },
  ];

  const quickActions = [
    {
      label: "Add Client",
      description: "Register a new client company",
      icon: Plus,
      href: "/clients",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20",
    },
    {
      label: "Manage Subscriptions",
      description: "Assign or modify plans",
      icon: CreditCard,
      href: "/subscriptions",
      color: "text-sky-500",
      bg: "bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20",
    },
    {
      label: "Generate Invoices",
      description: "Create monthly billing statements",
      icon: FileText,
      href: "/billing",
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
    },
    {
      label: "View Audit Logs",
      description: "Review system activity trail",
      icon: ClipboardList,
      href: "/audit-logs",
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Overview"
        description="Real-time multi-tenant platform statistics, analytics, and quick actions."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
          <ShieldAlert className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-border-main bg-surface p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-text-primary">
                    {isLoading ? (
                      <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg shadow-sky-500/10`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-tertiary">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${action.bg}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-primary">{action.label}</p>
                  <p className="text-xs text-text-tertiary truncate">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts (merged from /analytics) */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-tertiary">
          Platform Growth
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-text-primary">Tenant Signups (Last 6 Months)</h3>
            {isLoadingGrowth ? (
              <div className="flex h-56 items-center justify-center text-text-muted">Loading...</div>
            ) : !growth?.tenantSignups?.length ? (
              <div className="flex h-56 items-center justify-center text-text-muted">No signup data yet.</div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth.tenantSignups}>
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
            {isLoadingGrowth ? (
              <div className="flex h-56 items-center justify-center text-text-muted">Loading...</div>
            ) : !growth?.newSubscriptions?.length ? (
              <div className="flex h-56 items-center justify-center text-text-muted">No subscription data yet.</div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth.newSubscriptions}>
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

      {/* Two Column Layout: Subscriptions Breakdown & Recent Tenants */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Subscription Plans Breakdown */}
        <div className="rounded-2xl border border-border-main bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border-main pb-4">
            <TrendingUp className="h-5 w-5 text-sky-500" />
            <h2 className="text-lg font-bold text-text-primary">
              Subscriptions by Plan
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : !stats?.subscriptionsByPlan?.length ? (
              <p className="py-8 text-center text-sm text-text-muted">
                No active plan subscriptions yet.
              </p>
            ) : (
              stats.subscriptionsByPlan.map((plan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-surface-secondary p-4 transition-colors hover:bg-surface-hover"
                >
                  <span className="text-sm font-semibold text-text-primary">
                    {plan.planName}
                  </span>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-500">
                    {plan.count} {plan.count === 1 ? "tenant" : "tenants"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tenants List */}
        <div className="rounded-2xl border border-border-main bg-surface p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border-main pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-bold text-text-primary">
                Recently Created Tenants
              </h2>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : !stats?.recentTenants?.length ? (
              <p className="py-12 text-center text-sm text-text-muted">
                No tenants found in the platform.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-main text-xs font-semibold text-text-tertiary uppercase">
                    <th className="pb-3 pt-2">Tenant Name</th>
                    <th className="pb-3 pt-2">Users</th>
                    <th className="pb-3 pt-2">Branches</th>
                    <th className="pb-3 pt-2">Plan</th>
                    <th className="pb-3 pt-2">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {stats.recentTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-surface-hover">
                      <td className="py-3 font-semibold text-text-primary">
                        {tenant.name}
                      </td>
                      <td className="py-3 text-text-secondary">
                        {tenant.userCount}
                      </td>
                      <td className="py-3 text-text-secondary">
                        {tenant.branchCount}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                          {tenant.subscriptionPlan || "Standard"}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-text-tertiary">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

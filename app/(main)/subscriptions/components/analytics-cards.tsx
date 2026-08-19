"use client";

import { CreditCard, DollarSign, TrendingUp, Users, UserCheck, AlertTriangle, Star } from "lucide-react";

export interface AnalyticsSummary {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscribers: number;
  trialUsers: number;
  expired: number;
  mostPopularPlan: string;
  upcomingRenewals: number;
}

export function AnalyticsCards({ summary }: { summary: AnalyticsSummary | null }) {
  const cards = [
    {
      title: "Total Revenue",
      value: summary ? `₱${summary.totalRevenue.toLocaleString()}` : "₱0",
      subtext: "Lifetime platform earnings",
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Monthly Recurring Revenue",
      value: summary ? `₱${summary.monthlyRecurringRevenue.toLocaleString()}` : "₱0",
      subtext: "MRR from active plans",
      icon: <TrendingUp className="h-5 w-5 text-sky-500" />,
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Active Subscribers",
      value: summary?.activeSubscribers ?? 0,
      subtext: "Paid active tenants",
      icon: <UserCheck className="h-5 w-5 text-emerald-400" />,
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Trial Users",
      value: summary?.trialUsers ?? 0,
      subtext: "On free trial period",
      icon: <Users className="h-5 w-5 text-amber-500" />,
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Expired / Canceled",
      value: summary?.expired ?? 0,
      subtext: "Inoperative subscriptions",
      icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Most Popular Plan",
      value: summary?.mostPopularPlan ?? "Standard",
      subtext: "Top subscribed tier",
      icon: <Star className="h-5 w-5 text-pawn-gold" />,
      bg: "bg-pawn-gold/10 border-pawn-gold/20",
    },
    {
      title: "Upcoming Renewals",
      value: summary?.upcomingRenewals ?? 0,
      subtext: "Due in next 30 days",
      icon: <CreditCard className="h-5 w-5 text-purple-500" />,
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {cards.map((c) => (
        <div
          key={c.title}
          className="rounded-xl border border-border-main bg-surface p-4 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              {c.title}
            </span>
            <div className={`p-1.5 rounded-lg border ${c.bg}`}>{c.icon}</div>
          </div>
          <p className="mt-2 text-xl font-bold text-text-primary tracking-tight">{c.value}</p>
          <p className="mt-0.5 text-[11px] text-text-tertiary truncate">{c.subtext}</p>
        </div>
      ))}
    </div>
  );
}

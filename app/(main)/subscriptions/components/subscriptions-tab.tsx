"use client";

import { useState } from "react";
import { Search, Filter, Eye, ArrowUpRight, RefreshCw, PauseCircle, XCircle, MoreVertical } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export interface SubscriptionRow {
  id: string;
  companyName: string;
  tenantId: string;
  tenantName: string;
  subdomain: string;
  planName: string;
  planVersionNumber: number;
  planId: string;
  billingCycle: "monthly" | "annual";
  monthlyPrice: number;
  annualPrice: number;
  status: "active" | "trialing" | "past_due" | "canceled" | "suspended" | "expired";
  branchCount: number;
  branchLimit: number;
  userCount: number;
  userLimit: number;
  storageUsedGb: number;
  storageLimitGb: number;
  startedAt: string;
  endsAt: string | null;
  lastPaymentAt: string | null;
  autoRenew: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30",
  trialing: "bg-sky-500/10 text-sky-500 border border-sky-500/30",
  past_due: "bg-amber-500/10 text-amber-500 border border-amber-500/30",
  suspended: "bg-orange-500/10 text-orange-500 border border-orange-500/30",
  canceled: "bg-rose-500/10 text-rose-500 border border-rose-500/30",
  expired: "bg-zinc-500/10 text-zinc-500 border border-zinc-500/30",
};

export function SubscriptionsTab({
  subscriptions,
  isLoading,
  plans,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  cycleFilter,
  setCycleFilter,
  planFilter,
  setPlanFilter,
  trialOnly,
  setTrialOnly,
  expiringSoon,
  setExpiringSoon,
  onSelectSubscription,
  onOpenAssignModal,
  onOpenUpgradeModal,
  onRefresh,
}: {
  subscriptions: SubscriptionRow[];
  isLoading: boolean;
  plans: { id: string; name: string }[];
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  cycleFilter: string;
  setCycleFilter: (c: string) => void;
  planFilter: string;
  setPlanFilter: (p: string) => void;
  trialOnly: boolean;
  setTrialOnly: (t: boolean) => void;
  expiringSoon: boolean;
  setExpiringSoon: (e: boolean) => void;
  onSelectSubscription: (id: string) => void;
  onOpenAssignModal: () => void;
  onOpenUpgradeModal: (id: string) => void;
  onRefresh: () => void;
}) {
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const handleRenew = async (sub: SubscriptionRow) => {
    try {
      await api.post(`/subscriptions/${sub.id}/renew`, {});
      toast.success(`Subscription for ${sub.companyName} renewed!`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to renew subscription");
    }
  };

  const handleSuspend = async (sub: SubscriptionRow) => {
    if (!confirm(`Suspend subscription for ${sub.companyName}?`)) return;
    try {
      await api.post(`/subscriptions/${sub.id}/suspend`, {});
      toast.success(`Subscription for ${sub.companyName} suspended.`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to suspend subscription");
    }
  };

  const handleCancel = async (sub: SubscriptionRow) => {
    if (!confirm(`Cancel subscription for ${sub.companyName}?`)) return;
    try {
      await api.post(`/subscriptions/${sub.id}/cancel`, {});
      toast.success(`Subscription for ${sub.companyName} canceled.`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to cancel subscription");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-surface p-4 rounded-xl border border-border-main shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, tenant name, or subdomain..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input-border bg-input-bg text-xs text-text-primary outline-none focus:border-pawn-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-text-primary outline-none"
          >
            <option value="">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-text-primary outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="suspended">Suspended</option>
            <option value="canceled">Canceled</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-text-primary outline-none"
          >
            <option value="">All Cycles</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>

          <button
            type="button"
            onClick={onOpenAssignModal}
            className="whitespace-nowrap rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-zinc-950 transition-opacity"
          >
            + Add Subscription
          </button>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Company / Tenant</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Cycle</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Branches</th>
                <th className="px-5 py-3.5">Users</th>
                <th className="px-5 py-3.5">Storage</th>
                <th className="px-5 py-3.5">Started</th>
                <th className="px-5 py-3.5">Expires</th>
                <th className="px-5 py-3.5">Auto Renew</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-text-muted">
                    Loading subscription records...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-text-muted">
                    No subscriptions found matching filters.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => onSelectSubscription(sub.id)}
                    className="transition-colors hover:bg-surface-hover cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-text-primary">{sub.companyName}</p>
                      <p className="text-[11px] text-text-tertiary">{sub.subdomain}.quickpawn.ph</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold text-text-primary">{sub.planName}</span>
                      <span className="text-[10px] text-text-tertiary ml-1">(v{sub.planVersionNumber})</span>
                    </td>

                    <td className="px-5 py-3.5 capitalize text-text-secondary">{sub.billingCycle}</td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          STATUS_STYLES[sub.status]
                        }`}
                      >
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-text-secondary">
                      {sub.branchCount} / {sub.branchLimit}
                    </td>

                    <td className="px-5 py-3.5 text-text-secondary">
                      {sub.userCount} / {sub.userLimit}
                    </td>

                    <td className="px-5 py-3.5 text-text-secondary">
                      {sub.storageUsedGb} / {sub.storageLimitGb} GB
                    </td>

                    <td className="px-5 py-3.5 text-text-tertiary">
                      {new Date(sub.startedAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-text-tertiary">
                      {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString() : "Lifetime"}
                    </td>

                    <td className="px-5 py-3.5">
                      {sub.autoRenew ? (
                        <span className="text-emerald-500 font-bold">Yes</span>
                      ) : (
                        <span className="text-text-tertiary">No</span>
                      )}
                    </td>

                    <td
                      className="px-5 py-3.5 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-block text-left">
                        <button
                          onClick={() => setActionMenuOpenId(actionMenuOpenId === sub.id ? null : sub.id)}
                          className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-secondary"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {actionMenuOpenId === sub.id && (
                          <div className="absolute right-4 mt-1 w-40 rounded-xl border border-border-main bg-surface shadow-xl py-1 z-30 text-xs">
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                onSelectSubscription(sub.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-hover text-text-primary"
                            >
                              <Eye className="h-3.5 w-3.5 text-sky-400" /> View Drawer
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                onOpenUpgradeModal(sub.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-hover text-text-primary"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" /> Change Plan
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                handleRenew(sub);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-hover text-text-primary"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-purple-400" /> Renew
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                handleSuspend(sub);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-hover text-amber-500"
                            >
                              <PauseCircle className="h-3.5 w-3.5" /> Suspend
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                handleCancel(sub);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-hover text-rose-500"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancel
                            </button>
                          </div>
                        )}
                      </div>
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

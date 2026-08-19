"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { X, ArrowUpRight, RefreshCw, PauseCircle, CheckCircle, Clock, ShieldAlert, FileText, History } from "lucide-react";

export interface SubscriptionDetail {
  id: string;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    companyName: string;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  plan: {
    id: string;
    name: string;
    badge: string | null;
    versionNumber: number;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    features: { name: string }[];
    inclusions: { name: string }[];
    addons: { name: string; price: number; unit: string | null }[];
  };
  status: "active" | "trialing" | "past_due" | "canceled" | "suspended" | "expired";
  billingCycle: "monthly" | "annual";
  autoRenew: boolean;
  startedAt: string;
  endsAt: string | null;
  lastPaymentAt: string | null;
  usage: {
    branches: { current: number; limit: number };
    users: { current: number; limit: number };
    storage: { currentGb: number; limitGb: number };
  };
  invoices: {
    id: string;
    amount: number;
    status: string;
    periodStart: string;
    periodEnd: string;
    createdAt: string;
  }[];
  history: {
    id: string;
    action: string;
    planName: string;
    versionNumber: number;
    notes: string | null;
    createdAt: string;
  }[];
}

const STATUS_BADGES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  trialing: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  past_due: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  suspended: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  canceled: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  expired: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30",
};

export function SubscriptionDrawer({
  subscriptionId,
  onClose,
  onActionComplete,
  onOpenUpgradeModal,
}: {
  subscriptionId: string | null;
  onClose: () => void;
  onActionComplete: () => void;
  onOpenUpgradeModal: (subId: string) => void;
}) {
  const [detail, setDetail] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "history">("overview");

  useEffect(() => {
    if (!subscriptionId) return;
    setIsLoading(true);
    api
      .get<SubscriptionDetail>(`/subscriptions/${subscriptionId}`)
      .then((res) => setDetail(res))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load subscription detail"))
      .finally(() => setIsLoading(false));
  }, [subscriptionId]);

  if (!subscriptionId) return null;

  const handleRenew = async () => {
    if (!detail) return;
    try {
      await api.post(`/subscriptions/${detail.id}/renew`, {});
      toast.success(`Subscription for ${detail.tenant.companyName} renewed!`);
      onActionComplete();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to renew subscription");
    }
  };

  const handleSuspend = async () => {
    if (!detail) return;
    if (!confirm(`Suspend subscription for ${detail.tenant.companyName}?`)) return;
    try {
      await api.post(`/subscriptions/${detail.id}/suspend`, {});
      toast.success("Subscription suspended.");
      onActionComplete();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to suspend subscription");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-surface h-full shadow-2xl flex flex-col justify-between border-l border-border-main animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div>
          <div className="p-6 border-b border-border-main flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-primary">
                  {detail?.tenant.companyName || "Loading..."}
                </h2>
                {detail?.status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                      STATUS_BADGES[detail.status]
                    }`}
                  >
                    {detail.status.replace("_", " ")}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-1">
                Subdomain: <span className="font-mono text-text-secondary">{detail?.tenant.subdomain}.quickpawn.ph</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Stats Bar */}
          {detail && (
            <div className="grid grid-cols-3 divide-x divide-border-main border-b border-border-main bg-surface-secondary text-center py-3 text-xs">
              <div>
                <span className="text-text-tertiary block">Current Plan</span>
                <span className="font-bold text-text-primary">{detail.plan.name} (v{detail.plan.versionNumber})</span>
              </div>
              <div>
                <span className="text-text-tertiary block">Billing</span>
                <span className="font-bold text-text-primary capitalize">{detail.billingCycle}</span>
              </div>
              <div>
                <span className="text-text-tertiary block">Expires</span>
                <span className="font-bold text-text-primary">
                  {detail.endsAt ? new Date(detail.endsAt).toLocaleDateString() : "Lifetime"}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {detail && (
            <div className="p-4 border-b border-border-main flex gap-2">
              <button
                onClick={() => onOpenUpgradeModal(detail.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold transition-opacity"
              >
                <ArrowUpRight className="h-4 w-4" /> Change Plan
              </button>
              <button
                onClick={handleRenew}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 text-xs font-bold transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Renew
              </button>
              <button
                onClick={handleSuspend}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors"
              >
                <PauseCircle className="h-4 w-4" /> Suspend
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-border-main px-6 text-xs font-semibold text-text-tertiary">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 mr-6 border-b-2 transition-colors ${
                activeTab === "overview" ? "border-pawn-gold text-text-primary" : "border-transparent hover:text-text-primary"
              }`}
            >
              Overview & Usage
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`py-3 mr-6 border-b-2 transition-colors ${
                activeTab === "invoices" ? "border-pawn-gold text-text-primary" : "border-transparent hover:text-text-primary"
              }`}
            >
              Invoices ({detail?.invoices.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === "history" ? "border-pawn-gold text-text-primary" : "border-transparent hover:text-text-primary"
              }`}
            >
              Audit Trail ({detail?.history.length || 0})
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <p className="text-center text-sm text-text-tertiary py-8">Loading subscription data...</p>
          ) : !detail ? (
            <p className="text-center text-sm text-text-tertiary py-8">Subscription not found</p>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Usage Progress Section */}
                  <div className="space-y-4 rounded-xl border border-border-main bg-surface p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Usage Metrics</h3>

                    {/* Branch Progress */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span>Branches</span>
                        <span>
                          {detail.usage.branches.current} / {detail.usage.branches.limit}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-secondary overflow-hidden">
                        <div
                          className="h-full bg-sky-500"
                          style={{
                            width: `${Math.min(100, (detail.usage.branches.current / detail.usage.branches.limit) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* User Progress */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span>Users / Accounts</span>
                        <span>
                          {detail.usage.users.current} / {detail.usage.users.limit}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-secondary overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{
                            width: `${Math.min(100, (detail.usage.users.current / detail.usage.users.limit) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Storage Progress */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span>Storage</span>
                        <span>
                          {detail.usage.storage.currentGb} GB / {detail.usage.storage.limitGb} GB
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-secondary overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{
                            width: `${Math.min(100, (detail.usage.storage.currentGb / detail.usage.storage.limitGb) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="rounded-xl border border-border-main bg-surface p-4 space-y-2 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-text-tertiary mb-3">Billing Contact</h3>
                    <div className="flex justify-between py-1 border-b border-border-main">
                      <span className="text-text-tertiary">Contact Name</span>
                      <span className="font-medium text-text-primary">{detail.tenant.contactName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-main">
                      <span className="text-text-tertiary">Contact Email</span>
                      <span className="font-medium text-text-primary">{detail.tenant.contactEmail || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-tertiary">Contact Phone</span>
                      <span className="font-medium text-text-primary">{detail.tenant.contactPhone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "invoices" && (
                <div className="space-y-3">
                  {detail.invoices.length === 0 ? (
                    <p className="text-center text-xs text-text-tertiary py-6">No invoices generated yet.</p>
                  ) : (
                    detail.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="rounded-lg border border-border-main bg-surface p-3 flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-text-primary">Invoice #{inv.id.slice(0, 8)}</p>
                          <p className="text-[11px] text-text-tertiary">
                            {new Date(inv.periodStart).toLocaleDateString()} — {new Date(inv.periodEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-text-primary">₱{inv.amount.toLocaleString()}</p>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              inv.status === "paid" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-3 border-l-2 border-border-main pl-4 ml-2">
                  {detail.history.length === 0 ? (
                    <p className="text-center text-xs text-text-tertiary py-6">No audit history available.</p>
                  ) : (
                    detail.history.map((h) => (
                      <div key={h.id} className="relative pb-3 text-xs">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-pawn-gold" />
                        <p className="font-bold text-text-primary uppercase tracking-wide">{h.action.replace(/_/g, " ")}</p>
                        <p className="text-text-secondary">{h.notes}</p>
                        <p className="text-[10px] text-text-tertiary mt-0.5">
                          {new Date(h.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-main bg-surface-secondary text-right">
          <button
            onClick={onClose}
            className="rounded-lg border border-border-main px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Edit2, Trash2, Plus, Sparkles, Check, Users, Building, HardDrive, ShieldAlert } from "lucide-react";
import { PlanDetailData } from "./plan-builder-modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export function PlansTab({
  plans,
  onEditPlan,
  onCreatePlan,
  onRefresh,
}: {
  plans: PlanDetailData[];
  onEditPlan: (plan: PlanDetailData) => void;
  onCreatePlan: () => void;
  onRefresh: () => void;
}) {
  const handleDelete = async (plan: PlanDetailData) => {
    if (!plan.id) return;
    if (!confirm(`Delete or archive plan "${plan.name}"?`)) return;

    try {
      const res = await api.delete<{ softDeleted: boolean; message: string }>(
        `/subscriptions/plans/${plan.id}`
      );
      toast.success(res.message || `Plan "${plan.name}" removed.`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete plan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-4 rounded-xl border border-border-main">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Plan Builder & Tier Configurations</h2>
          <p className="text-xs text-text-tertiary">
            Configure prices, features, limits, and add-ons. Price changes automatically generate new Plan Versions.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreatePlan}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-zinc-950 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-border-main bg-surface p-12 text-center text-text-tertiary">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-pawn-gold opacity-50" />
          <p className="font-semibold text-sm">No subscription plans found</p>
          <p className="text-xs text-text-muted mt-1">Click "Create New Plan" to configure your first pricing tier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => {
            const ver = p.activeVersion;
            return (
              <div
                key={p.id || p.name}
                className={`rounded-2xl border bg-surface p-6 shadow-sm relative group flex flex-col justify-between transition-all hover:shadow-md ${
                  p.isPopular ? "border-amber-400/50 ring-1 ring-amber-400/30" : "border-border-main"
                }`}
              >
                {/* Bookmark-like Yellow Badge for Most Availed */}
                {p.isPopular && (
                  <div className="absolute top-0 right-14 bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-b-md shadow-md">
                    ★ Most Availed
                  </div>
                )}

                <div>
                  {/* Badges & Actions */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-text-primary">{p.name}</h3>
                      {p.isDefault && (
                        <span className="bg-sky-500/10 text-sky-500 border border-sky-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditPlan(p)}
                        className="p-1.5 rounded-md hover:bg-surface-hover text-text-tertiary hover:text-text-primary"
                        title="Edit Plan"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-400 hover:text-rose-600"
                        title="Delete Plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>



                  {/* Pricing */}
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-text-primary">
                      {ver?.monthlyPrice === 0 ? "Custom" : `₱${(ver?.monthlyPrice ?? 0).toLocaleString()}`}
                    </span>
                    {(ver?.monthlyPrice ?? 0) > 0 && (
                      <span className="text-xs text-text-tertiary ml-1">/mo</span>
                    )}
                    {(ver?.annualPrice ?? 0) > 0 && (
                      <p className="text-xs text-text-tertiary mt-0.5">
                        Annual: ₱{ver?.annualPrice.toLocaleString()}/yr
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-main text-xs text-text-secondary">
                    <div className="text-center">
                      <span className="block font-bold text-text-primary">{ver?.limits.branchLimit}</span>
                      <span className="text-[10px] text-text-tertiary">Branches</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-text-primary">{ver?.limits.userLimit}</span>
                      <span className="text-[10px] text-text-tertiary">Users</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-text-primary">{ver?.limits.storageGb}GB</span>
                      <span className="text-[10px] text-text-tertiary">Storage</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="my-4 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                      Features ({ver?.features.length || 0})
                    </p>
                    <ul className="space-y-1.5 text-xs text-text-secondary">
                      {ver?.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{f.name}</span>
                        </li>
                      ))}
                      {(ver?.features.length || 0) > 5 && (
                        <li className="text-[11px] text-text-tertiary italic pl-5">
                          + {(ver?.features.length || 0) - 5} more features...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Addons Count */}
                  {(ver?.addons.length || 0) > 0 && (
                    <div className="pt-2 border-t border-border-main text-xs text-text-tertiary flex justify-between">
                      <span>Available Add-ons:</span>
                      <span className="font-semibold text-text-primary">{ver?.addons.length}</span>
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="mt-6 pt-3 border-t border-border-main flex justify-between items-center text-xs">
                  <span className="text-text-tertiary">
                    Version <strong className="text-text-primary">v{ver?.versionNumber || 1}</strong>
                  </span>
                  <button
                    onClick={() => onEditPlan(p)}
                    className="font-bold text-pawn-gold hover:underline"
                  >
                    Edit Config &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

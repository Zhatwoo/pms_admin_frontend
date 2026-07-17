"use client";

// ═══════════════════════════════════════════════════════════
// Plans Page — Beautiful pricing cards
// ═══════════════════════════════════════════════════════════

import { PageHeader } from "../_components/common/page-header";
import { PLANS } from "../_lib/mock-data";
import { formatCurrency } from "../_lib/utils";
import { Check, X, Star, Copy, Archive, Edit, Plus } from "lucide-react";
import type { Plan } from "../_lib/types";

export default function PlansPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription Plans"
        description="Manage pricing tiers and plan features."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ background: "var(--cm-accent)" }}
          >
            <Plus size={14} />
            Create Plan
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${plan.isPopular ? "ring-2" : ""}`}
      style={{
        background: "var(--cm-surface)",
        borderColor: plan.isPopular ? "var(--cm-accent)" : "var(--cm-border)",
        boxShadow: plan.isPopular ? "var(--cm-shadow-lg)" : "var(--cm-shadow-sm)",
        ...(plan.isPopular ? { "--tw-ring-color": "var(--cm-accent)" } as React.CSSProperties : {}),
      }}
    >
      {plan.isPopular && (
        <div
          className="flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-white"
          style={{ background: "var(--cm-accent)" }}
        >
          <Star size={12} fill="currentColor" />
          Most Popular
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-lg font-bold" style={{ color: "var(--cm-text-primary)" }}>
            {plan.name}
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--cm-text-tertiary)" }}>
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          {plan.priceMonthly === 0 ? (
            <p className="text-3xl font-bold" style={{ color: "var(--cm-text-primary)" }}>
              Custom
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: "var(--cm-text-primary)" }}>
                  {formatCurrency(plan.priceMonthly)}
                </span>
                <span className="text-sm" style={{ color: "var(--cm-text-muted)" }}>/mo</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--cm-text-muted)" }}>
                {formatCurrency(plan.priceYearly)}/yr (save {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
              </p>
            </>
          )}
        </div>

        {/* Limits */}
        <div
          className="mb-5 grid grid-cols-2 gap-2 rounded-lg p-3"
          style={{ background: "var(--cm-surface-secondary)" }}
        >
          <LimitItem label="Branches" value={plan.limits.branches >= 999 ? "Unlimited" : String(plan.limits.branches)} />
          <LimitItem label="Employees" value={plan.limits.employees >= 999 ? "Unlimited" : String(plan.limits.employees)} />
          <LimitItem label="Storage" value={`${plan.limits.storageGb} GB`} />
          <LimitItem label="API Calls" value={plan.limits.apiCallsPerMonth >= 100000 ? "Unlimited" : `${(plan.limits.apiCallsPerMonth / 1000).toFixed(0)}K/mo`} />
        </div>

        {/* Features */}
        <div className="flex-1 space-y-2">
          {plan.features.map((feature) => (
            <div key={feature.name} className="flex items-start gap-2">
              {feature.included ? (
                <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--cm-success)" }} />
              ) : (
                <X size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--cm-text-muted)" }} />
              )}
              <span
                className="text-sm"
                style={{ color: feature.included ? "var(--cm-text-secondary)" : "var(--cm-text-muted)" }}
              >
                {feature.name}
                {feature.limit && (
                  <span className="ml-1 text-xs" style={{ color: "var(--cm-text-muted)" }}>
                    ({feature.limit})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--cm-border)", color: "var(--cm-text-secondary)" }}
          >
            <Edit size={13} className="mr-1 inline" />
            Edit
          </button>
          <button
            type="button"
            className="rounded-lg border px-3 py-2 transition-colors"
            style={{ borderColor: "var(--cm-border)", color: "var(--cm-text-muted)" }}
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            className="rounded-lg border px-3 py-2 transition-colors"
            style={{ borderColor: "var(--cm-border)", color: "var(--cm-text-muted)" }}
            title="Archive"
          >
            <Archive size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LimitItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px]" style={{ color: "var(--cm-text-muted)" }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: "var(--cm-text-primary)" }}>{value}</p>
    </div>
  );
}

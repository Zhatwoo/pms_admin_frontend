"use client";

// ═══════════════════════════════════════════════════════════
// Subscriptions Page
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "../_components/common/page-header";
import { DataTable } from "../_components/common/data-table";
import { StatusBadge } from "../_components/common/status-badge";
import { PlanBadge } from "../_components/common/plan-badge";
import { MOCK_CLIENTS } from "../_lib/mock-data";
import { SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_COLORS } from "../_lib/constants";
import { formatCurrency, formatDate } from "../_lib/utils";
import type { SaasClient } from "../_lib/types";
import { Search } from "lucide-react";

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    if (!search) return MOCK_CLIENTS;
    const lower = search.toLowerCase();
    return MOCK_CLIENTS.filter((c) =>
      c.companyName.toLowerCase().includes(lower) ||
      c.ownerName.toLowerCase().includes(lower)
    );
  }, [search]);

  const columns: ColumnDef<SaasClient, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: "Client",
        cell: ({ row }) => (
          <span className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
            {row.original.companyName}
          </span>
        ),
      },
      {
        id: "plan",
        header: "Plan",
        cell: ({ row }) => <PlanBadge tier={row.original.subscription.plan.tier} />,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.subscription.status;
          return <StatusBadge status={SUBSCRIPTION_STATUS_LABELS[s]} colors={SUBSCRIPTION_STATUS_COLORS[s]} />;
        },
      },
      {
        id: "billing",
        header: "Billing",
        cell: ({ row }) => (
          <span className="text-sm capitalize" style={{ color: "var(--cm-text-secondary)" }}>
            {row.original.subscription.billingCycle}
          </span>
        ),
      },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) => {
          const sub = row.original.subscription;
          const price = sub.billingCycle === "monthly" ? sub.plan.priceMonthly : sub.plan.priceYearly;
          return (
            <span className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
              {price === 0 ? "Custom" : formatCurrency(price)}
              <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
                /{sub.billingCycle === "monthly" ? "mo" : "yr"}
              </span>
            </span>
          );
        },
      },
      {
        id: "periodEnd",
        header: "Renews",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            {formatDate(row.original.subscription.currentPeriodEnd)}
          </span>
        ),
      },
      {
        id: "since",
        header: "Since",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            {formatDate(row.original.subscription.createdAt)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Manage client subscriptions and billing cycles." />

      <div
        className="flex items-center gap-3 rounded-xl border p-3"
        style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-text-muted)" }} />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
            style={{ background: "var(--cm-input-bg)", borderColor: "var(--cm-input-border)", color: "var(--cm-text-primary)" }}
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} pageSize={10} />
    </div>
  );
}

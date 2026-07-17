"use client";

// ═══════════════════════════════════════════════════════════
// Transactions Page
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "../_components/common/page-header";
import { DataTable } from "../_components/common/data-table";
import { StatusBadge } from "../_components/common/status-badge";
import { MOCK_TRANSACTIONS } from "../_lib/mock-data";
import { formatCurrency, formatDateTime } from "../_lib/utils";
import type { Transaction } from "../_lib/types";
import { Search } from "lucide-react";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    if (!search) return MOCK_TRANSACTIONS;
    const lower = search.toLowerCase();
    return MOCK_TRANSACTIONS.filter((txn) =>
      txn.clientName.toLowerCase().includes(lower) ||
      txn.id.toLowerCase().includes(lower)
    );
  }, [search]);

  const columns: ColumnDef<Transaction, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <span className="text-sm capitalize" style={{ color: "var(--cm-text-secondary)" }}>
            {(getValue() as string).replace("_", " ")}
          </span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ getValue }) => (
          <span className="text-sm capitalize" style={{ color: "var(--cm-text-secondary)" }}>
            {(getValue() as string).replace("_", " ")}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span
            className="text-sm font-medium"
            style={{ color: row.original.amount < 0 ? "var(--cm-error)" : "var(--cm-success)" }}
          >
            {row.original.amount > 0 ? "+" : ""}{formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          const colors =
            s === "completed" ? { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" } :
            s === "failed" ? { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-400" } :
            { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400" };
          return <StatusBadge status={s.charAt(0).toUpperCase() + s.slice(1)} colors={colors} />;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            {formatDateTime(getValue() as string)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="View all payments, refunds, and adjustments." />

      <div
        className="flex items-center gap-3 rounded-xl border p-3"
        style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-text-muted)" }} />
          <input
            type="text"
            placeholder="Search by client or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
            style={{ background: "var(--cm-input-bg)", borderColor: "var(--cm-input-border)", color: "var(--cm-text-primary)" }}
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} pageSize={15} />
    </div>
  );
}

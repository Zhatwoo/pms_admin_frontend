"use client";

// ═══════════════════════════════════════════════════════════
// Invoices Page
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "../_components/common/page-header";
import { DataTable } from "../_components/common/data-table";
import { StatusBadge } from "../_components/common/status-badge";
import { MOCK_INVOICES } from "../_lib/mock-data";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "../_lib/constants";
import { formatCurrency, formatDate } from "../_lib/utils";
import type { Invoice } from "../_lib/types";
import { Search, Download, Plus } from "lucide-react";
import { Modal } from "../_components/common/modal";

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
    }, 1000);
  };

  const data = useMemo(() => {
    if (!search) return MOCK_INVOICES;
    const lower = search.toLowerCase();
    return MOCK_INVOICES.filter((inv) =>
      inv.invoiceNumber.toLowerCase().includes(lower) ||
      inv.clientName.toLowerCase().includes(lower)
    );
  }, [search]);

  const columns: ColumnDef<Invoice, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "Invoice",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ getValue }) => (
          <span className="text-sm" style={{ color: "var(--cm-text-secondary)" }}>
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          return <StatusBadge status={INVOICE_STATUS_LABELS[s]} colors={INVOICE_STATUS_COLORS[s]} />;
        },
      },
      {
        accessorKey: "issuedAt",
        header: "Issued",
        cell: ({ getValue }) => (
          <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            {formatDate(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ getValue }) => (
          <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            {formatDate(getValue() as string)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{ color: "var(--cm-text-muted)" }}
            title="Download PDF"
          >
            <Download size={14} />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage billing and statements for your clients."
        actions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "var(--cm-accent)" }}
          >
            <Plus size={14} />
            Create Invoice
          </button>
        }
      />

      <div
        className="flex items-center gap-3 rounded-xl border p-3"
        style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-text-muted)" }} />
          <input
            type="text"
            placeholder="Search invoice number or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
            style={{ background: "var(--cm-input-bg)", borderColor: "var(--cm-input-border)", color: "var(--cm-text-primary)" }}
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} pageSize={10} />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Create Invoice"
        subtitle="Generate a manual invoice for a client."
        width="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
                Select Client
              </label>
              <select
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{
                  background: "var(--cm-input-bg)",
                  borderColor: "var(--cm-input-border)",
                  color: "var(--cm-text-primary)",
                  "--tw-ring-color": "var(--cm-accent)",
                } as React.CSSProperties}
              >
                <option value="">-- Choose a client --</option>
                <option value="1">Lending Inc</option>
                <option value="2">Pawnshop Co</option>
                <option value="3">Gold Traders</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{
                    background: "var(--cm-input-bg)",
                    borderColor: "var(--cm-input-border)",
                    color: "var(--cm-text-primary)",
                    "--tw-ring-color": "var(--cm-accent)",
                  } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{
                    background: "var(--cm-input-bg)",
                    borderColor: "var(--cm-input-border)",
                    color: "var(--cm-text-primary)",
                    "--tw-ring-color": "var(--cm-accent)",
                  } as React.CSSProperties}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
                Description / Line Items
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Monthly subscription fee"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{
                  background: "var(--cm-input-bg)",
                  borderColor: "var(--cm-input-border)",
                  color: "var(--cm-text-primary)",
                  "--tw-ring-color": "var(--cm-accent)",
                } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--cm-border)" }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{
                borderColor: "var(--cm-border)",
                color: "var(--cm-text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-w-[100px] items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-70"
              style={{ background: "var(--cm-accent)" }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </span>
              ) : (
                "Generate Invoice"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

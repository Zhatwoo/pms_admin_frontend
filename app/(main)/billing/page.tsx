"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Eye, Printer } from "lucide-react";

type InvoiceStatus = "paid" | "pending" | "failed";

interface Invoice {
  id: string;
  tenantId?: string;
  tenant: string;
  companyName?: string | null;
  contactEmail?: string | null;
  plan: string;
  amount: string;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

interface BillingSummary {
  monthlyRecurringRevenue: number;
  outstandingInvoices: number;
  collectedThisMonth: number;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-surface text-emerald-text border border-emerald-border",
  pending: "bg-badge-muted-bg text-badge-muted-text border border-border-main",
  failed: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30",
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const [summaryData, invoiceRes] = await Promise.all([
        api.get<BillingSummary>("/billing/summary"),
        api.get<{ data: Invoice[] }>(`/billing/invoices?${params.toString()}`),
      ]);
      setSummary(summaryData);
      setInvoices(invoiceRes.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load billing data");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post<{ generated: number }>("/billing/invoices/generate", {});
      toast.success(`Generated ${res.generated} invoice(s) for this period.`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to generate invoices");
    } finally {
      setIsGenerating(false);
    }
  };

  const markPaid = async (id: string) => {
    try {
      await api.patch(`/billing/invoices/${id}/mark-paid`, {});
      toast.success("Invoice marked as paid.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Billing & Invoicing"
          description="Monitor platform revenue, outstanding invoices, and payment status."
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Monthly Invoices"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Monthly Recurring Revenue", value: summary?.monthlyRecurringRevenue },
          { label: "Outstanding Invoices", value: summary?.outstandingInvoices },
          { label: "Collected This Month", value: summary?.collectedThisMonth },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-text-tertiary">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              {isLoading || stat.value === undefined ? "—" : formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="border-b border-border-main p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-text-primary">Invoices Log</h3>

          {/* Status Filter Pills */}
          <div className="flex gap-1.5 rounded-lg bg-surface-secondary p-1">
            {["all", "pending", "paid", "failed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-brand-gold text-zinc-900 shadow-sm"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">
                      {invoice.tenant}
                      {invoice.companyName && (
                        <span className="block text-xs text-text-tertiary">{invoice.companyName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{invoice.plan}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(Number(invoice.amount))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewInvoice(invoice)}
                          className="flex items-center gap-1 rounded-md border border-border-main px-2.5 py-1 text-xs font-semibold text-text-secondary hover:bg-surface-hover"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        {invoice.status === "pending" && (
                          <button
                            onClick={() => markPaid(invoice.id)}
                            className="text-xs font-semibold text-pawn-gold hover:underline"
                          >
                            Mark Paid
                          </button>
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

      {/* PRINTABLE INVOICE PREVIEW MODAL */}
      {previewInvoice && (
        <Modal
          isOpen={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          title={`Invoice #${previewInvoice.id.slice(0, 8).toUpperCase()}`}
        >
          <div className="space-y-6 text-sm">
            <div className="flex justify-between items-start border-b border-border-main pb-4">
              <div>
                <p className="text-lg font-bold text-text-primary">PMS SaaS Platform</p>
                <p className="text-xs text-text-tertiary">Official Billing Statement</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLES[previewInvoice.status]}`}>
                  {previewInvoice.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-surface-secondary p-4 rounded-xl">
              <div>
                <p className="text-text-tertiary font-semibold uppercase">Billed To</p>
                <p className="font-bold text-text-primary text-sm mt-1">{previewInvoice.tenant}</p>
                {previewInvoice.companyName && (
                  <p className="text-text-secondary">{previewInvoice.companyName}</p>
                )}
                {previewInvoice.contactEmail && (
                  <p className="text-text-tertiary">{previewInvoice.contactEmail}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-text-tertiary font-semibold uppercase">Invoice Details</p>
                <p className="text-text-secondary mt-1">
                  Issued: {new Date(previewInvoice.createdAt).toLocaleDateString()}
                </p>
                <p className="text-text-secondary">
                  Period: {new Date(previewInvoice.periodStart).toLocaleDateString()} - {new Date(previewInvoice.periodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border border-border-main rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-secondary text-text-secondary border-b border-border-main">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-medium text-text-primary">
                      {previewInvoice.plan} Subscription Fee
                    </td>
                    <td className="p-3 text-right font-semibold text-text-primary">
                      {formatCurrency(Number(previewInvoice.amount))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-border-main px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover"
              >
                <Printer className="h-4 w-4" /> Print Statement
              </button>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="rounded-lg bg-brand-gold px-4 py-2 text-xs font-semibold text-zinc-900 hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


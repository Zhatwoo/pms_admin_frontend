"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type InvoiceStatus = "paid" | "pending" | "failed";

interface Invoice {
  id: string;
  tenant: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryData, invoiceRes] = await Promise.all([
        api.get<BillingSummary>("/billing/summary"),
        api.get<{ data: Invoice[] }>("/billing/invoices?limit=20"),
      ]);
      setSummary(summaryData);
      setInvoices(invoiceRes.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load billing data");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          description="Monitor platform revenue, outstanding invoices, and payment gateways."
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate This Month's Invoices"}
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
        <div className="border-b border-border-main p-6">
          <h3 className="text-lg font-medium text-text-primary">Recent Invoices</h3>
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
                    No invoices yet. Generate this month&apos;s invoices to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{invoice.tenant}</td>
                    <td className="px-6 py-4 text-text-secondary">{invoice.plan}</td>
                    <td className="px-6 py-4">{formatCurrency(Number(invoice.amount))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.status === "pending" && (
                        <button
                          onClick={() => markPaid(invoice.id)}
                          className="text-sm font-medium text-pawn-gold hover:text-pawn-gold-light opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark Paid
                        </button>
                      )}
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

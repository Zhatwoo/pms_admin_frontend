"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Billing & Invoicing" 
        description="Monitor platform revenue, outstanding invoices, and payment gateways." 
      />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Monthly Recurring Revenue", value: "$42,500.00" },
          { label: "Outstanding Invoices", value: "$3,200.00" },
          { label: "Net Processing Fees (MTD)", value: "$415.50" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border-main bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-text-tertiary">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="border-b border-border-main p-6">
          <h3 className="text-lg font-medium text-text-primary">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4">Oct 28, 2024</td>
                <td className="px-6 py-4 font-medium">Golden Gate Pawn</td>
                <td className="px-6 py-4">$499.00</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-surface px-2.5 py-0.5 text-xs font-semibold text-emerald-text border border-emerald-border">
                    Paid
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4">Oct 28, 2024</td>
                <td className="px-6 py-4 font-medium">Silver Star Lending</td>
                <td className="px-6 py-4">$299.00</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-surface px-2.5 py-0.5 text-xs font-semibold text-emerald-text border border-emerald-border">
                    Paid
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4">Oct 27, 2024</td>
                <td className="px-6 py-4 font-medium">Quick Cash Exchange</td>
                <td className="px-6 py-4">$199.00</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                    Failed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

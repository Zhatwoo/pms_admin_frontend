"use client";

// ═══════════════════════════════════════════════════════════
// Clients Page — Enterprise client table with detail drawer
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "../_components/common/page-header";
import { DataTable } from "../_components/common/data-table";
import { StatusBadge } from "../_components/common/status-badge";
import { PlanBadge } from "../_components/common/plan-badge";
import { Drawer } from "../_components/common/drawer";
import { Modal } from "../_components/common/modal";
import { MOCK_CLIENTS } from "../_lib/mock-data";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS } from "../_lib/constants";
import { formatCurrency, formatStorage, formatRelativeTime, formatDate, getInitials, formatNumber } from "../_lib/utils";
import type { SaasClient } from "../_lib/types";
import {
  Search, Plus, Download, Filter, Users, Building2, HardDrive, CreditCard,
  MoreHorizontal, Eye, Ban, PlayCircle, KeyRound, Mail, Globe, Phone,
  MapPin, Calendar, Clock, BarChart3, FileText,
} from "lucide-react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<SaasClient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      // In a real app, this would refresh the data
    }, 1000);
  };

  const filteredClients = useMemo(() => {
    return MOCK_CLIENTS.filter((client) => {
      if (statusFilter !== "all" && client.status !== statusFilter) return false;
      if (planFilter !== "all" && client.subscription.plan.tier !== planFilter) return false;
      if (search) {
        const lower = search.toLowerCase();
        return (
          client.companyName.toLowerCase().includes(lower) ||
          client.ownerName.toLowerCase().includes(lower) ||
          client.email.toLowerCase().includes(lower)
        );
      }
      return true;
    });
  }, [search, statusFilter, planFilter]);

  const columns: ColumnDef<SaasClient, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: "var(--cm-accent-lighter)", color: "var(--cm-accent)" }}
              >
                {getInitials(client.companyName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
                  {client.companyName}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--cm-text-muted)" }}>
                  {client.ownerName}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <span className="text-sm" style={{ color: "var(--cm-text-secondary)" }}>
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "plan",
        header: "Plan",
        cell: ({ row }) => <PlanBadge tier={row.original.subscription.plan.tier} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <StatusBadge
              status={CLIENT_STATUS_LABELS[status]}
              colors={CLIENT_STATUS_COLORS[status]}
            />
          );
        },
      },
      {
        accessorKey: "branchCount",
        header: "Branches",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium" style={{ color: "var(--cm-text-secondary)" }}>
            {getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "employeeCount",
        header: "Employees",
        cell: ({ getValue }) => (
          <span className="text-sm" style={{ color: "var(--cm-text-secondary)" }}>
            {getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "storageUsedGb",
        header: "Storage",
        cell: ({ row }) => (
          <div>
            <span className="text-sm" style={{ color: "var(--cm-text-secondary)" }}>
              {formatStorage(row.original.storageUsedGb)}
            </span>
            <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
              {" "}/ {formatStorage(row.original.storageAllocatedGb)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totalRevenue",
        header: "Revenue",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last Login",
        cell: ({ getValue }) => (
          <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            {formatRelativeTime(getValue() as string)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${MOCK_CLIENTS.length} total clients across all plans.`}
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ background: "var(--cm-accent)" }}
          >
            <Plus size={14} />
            Add Client
          </button>
        }
      />

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
        style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-text-muted)" }} />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors"
            style={{
              background: "var(--cm-input-bg)",
              borderColor: "var(--cm-input-border)",
              color: "var(--cm-text-primary)",
            }}
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "All Statuses", value: "all" },
            { label: "Active", value: "active" },
            { label: "Trial", value: "trial" },
            { label: "Inactive", value: "inactive" },
            { label: "Suspended", value: "suspended" },
            { label: "Churned", value: "churned" },
          ]}
        />
        <FilterSelect
          value={planFilter}
          onChange={setPlanFilter}
          options={[
            { label: "All Plans", value: "all" },
            { label: "Starter", value: "starter" },
            { label: "Professional", value: "professional" },
            { label: "Enterprise", value: "enterprise" },
            { label: "Custom", value: "custom" },
          ]}
        />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
          style={{
            borderColor: "var(--cm-border)",
            color: "var(--cm-text-secondary)",
            background: "var(--cm-surface)",
          }}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredClients}
        pageSize={10}
        onRowClick={(client) => setSelectedClient(client)}
        emptyMessage="No clients match your filters."
      />

      {/* Client Detail Drawer */}
      <Drawer
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.companyName || ""}
        subtitle={selectedClient?.ownerName}
        width="max-w-xl"
      >
        {selectedClient && <ClientDetailContent client={selectedClient} />}
      </Drawer>

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="Add New Client"
        subtitle="Provision a new workspace for a pawnshop."
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
                Company Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Pawnshop"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{
                  background: "var(--cm-input-bg)",
                  borderColor: "var(--cm-input-border)",
                  color: "var(--cm-text-primary)",
                  "--tw-ring-color": "var(--cm-accent)",
                } as React.CSSProperties}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
                  Owner Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
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
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
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
                Subscription Plan
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
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--cm-border)" }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
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
                  Creating...
                </span>
              ) : (
                "Create Client"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Client Detail Content ──────────────────────────────────

function ClientDetailContent({ client }: { client: SaasClient }) {
  return (
    <div className="space-y-6 p-6">
      {/* Status & Plan */}
      <div className="flex items-center gap-3">
        <StatusBadge
          status={CLIENT_STATUS_LABELS[client.status]}
          colors={CLIENT_STATUS_COLORS[client.status]}
        />
        <PlanBadge tier={client.subscription.plan.tier} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <DrawerAction icon={<Eye size={13} />} label="Impersonate" />
        <DrawerAction icon={<Ban size={13} />} label="Suspend" variant="danger" />
        <DrawerAction icon={<PlayCircle size={13} />} label="Activate" />
        <DrawerAction icon={<KeyRound size={13} />} label="Reset Password" />
      </div>

      {/* Company Info */}
      <DetailSection title="Company Information">
        <DetailRow icon={<Mail size={14} />} label="Email" value={client.email} />
        <DetailRow icon={<Phone size={14} />} label="Phone" value={client.phone} />
        <DetailRow icon={<Globe size={14} />} label="Website" value={client.website} />
        <DetailRow icon={<MapPin size={14} />} label="Address" value={client.address} />
        <DetailRow icon={<MapPin size={14} />} label="Region" value={client.region} />
        <DetailRow icon={<Calendar size={14} />} label="Created" value={formatDate(client.createdAt)} />
        <DetailRow icon={<Clock size={14} />} label="Last Login" value={formatRelativeTime(client.lastLoginAt)} />
      </DetailSection>

      {/* Usage */}
      <DetailSection title="Usage">
        <DetailRow icon={<Building2 size={14} />} label="Branches" value={`${client.branchCount} / ${client.subscription.plan.limits.branches}`} />
        <DetailRow icon={<Users size={14} />} label="Employees" value={`${client.employeeCount} / ${client.subscription.plan.limits.employees}`} />
        <DetailRow icon={<HardDrive size={14} />} label="Storage" value={`${formatStorage(client.storageUsedGb)} / ${formatStorage(client.storageAllocatedGb)}`} />
        <DetailRow icon={<BarChart3 size={14} />} label="API Requests" value={`${formatNumber(client.apiRequestsThisMonth)} / ${formatNumber(client.apiRequestsLimit)}`} />

        {/* Storage bar */}
        <div className="mt-2">
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--cm-surface-tertiary)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((client.storageUsedGb / client.storageAllocatedGb) * 100, 100)}%`,
                background: client.storageUsedGb / client.storageAllocatedGb > 0.8 ? "var(--cm-warning)" : "var(--cm-accent)",
              }}
            />
          </div>
        </div>
      </DetailSection>

      {/* Financial */}
      <DetailSection title="Financial">
        <DetailRow icon={<CreditCard size={14} />} label="Total Revenue" value={formatCurrency(client.totalRevenue)} />
        <DetailRow icon={<FileText size={14} />} label="Outstanding" value={formatCurrency(client.outstandingBalance)} />
        <DetailRow icon={<CreditCard size={14} />} label="Current Plan" value={`${client.subscription.plan.name} (${client.subscription.billingCycle})`} />
      </DetailSection>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border px-3 py-2 text-sm outline-none"
      style={{
        background: "var(--cm-input-bg)",
        borderColor: "var(--cm-input-border)",
        color: "var(--cm-text-secondary)",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--cm-text-muted)" }}
      >
        {title}
      </h3>
      <div
        className="space-y-2.5 rounded-lg border p-3"
        style={{ background: "var(--cm-surface-secondary)", borderColor: "var(--cm-border-subtle)" }}
      >
        {children}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2" style={{ color: "var(--cm-text-tertiary)" }}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-right text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function DrawerAction({ icon, label, variant }: { icon: React.ReactNode; label: string; variant?: "danger" }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
      style={{
        borderColor: variant === "danger" ? "var(--cm-error-light)" : "var(--cm-border)",
        color: variant === "danger" ? "var(--cm-error)" : "var(--cm-text-secondary)",
        background: "var(--cm-surface)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

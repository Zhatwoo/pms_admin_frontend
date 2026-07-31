"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type TenantStatus = "active" | "suspended" | "pending";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: TenantStatus;
  createdAt: string;
  userCount: number;
  branchCount: number;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
}

interface TenantListResponse {
  data: Tenant[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const STATUS_STYLES: Record<TenantStatus, string> = {
  active: "bg-emerald-surface text-emerald-text border border-emerald-border",
  suspended: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30",
  pending: "bg-badge-muted-bg text-badge-muted-text border border-border-main",
};

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [manageTenant, setManageTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await api.get<TenantListResponse>(`/tenants?${params.toString()}`);
      setTenants(res.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load tenants");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Tenant Management"
          description="Manage client organizations, their subdomains, and overarching access."
        />
        <button
          onClick={() => setIsProvisionOpen(true)}
          className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          + Provision Tenant
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 pl-10 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Subdomain</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    Loading tenants...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    {search ? `No tenants found matching "${search}"` : "No tenants yet."}
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="transition-colors hover:bg-surface-hover group">
                    <td className="px-6 py-4 font-medium">{tenant.name}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      <span className="rounded-md bg-badge-muted-bg px-2 py-1 text-xs font-medium text-badge-muted-text">
                        {tenant.subdomain}.pms.com
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{tenant.subscriptionPlan ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[tenant.status]}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-tertiary">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setManageTenant(tenant)}
                        className="text-sm font-medium text-pawn-gold hover:text-pawn-gold-light opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProvisionTenantModal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        onCreated={loadTenants}
      />

      <ManageTenantModal
        tenant={manageTenant}
        onClose={() => setManageTenant(null)}
        onUpdated={loadTenants}
      />
    </div>
  );
}

function ProvisionTenantModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setSubdomain("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/tenants", { name, subdomain });
      toast.success(`Tenant "${name}" provisioned.`);
      reset();
      onClose();
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to provision tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Provision Tenant">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Tenant Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Golden Gate Pawn"
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Subdomain</label>
          <div className="flex items-center">
            <input
              required
              pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              placeholder="goldengate"
              className="w-full rounded-l-lg border border-r-0 border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
            />
            <span className="rounded-r-lg border border-input-border bg-surface-secondary px-3 py-2 text-sm text-text-tertiary">
              .pms.com
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Provisioning..." : "Provision Tenant"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ManageTenantModal({
  tenant,
  onClose,
  onUpdated,
}: {
  tenant: Tenant | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<TenantStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tenant) setStatus(tenant.status);
  }, [tenant]);

  if (!tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch(`/tenants/${tenant.id}`, { status });
      toast.success(`Tenant "${tenant.name}" updated.`);
      onClose();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!tenant} onClose={onClose} title={`Manage ${tenant.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-tertiary">Subdomain</p>
            <p className="font-medium text-text-primary">{tenant.subdomain}.pms.com</p>
          </div>
          <div>
            <p className="text-text-tertiary">Plan</p>
            <p className="font-medium text-text-primary">{tenant.subscriptionPlan ?? "—"}</p>
          </div>
          <div>
            <p className="text-text-tertiary">Users</p>
            <p className="font-medium text-text-primary">{tenant.userCount}</p>
          </div>
          <div>
            <p className="text-text-tertiary">Branches</p>
            <p className="font-medium text-text-primary">{tenant.branchCount}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TenantStatus)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

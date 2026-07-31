"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  billingAddress: string | null;
  tenant: { id: string; name: string; status: string };
}

interface TenantOption {
  id: string;
  name: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Client[]>("/clients");
      setClients(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Clients"
          description="Manage corporate entities and their billing accounts."
        />
        <button
          onClick={() => setIsCreateOpen(true)}
          className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          + Add Client
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    No client billing records yet.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-surface-hover group">
                    <td className="px-6 py-4 font-medium">{client.companyName}</td>
                    <td className="px-6 py-4 text-text-secondary">{client.tenant.name}</td>
                    <td className="px-6 py-4 text-text-secondary">{client.contactName}</td>
                    <td className="px-6 py-4 text-text-tertiary">{client.contactEmail}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditClient(client)}
                        className="text-sm font-medium text-pawn-gold hover:text-pawn-gold-light opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={load}
      />

      {editClient && (
        <ClientFormModal
          isOpen={!!editClient}
          onClose={() => setEditClient(null)}
          onSaved={load}
          existing={editClient}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  isOpen,
  onClose,
  onSaved,
  existing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existing?: Client;
}) {
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [tenantId, setTenantId] = useState(existing?.tenant.id ?? "");
  const [companyName, setCompanyName] = useState(existing?.companyName ?? "");
  const [contactName, setContactName] = useState(existing?.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(existing?.contactEmail ?? "");
  const [billingAddress, setBillingAddress] = useState(existing?.billingAddress ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || existing) return;
    api
      .get<{ data: TenantOption[] }>("/tenants?limit=100")
      .then((res) => setTenants(res.data))
      .catch(() => setTenants([]));
  }, [isOpen, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setIsSubmitting(true);
    try {
      await api.put(`/clients/tenant/${tenantId}`, {
        companyName,
        contactName,
        contactEmail,
        billingAddress: billingAddress || undefined,
      });
      toast.success(`Client "${companyName}" saved.`);
      onClose();
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? `Edit ${existing.companyName}` : "Add Client"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!existing && (
          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-secondary">Tenant</label>
            <select
              required
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none"
            >
              <option value="">Select a tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Company Name</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Contact Name</label>
          <input
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Contact Email</label>
          <input
            required
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Billing Address</label>
          <textarea
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
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
            {isSubmitting ? "Saving..." : "Save Client"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

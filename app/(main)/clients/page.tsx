"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { ClientDetailHubModal } from "@/components/ui/client-detail-hub-modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Search, Eye, Edit2, Trash2, Building2, ExternalLink } from "lucide-react";

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  billingAddress: string | null;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    status: string;
    _count?: { branches: number; users: number; customers: number };
  };
}

interface TenantOption {
  id: string;
  name: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [selectedHubClientId, setSelectedHubClientId] = useState<string | null>(null);
  const [deleteClientTarget, setDeleteClientTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const path = debouncedSearch
        ? `/clients?search=${encodeURIComponent(debouncedSearch)}`
        : "/clients";
      const data = await api.get<Client[]>(path);
      setClients(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteClient = async () => {
    if (!deleteClientTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/clients/${deleteClientTarget.id}`);
      toast.success(`Client "${deleteClientTarget.companyName}" deleted.`);
      setDeleteClientTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Clients & Corporate Entities"
          description="Central management hub for client companies, accounts, branch locations, and staff."
        />
        <button
          onClick={() => setIsCreateOpen(true)}
          className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          + Add Client Profile
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search company, contact, email, phone, or subdomain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 pl-10 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant Subdomain</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Contact Details</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Loading client records...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    {search ? `No clients matching "${search}"` : "No client billing records yet."}
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-surface-hover group">
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-brand-gold" />
                        <span>{client.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      <a
                        href={
                          client.tenant.subdomain.startsWith("http://") || client.tenant.subdomain.startsWith("https://")
                            ? client.tenant.subdomain
                            : `https://${
                                client.tenant.subdomain.includes(".")
                                  ? client.tenant.subdomain
                                  : `${client.tenant.subdomain}.pms.com`
                              }`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-badge-muted-bg px-2.5 py-1 text-xs font-mono font-semibold text-pawn-gold hover:underline transition-colors"
                        title={`Open https://${client.tenant.subdomain}`}
                      >
                        <span>
                          {client.tenant.subdomain.includes(".")
                            ? client.tenant.subdomain
                            : `${client.tenant.subdomain}.pms.com`}
                        </span>
                        <ExternalLink className="h-3 w-3 text-text-tertiary" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{client.contactName}</td>
                    <td className="px-6 py-4 text-text-tertiary">
                      <p className="text-xs text-text-primary font-medium">{client.contactEmail}</p>
                      {client.contactPhone && (
                        <p className="text-xs text-text-tertiary">{client.contactPhone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedHubClientId(client.id)}
                          className="flex items-center gap-1 rounded-md bg-brand-gold/10 px-2.5 py-1 text-xs font-semibold text-brand-gold hover:bg-brand-gold/20 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Hub
                        </button>
                        <button
                          onClick={() => setEditClient(client)}
                          className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                          title="Edit Info"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteClientTarget(client)}
                          className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CLIENT MODAL */}
      <ClientFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={load}
      />

      {/* EDIT CLIENT MODAL */}
      {editClient && (
        <ClientFormModal
          isOpen={!!editClient}
          onClose={() => setEditClient(null)}
          onSaved={load}
          existing={editClient}
        />
      )}

      {/* CLIENT 360 HUB MODAL */}
      <ClientDetailHubModal
        clientId={selectedHubClientId}
        isOpen={!!selectedHubClientId}
        onClose={() => setSelectedHubClientId(null)}
        onUpdated={load}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteClientTarget && (
        <Modal
          isOpen={!!deleteClientTarget}
          onClose={() => setDeleteClientTarget(null)}
          title={`Delete ${deleteClientTarget.companyName}?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete the client billing record for{" "}
              <strong className="text-text-primary">{deleteClientTarget.companyName}</strong>?
            </p>
            <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
              Warning: Deleting the client record does not automatically delete the underlying tenant, but removes all corporate contact details.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteClientTarget(null)}
                className="rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Client"}
              </button>
            </div>
          </div>
        </Modal>
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
  const [companyName, setCompanyName] = useState(existing?.companyName ?? "");
  const [subdomain, setSubdomain] = useState(existing?.tenant.subdomain ?? "");
  const [contactName, setContactName] = useState(existing?.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(existing?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(existing?.contactPhone ?? "");
  const [billingAddress, setBillingAddress] = useState(existing?.billingAddress ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (existing) {
      setCompanyName(existing.companyName);
      setSubdomain(existing.tenant.subdomain);
      setContactName(existing.contactName);
      setContactEmail(existing.contactEmail);
      setContactPhone(existing.contactPhone ?? "");
      setBillingAddress(existing.billingAddress ?? "");
    } else {
      setCompanyName("");
      setSubdomain("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setBillingAddress("");
    }
  }, [isOpen, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (existing) {
        await api.put(`/clients/tenant/${existing.tenant.id}`, {
          companyName,
          contactName,
          contactEmail,
          contactPhone: contactPhone || undefined,
          billingAddress: billingAddress || undefined,
        });
        toast.success(`Client "${companyName}" updated.`);
      } else {
        await api.post("/clients", {
          companyName,
          subdomain,
          contactName,
          contactEmail,
          contactPhone: contactPhone || undefined,
          billingAddress: billingAddress || undefined,
        });
        toast.success(`Client profile "${companyName}" created.`);
      }
      onClose();
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save client profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? `Edit ${existing.companyName}` : "Add Client Profile"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-secondary">Company Name</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Golden Gate Pawn Inc."
              className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-secondary">Subdomain / Tenant URL</label>
            <input
              required
              disabled={!!existing}
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="goldengate.pms.com"
              className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold disabled:opacity-60 font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Contact Person Name</label>
          <input
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-secondary">Contact Email</label>
            <input
              required
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="jane@goldengatepawn.com"
              className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-secondary">Contact Number / Phone</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Billing Address</label>
          <textarea
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            rows={2}
            placeholder="123 Financial Ave, Suite 400"
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
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
            {isSubmitting ? "Saving..." : "Save Client Profile"}
          </button>
        </div>
      </form>
    </Modal>
  );
}


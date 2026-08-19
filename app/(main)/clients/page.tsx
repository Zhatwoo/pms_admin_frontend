"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { ClientDetailHubModal } from "@/components/ui/client-detail-hub-modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Building2,
  ExternalLink,
  Mail,
  RefreshCw,
  Smartphone,
  Phone,
  Sparkles,
} from "lucide-react";

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  mobileNumber: string | null;
  telephoneNumber: string | null;
  billingAddress: string | null;
  welcomeEmailSentAt: string | null;
  welcomeEmailCount: number;
  tenant: {
    id: string;
    name: string;
    subdomain: string | null;
    status: string;
    _count?: { branches: number; users: number; customers: number };
    subscriptions?: {
      id: string;
      status: string;
      planVersion: { plan: { id: string; name: string } };
    }[];
  };
}

interface SubscriptionPlanOption {
  id: string;
  name: string;
  slug: string;
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
  const [sendingEmailClientId, setSendingEmailClientId] = useState<string | null>(null);

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

  const handleSendWelcomeEmail = async (client: Client) => {
    if (!client.tenant.subdomain) {
      toast.error("Cannot send email: Client has no domain assigned yet. Please edit and set a domain first.");
      return;
    }
    setSendingEmailClientId(client.id);
    try {
      const res = await api.post<{ message: string }>(
        `/clients/${client.id}/send-welcome-email`,
        {}
      );
      toast.success(res.message || "Welcome email sent successfully.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send welcome email");
    } finally {
      setSendingEmailClientId(null);
    }
  };

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
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Company & Plan</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant Subdomain</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Phone Numbers</th>
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
                clients.map((client) => {
                  const planName = client.tenant.subscriptions?.[0]?.planVersion?.plan?.name;
                  return (
                    <tr key={client.id} className="transition-colors hover:bg-surface-hover group">
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-brand-gold" />
                            <span>{client.companyName}</span>
                          </div>
                          {planName ? (
                            <span className="inline-flex items-center gap-1 rounded bg-brand-gold/10 px-2 py-0.5 text-[11px] font-semibold text-brand-gold border border-brand-gold/20">
                              <Sparkles className="h-3 w-3" />
                              {planName}
                            </span>
                          ) : (
                            <span className="inline-block rounded bg-badge-muted-bg px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                              No Plan Assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {client.tenant.subdomain ? (
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
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-400/20">
                            No domain yet
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        <p className="font-semibold text-text-primary">{client.contactName}</p>
                        <p className="text-xs text-text-tertiary">{client.contactEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-text-tertiary">
                        {client.mobileNumber && (
                          <p className="text-xs font-mono text-text-primary flex items-center gap-1">
                            <Smartphone className="h-3 w-3 text-brand-gold" />
                            {client.mobileNumber}
                          </p>
                        )}
                        {client.telephoneNumber && (
                          <p className="text-xs font-mono text-text-secondary flex items-center gap-1">
                            <Phone className="h-3 w-3 text-text-muted" />
                            {client.telephoneNumber}
                          </p>
                        )}
                        {!client.mobileNumber && !client.telephoneNumber && client.contactPhone && (
                          <p className="text-xs font-mono text-text-tertiary">{client.contactPhone}</p>
                        )}
                        {!client.mobileNumber && !client.telephoneNumber && !client.contactPhone && (
                          <span className="text-xs text-text-muted italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {client.tenant.subdomain ? (
                            !client.welcomeEmailSentAt ? (
                              <button
                                onClick={() => handleSendWelcomeEmail(client)}
                                disabled={sendingEmailClientId === client.id}
                                className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors border border-emerald-500/20 disabled:opacity-50"
                                title="Send credentials email"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                {sendingEmailClientId === client.id ? "Sending..." : "Send Email"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendWelcomeEmail(client)}
                                disabled={sendingEmailClientId === client.id}
                                className="flex items-center gap-1 rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/25 transition-colors border border-blue-500/20 disabled:opacity-50"
                                title={`Welcome email sent ${new Date(client.welcomeEmailSentAt).toLocaleString()}`}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                {sendingEmailClientId === client.id ? "Sending..." : "Resend Email"}
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] text-amber-400/80 italic font-medium px-2 py-0.5 rounded bg-amber-400/5">
                              Incomplete Info
                            </span>
                          )}

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
                  );
                })
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
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [noDomain, setNoDomain] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneType, setPhoneType] = useState<"mobile" | "telephone">("mobile");
  const [phoneValue, setPhoneValue] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [planId, setPlanId] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlanOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load available plans
    api
      .get<SubscriptionPlanOption[]>("/subscriptions/plans")
      .then((data) => setPlans(data))
      .catch(() => setPlans([]));

    if (existing) {
      setCompanyName(existing.companyName);
      const sub = existing.tenant.subdomain ?? "";
      setSubdomain(sub);
      setNoDomain(!sub);
      setContactName(existing.contactName);
      setContactEmail(existing.contactEmail);
      if (existing.telephoneNumber && !existing.mobileNumber) {
        setPhoneType("telephone");
        setPhoneValue(existing.telephoneNumber);
      } else {
        setPhoneType("mobile");
        const mob = existing.mobileNumber ?? existing.contactPhone ?? "";
        setPhoneValue(mob ? (mob.startsWith("09") ? mob : "09" + mob.replace(/\D/g, "")) : "09");
      }
      setBillingAddress(existing.billingAddress ?? "");
      setPlanId(existing.tenant.subscriptions?.[0]?.planVersion?.plan?.id ?? "");
    } else {
      setCompanyName("");
      setSubdomain("");
      setNoDomain(false);
      setContactName("");
      setContactEmail("");
      setPhoneType("mobile");
      setPhoneValue("09");
      setBillingAddress("");
      setPlanId("");
    }
  }, [isOpen, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const mobileNumber = phoneType === "mobile" ? phoneValue : undefined;
    const telephoneNumber = phoneType === "telephone" ? phoneValue : undefined;

    try {
      if (existing) {
        await api.put(`/clients/tenant/${existing.tenant.id}`, {
          companyName,
          subdomain: noDomain ? undefined : subdomain,
          noDomain,
          contactName,
          contactEmail,
          mobileNumber: mobileNumber || undefined,
          telephoneNumber: telephoneNumber || undefined,
          billingAddress: billingAddress || undefined,
          planId: planId || undefined,
        });
        toast.success(`Client "${companyName}" updated.`);
      } else {
        await api.post("/clients", {
          companyName,
          subdomain: noDomain ? undefined : subdomain,
          noDomain,
          contactName,
          contactEmail,
          mobileNumber: mobileNumber || undefined,
          telephoneNumber: telephoneNumber || undefined,
          billingAddress: billingAddress || undefined,
          planId: planId || undefined,
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

  const handleMobileInput = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (!digits.startsWith("09")) {
      if (digits.startsWith("9")) {
        digits = "0" + digits;
      } else {
        digits = "09" + digits;
      }
    }
    setPhoneValue(digits.slice(0, 11));
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
            <label className="text-sm font-medium text-text-secondary">Subscription Plan</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
            >
              <option value="">-- Select Plan --</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Subdomain / Tenant URL</label>
          <input
            required={!noDomain}
            disabled={noDomain}
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder={noDomain ? "No domain assigned yet (Admin can edit later)" : "goldengate"}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold disabled:opacity-50 font-mono text-xs"
          />
          <div className="flex items-center">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-brand-gold font-medium select-none">
              <input
                type="checkbox"
                checked={noDomain}
                onChange={(e) => {
                  setNoDomain(e.target.checked);
                  if (e.target.checked) setSubdomain("");
                }}
                className="rounded border-input-border bg-input-bg text-brand-gold focus:ring-brand-gold"
              />
              No domain yet
            </label>
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Contact Number</label>
            <div className="flex items-center gap-4 text-xs font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary select-none">
                <input
                  type="radio"
                  name="phoneType"
                  value="mobile"
                  checked={phoneType === "mobile"}
                  onChange={() => {
                    setPhoneType("mobile");
                    setPhoneValue("09");
                  }}
                  className="accent-brand-gold focus:ring-brand-gold"
                />
                Mobile
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary select-none">
                <input
                  type="radio"
                  name="phoneType"
                  value="telephone"
                  checked={phoneType === "telephone"}
                  onChange={() => {
                    setPhoneType("telephone");
                    setPhoneValue("");
                  }}
                  className="accent-brand-gold focus:ring-brand-gold"
                />
                Telephone
              </label>
            </div>
          </div>

          {phoneType === "mobile" ? (
            <input
              type="tel"
              value={phoneValue}
              onChange={(e) => handleMobileInput(e.target.value)}
              placeholder="09xxxxxxxxx"
              maxLength={11}
              className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold font-mono"
            />
          ) : (
            <input
              type="tel"
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value.slice(0, 15))}
              placeholder=""
              maxLength={15}
              className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold font-mono"
            />
          )}
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


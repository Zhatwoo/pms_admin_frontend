"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  Building2,
  GitBranch,
  Users,
  CreditCard,
  Receipt,
  UserCheck,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";

export interface ClientDetails {
  id: string;
  tenantId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  billingAddress: string | null;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    status: "active" | "suspended" | "pending";
    createdAt: string;
    _count: { branches: number; users: number; customers: number };
    branches: { id: string; name: string; createdAt: string }[];
    users: { id: string; email: string; fullName: string; createdAt: string }[];
    subscriptions: {
      id: string;
      status: string;
      startedAt: string;
      endsAt: string | null;
      plan: { id: string; name: string; priceMonthly: string };
    }[];
    invoices: {
      id: string;
      amount: string;
      status: "paid" | "pending" | "failed";
      periodStart: string;
      periodEnd: string;
      createdAt: string;
      subscription: { plan: { name: string } };
    }[];
  };
}

interface PlanOption {
  id: string;
  name: string;
  priceMonthly: string;
}

export function ClientDetailHubModal({
  clientId,
  isOpen,
  onClose,
  onUpdated,
}: {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "billing" | "branches" | "staff" | "customers"
  >("overview");

  // Modals inside hub
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  const [isCustomInvoiceOpen, setIsCustomInvoiceOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    try {
      const data = await api.get<ClientDetails>(`/clients/${clientId}/details`);
      setDetails(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load client details");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (isOpen && clientId) {
      loadDetails();
      setActiveTab("overview");
    }
  }, [isOpen, clientId, loadDetails]);

  // Load plans when assign modal is triggered
  const loadPlans = async () => {
    try {
      const data = await api.get<PlanOption[]>("/subscriptions/plans");
      setPlans(data);
    } catch {
      setPlans([]);
    }
  };

  if (!isOpen || !clientId) return null;

  const currentSub = details?.tenant.subscriptions[0];

  // Action handlers
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details || !branchName.trim()) return;
    setIsAddingBranch(true);
    try {
      await api.post(`/tenants/${details.tenantId}/branches`, { name: branchName.trim() });
      toast.success(`Branch "${branchName}" added.`);
      setBranchName("");
      setIsAddBranchOpen(false);
      loadDetails();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add branch");
    } finally {
      setIsAddingBranch(false);
    }
  };

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (!details || !confirm(`Delete branch "${branchName}"?`)) return;
    try {
      await api.delete(`/tenants/${details.tenantId}/branches/${branchId}`);
      toast.success(`Branch "${branchName}" removed.`);
      loadDetails();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove branch");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details || !staffEmail || !staffName) return;
    setIsAddingStaff(true);
    try {
      await api.post(`/tenants/${details.tenantId}/users`, {
        email: staffEmail.trim(),
        fullName: staffName.trim(),
      });
      toast.success(`Staff user "${staffName}" added.`);
      setStaffEmail("");
      setStaffName("");
      setIsAddStaffOpen(false);
      loadDetails();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add staff user");
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleDeleteStaff = async (userId: string, userName: string) => {
    if (!details || !confirm(`Remove staff user "${userName}"?`)) return;
    try {
      await api.delete(`/tenants/${details.tenantId}/users/${userId}`);
      toast.success(`Staff user "${userName}" removed.`);
      loadDetails();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove staff user");
    }
  };

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    try {
      await api.patch(`/billing/invoices/${invoiceId}/mark-paid`, {});
      toast.success("Invoice marked as paid.");
      loadDetails();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update invoice");
    }
  };

  const handleCreateCustomInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSub || !invoiceAmount) return;
    setIsSubmittingInvoice(true);
    try {
      await api.post("/billing/invoices", {
        subscriptionId: currentSub.id,
        amount: Number(invoiceAmount),
        status: "pending",
      });
      toast.success("Custom invoice created.");
      setInvoiceAmount("");
      setIsCustomInvoiceOpen(false);
      loadDetails();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create custom invoice");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details || !selectedPlanId) return;
    setIsAssigningPlan(true);
    try {
      await api.post("/subscriptions", {
        tenantId: details.tenantId,
        planId: selectedPlanId,
      });
      toast.success("Subscription assigned.");
      setSelectedPlanId("");
      setIsAssignPlanOpen(false);
      loadDetails();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to assign subscription");
    } finally {
      setIsAssigningPlan(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={details ? `${details.companyName} — Client Hub` : "Client Hub"}
    >
      {isLoading || !details ? (
        <div className="flex h-64 items-center justify-center text-text-muted">
          Loading Client 360 view...
        </div>
      ) : (
        <div className="space-y-5">
          {/* Subdomain & Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-secondary p-4 border border-border-main">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-text-tertiary">
                Tenant Subdomain
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <a
                  href={
                    details.tenant.subdomain.startsWith("http://") || details.tenant.subdomain.startsWith("https://")
                      ? details.tenant.subdomain
                      : `https://${
                          details.tenant.subdomain.includes(".")
                            ? details.tenant.subdomain
                            : `${details.tenant.subdomain}.pms.com`
                        }`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-bold text-pawn-gold hover:underline flex items-center gap-1 transition-colors"
                >
                  <span>
                    {details.tenant.subdomain.includes(".")
                      ? details.tenant.subdomain
                      : `${details.tenant.subdomain}.pms.com`}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 capitalize">
                  {details.tenant.status}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wider font-semibold text-text-tertiary">
                Active Tier
              </p>
              <p className="text-sm font-bold text-text-primary">
                {currentSub ? currentSub.plan.name : "No Active Plan"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border-main space-x-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: Building2 },
              { id: "billing", label: "Subscription & Invoices", icon: Receipt },
              { id: "branches", label: `Branches (${details.tenant.branches.length})`, icon: GitBranch },
              { id: "staff", label: `Staff (${details.tenant.users.length})`, icon: Users },
              { id: "customers", label: `Customers (${details.tenant._count.customers})`, icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-brand-gold text-brand-gold"
                      : "border-transparent text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-main bg-surface p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-text-tertiary">Contact Info</p>
                  <p className="font-semibold text-text-primary">{details.contactName}</p>
                  <p className="text-text-secondary">{details.contactEmail}</p>
                  {details.contactPhone && (
                    <p className="text-xs text-text-tertiary font-mono">{details.contactPhone}</p>
                  )}
                  {details.billingAddress && (
                    <p className="text-xs text-text-tertiary border-t border-border-main pt-2 mt-2">
                      {details.billingAddress}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-border-main bg-surface p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-text-tertiary">Organization Quick Stats</p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="rounded-lg bg-surface-secondary p-2">
                      <p className="text-lg font-bold text-text-primary">{details.tenant.branches.length}</p>
                      <p className="text-[10px] uppercase text-text-tertiary">Branches</p>
                    </div>
                    <div className="rounded-lg bg-surface-secondary p-2">
                      <p className="text-lg font-bold text-text-primary">{details.tenant.users.length}</p>
                      <p className="text-[10px] uppercase text-text-tertiary">Users</p>
                    </div>
                    <div className="rounded-lg bg-surface-secondary p-2">
                      <p className="text-lg font-bold text-text-primary">{details.tenant._count.customers}</p>
                      <p className="text-[10px] uppercase text-text-tertiary">Customers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION & INVOICES */}
          {activeTab === "billing" && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-gold" />
                  <h4 className="font-bold text-text-primary">Subscription Plan</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      loadPlans();
                      setIsAssignPlanOpen(true);
                    }}
                    className="rounded-lg bg-surface-secondary border border-border-main px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-hover"
                  >
                    Change / Assign Plan
                  </button>
                  {currentSub && (
                    <button
                      onClick={() => setIsCustomInvoiceOpen(true)}
                      className="rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-opacity hover:opacity-90"
                    >
                      + Create Custom Invoice
                    </button>
                  )}
                </div>
              </div>

              {currentSub ? (
                <div className="rounded-xl border border-border-main bg-surface p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-text-primary">{currentSub.plan.name}</p>
                    <p className="text-xs text-text-tertiary">
                      Started: {new Date(currentSub.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-text-primary">
                    ${Number(currentSub.plan.priceMonthly).toLocaleString()}
                    <span className="text-xs font-normal text-text-tertiary">/mo</span>
                  </p>
                </div>
              ) : (
                <p className="text-text-muted text-xs py-4 text-center">No active plan assigned yet.</p>
              )}

              <h4 className="font-bold text-text-primary pt-2">Billing Invoices</h4>
              <div className="overflow-hidden rounded-xl border border-border-main bg-surface">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-secondary text-text-secondary">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {!details.tenant.invoices.length ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-text-muted">
                          No invoices generated yet.
                        </td>
                      </tr>
                    ) : (
                      details.tenant.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-surface-hover">
                          <td className="p-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold">${Number(inv.amount).toFixed(2)}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                inv.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : inv.status === "pending"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-rose-500/10 text-rose-500"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {inv.status === "pending" && (
                              <button
                                onClick={() => handleMarkInvoicePaid(inv.id)}
                                className="font-semibold text-pawn-gold hover:underline"
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
          )}

          {/* TAB 3: BRANCHES */}
          {activeTab === "branches" && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-primary">Physical Branch Locations</h4>
                <button
                  onClick={() => setIsAddBranchOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Branch
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-border-main bg-surface">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-secondary text-text-secondary">
                    <tr>
                      <th className="p-3">Branch Name</th>
                      <th className="p-3">Created Date</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {!details.tenant.branches.length ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-text-muted">
                          No branches created for this client yet.
                        </td>
                      </tr>
                    ) : (
                      details.tenant.branches.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-hover">
                          <td className="p-3 font-semibold text-text-primary">{b.name}</td>
                          <td className="p-3 text-text-tertiary">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteBranch(b.id, b.name)}
                              className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TENANT STAFF */}
          {activeTab === "staff" && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-primary">Tenant Staff Users</h4>
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" /> Invite Staff User
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-border-main bg-surface">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-secondary text-text-secondary">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Added</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {!details.tenant.users.length ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-text-muted">
                          No staff users created yet.
                        </td>
                      </tr>
                    ) : (
                      details.tenant.users.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-hover">
                          <td className="p-3 font-semibold text-text-primary">{u.fullName}</td>
                          <td className="p-3 text-text-secondary">{u.email}</td>
                          <td className="p-3 text-text-tertiary">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteStaff(u.id, u.fullName)}
                              className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS & ACTIVITY */}
          {activeTab === "customers" && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-primary">Tenant Customers Summary</h4>
                <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold">
                  {details.tenant._count.customers} Registered Customers
                </span>
              </div>
              <p className="text-xs text-text-tertiary">
                Customers registered directly by this client in their shop environment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* INNER MODAL: ADD BRANCH */}
      {isAddBranchOpen && (
        <Modal
          isOpen={isAddBranchOpen}
          onClose={() => setIsAddBranchOpen(false)}
          title="Add Branch Location"
        >
          <form onSubmit={handleAddBranch} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Branch Name</label>
              <input
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Downtown Branch"
                className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddBranchOpen(false)}
                className="rounded-lg border border-border-main px-4 py-2 text-sm font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingBranch}
                className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 hover:opacity-90 disabled:opacity-50"
              >
                {isAddingBranch ? "Adding..." : "Add Branch"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* INNER MODAL: ADD STAFF */}
      {isAddStaffOpen && (
        <Modal
          isOpen={isAddStaffOpen}
          onClose={() => setIsAddStaffOpen(false)}
          title="Invite Tenant Staff User"
        >
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Full Name</label>
              <input
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Email Address</label>
              <input
                required
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="john@clientcompany.com"
                className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                className="rounded-lg border border-border-main px-4 py-2 text-sm font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingStaff}
                className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 hover:opacity-90 disabled:opacity-50"
              >
                {isAddingStaff ? "Inviting..." : "Invite Staff"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* INNER MODAL: CUSTOM INVOICE */}
      {isCustomInvoiceOpen && (
        <Modal
          isOpen={isCustomInvoiceOpen}
          onClose={() => setIsCustomInvoiceOpen(false)}
          title="Create Custom Invoice"
        >
          <form onSubmit={handleCreateCustomInvoice} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Invoice Amount ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="250.00"
                className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomInvoiceOpen(false)}
                className="rounded-lg border border-border-main px-4 py-2 text-sm font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingInvoice}
                className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 hover:opacity-90 disabled:opacity-50"
              >
                {isSubmittingInvoice ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* INNER MODAL: ASSIGN PLAN */}
      {isAssignPlanOpen && (
        <Modal
          isOpen={isAssignPlanOpen}
          onClose={() => setIsAssignPlanOpen(false)}
          title="Assign Subscription Plan"
        >
          <form onSubmit={handleAssignPlan} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Select Plan</label>
              <select
                required
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none"
              >
                <option value="">Choose a plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${Number(p.priceMonthly).toFixed(2)}/mo
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAssignPlanOpen(false)}
                className="rounded-lg border border-border-main px-4 py-2 text-sm font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAssigningPlan}
                className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 hover:opacity-90 disabled:opacity-50"
              >
                {isAssigningPlan ? "Assigning..." : "Assign Plan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Modal>
  );
}

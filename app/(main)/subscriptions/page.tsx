"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Edit2, Trash2 } from "lucide-react";

type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

interface Plan {
  id: string;
  name: string;
  priceMonthly: string;
}

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  startedAt: string;
  endsAt: string | null;
  tenant: { id: string; name: string; subdomain: string };
  plan: Plan;
}

interface TenantOption {
  id: string;
  name: string;
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-surface text-emerald-text border border-emerald-border",
  trialing: "bg-sky-500/10 text-sky-500 border border-sky-500/30",
  past_due: "bg-amber-500/10 text-amber-600 border border-amber-500/30",
  canceled: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30",
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editPlanTarget, setEditPlanTarget] = useState<Plan | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subs, planList] = await Promise.all([
        api.get<Subscription[]>("/subscriptions"),
        api.get<Plan[]>("/subscriptions/plans"),
      ]);
      setSubscriptions(subs);
      setPlans(planList);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load subscriptions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeletePlan = async (plan: Plan) => {
    if (!confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await api.delete(`/subscriptions/plans/${plan.id}`);
      toast.success(`Plan "${plan.name}" deleted.`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete plan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Subscriptions & Plans"
          description="Manage active tenant subscriptions and monthly pricing tiers."
        />
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="whitespace-nowrap rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
          >
            + New Plan
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            + Assign Subscription
          </button>
        </div>
      </div>

      {plans.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-border-main bg-surface p-5 shadow-sm relative group">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-text-primary">{plan.name}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditPlanTarget(plan)}
                    className="p-1 text-text-tertiary hover:text-text-primary"
                    title="Edit Plan"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="p-1 text-rose-400 hover:text-rose-600"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                ${Number(plan.priceMonthly).toLocaleString()}
                <span className="text-sm font-normal text-text-tertiary">/mo</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Started</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    No subscriptions yet.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-surface-hover group">
                    <td className="px-6 py-4 font-medium">{sub.tenant.name}</td>
                    <td className="px-6 py-4 text-text-secondary">{sub.plan.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[sub.status]}`}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-tertiary">
                      {new Date(sub.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditSubscription(sub)}
                        className="text-sm font-medium text-pawn-gold hover:text-pawn-gold-light opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onCreated={load}
      />

      {editPlanTarget && (
        <EditPlanModal
          plan={editPlanTarget}
          onClose={() => setEditPlanTarget(null)}
          onUpdated={load}
        />
      )}

      <AssignSubscriptionModal
        isOpen={isAssignModalOpen}
        plans={plans}
        onClose={() => setIsAssignModalOpen(false)}
        onCreated={load}
      />

      <UpdateSubscriptionModal
        subscription={editSubscription}
        onClose={() => setEditSubscription(null)}
        onUpdated={load}
      />
    </div>
  );
}

function NewPlanModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/subscriptions/plans", {
        name,
        priceMonthly: Number(priceMonthly),
      });
      toast.success(`Plan "${name}" created.`);
      setName("");
      setPriceMonthly("");
      onClose();
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Subscription Plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Plan Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enterprise"
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Monthly Price (USD)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(e.target.value)}
            placeholder="499.00"
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
            {isSubmitting ? "Creating..." : "Create Plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AssignSubscriptionModal({
  isOpen,
  plans,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  plans: Plan[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [planId, setPlanId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api
      .get<{ data: TenantOption[] }>("/tenants?limit=100")
      .then((res) => setTenants(res.data))
      .catch(() => setTenants([]));
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !planId) return;
    setIsSubmitting(true);
    try {
      await api.post("/subscriptions", { tenantId, planId });
      toast.success("Subscription assigned.");
      setTenantId("");
      setPlanId("");
      onClose();
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to assign subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Subscription">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Plan</label>
          <select
            required
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="">Select a plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ${Number(p.priceMonthly).toLocaleString()}/mo
              </option>
            ))}
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
            {isSubmitting ? "Assigning..." : "Assign"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UpdateSubscriptionModal({
  subscription,
  onClose,
  onUpdated,
}: {
  subscription: Subscription | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) setStatus(subscription.status);
  }, [subscription]);

  if (!subscription) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch(`/subscriptions/${subscription.id}`, { status });
      toast.success("Subscription updated.");
      onClose();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!subscription} onClose={onClose} title={`${subscription.tenant.name} — ${subscription.plan.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="trialing">Trialing</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
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
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditPlanModal({
  plan,
  onClose,
  onUpdated,
}: {
  plan: Plan | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPriceMonthly(String(plan.priceMonthly));
    }
  }, [plan]);

  if (!plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/subscriptions/plans/${plan.id}`, {
        name,
        priceMonthly: Number(priceMonthly),
      });
      toast.success(`Plan "${name}" updated.`);
      onClose();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!plan} onClose={onClose} title={`Edit Plan: ${plan.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Plan Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Monthly Price (USD)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(e.target.value)}
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
            {isSubmitting ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

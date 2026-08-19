"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export function AssignSubscriptionModal({
  isOpen,
  plans,
  onClose,
  onAssigned,
}: {
  isOpen: boolean;
  plans: { id: string; name: string }[];
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [planId, setPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [autoRenew, setAutoRenew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api
      .get<{ data: { id: string; name: string }[] }>("/tenants?limit=100")
      .then((res) => setTenants(res.data))
      .catch(() => setTenants([]));
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !planId) return;
    setIsSubmitting(true);
    try {
      await api.post("/subscriptions", {
        tenantId,
        planId,
        billingCycle,
        autoRenew,
      });
      toast.success("Subscription assigned successfully.");
      setTenantId("");
      setPlanId("");
      onClose();
      onAssigned();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to assign subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Subscription to Tenant">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-xs font-semibold text-text-secondary">Tenant</label>
          <select
            required
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-xs text-text-primary outline-none"
          >
            <option value="">Select a tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-secondary">Plan</label>
          <select
            required
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-xs text-text-primary outline-none"
          >
            <option value="">Select a subscription plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-text-secondary">Billing Cycle</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as any)}
              className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-xs text-text-primary outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="rounded accent-sky-500"
              />
              <span>Auto Renew</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-main px-4 py-2 font-semibold text-text-secondary hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-sky-500 px-4 py-2 font-bold text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Assigning..." : "Assign Subscription"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

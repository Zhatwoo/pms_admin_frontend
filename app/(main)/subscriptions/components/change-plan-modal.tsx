"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export function ChangePlanModal({
  subscriptionId,
  plans,
  onClose,
  onChanged,
}: {
  subscriptionId: string | null;
  plans: { id: string; name: string }[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [newPlanId, setNewPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscriptionId) {
      setNewPlanId("");
      setNotes("");
    }
  }, [subscriptionId]);

  if (!subscriptionId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanId) return toast.error("Please select a target plan");

    setIsSubmitting(true);
    try {
      await api.post(`/subscriptions/${subscriptionId}/change-plan`, {
        newPlanId,
        billingCycle,
        notes: notes.trim() || undefined,
      });
      toast.success("Subscription plan updated (upgrade/downgrade recorded in history).");
      onClose();
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to change plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!subscriptionId} onClose={onClose} title="Upgrade / Downgrade Plan">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-xs font-semibold text-text-secondary">Target Plan</label>
          <select
            required
            value={newPlanId}
            onChange={(e) => setNewPlanId(e.target.value)}
            className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-xs text-text-primary outline-none"
          >
            <option value="">Select target plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

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

        <div>
          <label className="text-xs font-semibold text-text-secondary">Audit Notes (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Customer requested upgrade for 3 additional branches"
            className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-xs text-text-primary outline-none resize-none"
          />
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
            {isSubmitting ? "Changing Plan..." : "Confirm Plan Change"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { SubscriptionsTab, SubscriptionRow } from "./components/subscriptions-tab";
import { PlansTab } from "./components/plans-tab";
import { PlanBuilderModal, PlanDetailData } from "./components/plan-builder-modal";
import { SubscriptionDrawer } from "./components/subscription-drawer";
import { AssignSubscriptionModal } from "./components/assign-subscription-modal";
import { ChangePlanModal } from "./components/change-plan-modal";

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "plans">("subscriptions");

  // Subscriptions Tab Data
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cycleFilter, setCycleFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [trialOnly, setTrialOnly] = useState(false);
  const [expiringSoon, setExpiringSoon] = useState(false);

  // Plans Tab Data
  const [plans, setPlans] = useState<PlanDetailData[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Modals & Drawers State
  const [isPlanBuilderOpen, setIsPlanBuilderOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanDetailData | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSubIdForDrawer, setSelectedSubIdForDrawer] = useState<string | null>(null);
  const [selectedSubIdForUpgrade, setSelectedSubIdForUpgrade] = useState<string | null>(null);

  // Fetch Subscriptions List
  const loadSubscriptions = useCallback(async () => {
    setIsLoadingSubs(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (cycleFilter) params.set("billingCycle", cycleFilter);
      if (planFilter) params.set("planId", planFilter);
      if (trialOnly) params.set("trialOnly", "true");
      if (expiringSoon) params.set("expiringSoon", "true");
      params.set("limit", "50");

      const res = await api.get<{ data: SubscriptionRow[] }>(`/subscriptions?${params.toString()}`);
      setSubscriptions(res.data || []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load subscriptions");
    } finally {
      setIsLoadingSubs(false);
    }
  }, [search, statusFilter, cycleFilter, planFilter, trialOnly, expiringSoon]);

  // Fetch Plans List
  const loadPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    try {
      const res = await api.get<PlanDetailData[]>("/subscriptions/plans?includeArchived=true");
      setPlans(res);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load subscription plans");
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadSubscriptions();
    loadPlans();
  }, [loadSubscriptions, loadPlans]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Subscription & Plans Management"
        description="Track active subscribers, configure versioned plans, limits, features, and landing page pricing."
      />

      {/* Main Tabs Header */}
      <div className="border-b border-border-main bg-surface rounded-t-xl px-4 flex gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`py-3.5 border-b-2 transition-all ${
            activeTab === "subscriptions"
              ? "border-sky-500 text-sky-500"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          Subscriptions
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`py-3.5 border-b-2 transition-all ${
            activeTab === "plans"
              ? "border-sky-500 text-sky-500"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          Plans & Tiers
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "subscriptions" ? (
        <SubscriptionsTab
          subscriptions={subscriptions}
          isLoading={isLoadingSubs}
          plans={plans.map((p) => ({ id: p.id || "", name: p.name }))}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          cycleFilter={cycleFilter}
          setCycleFilter={setCycleFilter}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          trialOnly={trialOnly}
          setTrialOnly={setTrialOnly}
          expiringSoon={expiringSoon}
          setExpiringSoon={setExpiringSoon}
          onSelectSubscription={(id) => setSelectedSubIdForDrawer(id)}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
          onOpenUpgradeModal={(id) => setSelectedSubIdForUpgrade(id)}
          onRefresh={refreshAll}
        />
      ) : (
        <PlansTab
          plans={plans}
          onEditPlan={(p) => {
            setEditingPlan(p);
            setIsPlanBuilderOpen(true);
          }}
          onCreatePlan={() => {
            setEditingPlan(null);
            setIsPlanBuilderOpen(true);
          }}
          onRefresh={refreshAll}
        />
      )}

      {/* Plan Builder Modal */}
      <PlanBuilderModal
        isOpen={isPlanBuilderOpen}
        plan={editingPlan}
        onClose={() => setIsPlanBuilderOpen(false)}
        onSaved={refreshAll}
      />

      {/* Right Drawer for Subscription Details */}
      <SubscriptionDrawer
        subscriptionId={selectedSubIdForDrawer}
        onClose={() => setSelectedSubIdForDrawer(null)}
        onActionComplete={refreshAll}
        onOpenUpgradeModal={(id) => {
          setSelectedSubIdForDrawer(null);
          setSelectedSubIdForUpgrade(id);
        }}
      />

      {/* Assign Subscription Modal */}
      <AssignSubscriptionModal
        isOpen={isAssignModalOpen}
        plans={plans.map((p) => ({ id: p.id || "", name: p.name }))}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={refreshAll}
      />

      {/* Change Plan (Upgrade/Downgrade) Modal */}
      <ChangePlanModal
        subscriptionId={selectedSubIdForUpgrade}
        plans={plans.map((p) => ({ id: p.id || "", name: p.name }))}
        onClose={() => setSelectedSubIdForUpgrade(null)}
        onChanged={refreshAll}
      />
    </div>
  );
}

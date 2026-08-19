"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { PlanCardPreview, PlanPreviewData } from "./plan-card-preview";

export interface PlanDetailData {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  badge?: string;
  icon?: string;
  themeColor?: string;
  displayOrder?: number;
  visibleOnLanding?: boolean;
  isDefault?: boolean;
  isPopular?: boolean;
  activeVersion?: {
    versionNumber?: number;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    billingType: "monthly" | "annual" | "both";
    trialEnabled: boolean;
    trialDays: number;
    limits: {
      branchLimit: number;
      userLimit: number;
      storageGb: number;
      dailyTransactions?: number;
      apiRequests?: number;
      smsCredits?: number;
      backupRetentionDays?: number;
    };
    features: { name: string; enabled?: boolean; displayOrder?: number }[];
    inclusions: { name: string; displayOrder?: number }[];
    addons: { name: string; price: number; unit?: string; enabled?: boolean }[];
  };
}

export function PlanBuilderModal({
  isOpen,
  plan,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  plan: PlanDetailData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [activeSection, setActiveSection] = useState<string>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibleOnLanding, setVisibleOnLanding] = useState(true);

  // Pricing State
  const [monthlyPrice, setMonthlyPrice] = useState("2999");
  const [annualPrice, setAnnualPrice] = useState("29990");
  const [currency, setCurrency] = useState("PHP");
  const [trialEnabled, setTrialEnabled] = useState(false);
  const [trialDays, setTrialDays] = useState(7);

  // Limits State
  const [branchLimit, setBranchLimit] = useState(5);
  const [userLimit, setUserLimit] = useState(50);
  const [storageGb, setStorageGb] = useState(5);

  // Features, Inclusions, Addons State
  const [features, setFeatures] = useState<{ name: string; enabled: boolean }[]>([
    { name: "Inventory", enabled: true },
    { name: "Pawn Tickets", enabled: true },
    { name: "Reports", enabled: true },
    { name: "SMS Notifications", enabled: true },
  ]);

  const [inclusions, setInclusions] = useState<{ name: string }[]>([
    { name: "30 Days Training" },
    { name: "Free Setup" },
  ]);

  const [addons, setAddons] = useState<{ name: string; price: number; unit: string; enabled: boolean }[]>([
    { name: "Additional Branch", price: 500, unit: "/mo", enabled: true },
    { name: "Additional Storage", price: 200, unit: "per GB", enabled: true },
  ]);

  // Temporary Inputs
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newInclusionName, setNewInclusionName] = useState("");
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");
  const [newAddonUnit, setNewAddonUnit] = useState("");

  useEffect(() => {
    if (plan) {
      setName(plan.name || "");
      setSlug(plan.slug || "");
      setDescription(plan.description || "");
      setVisibleOnLanding(plan.visibleOnLanding ?? true);

      const ver = plan.activeVersion;
      if (ver) {
        setMonthlyPrice(String(ver.monthlyPrice ?? 0));
        setAnnualPrice(String(ver.annualPrice ?? 0));
        setCurrency(ver.currency || "PHP");
        setTrialEnabled(ver.trialEnabled ?? false);
        setTrialDays(ver.trialDays ?? 7);

        setBranchLimit(ver.limits?.branchLimit ?? 5);
        setUserLimit(ver.limits?.userLimit ?? 50);
        setStorageGb(ver.limits?.storageGb ?? 5);

        setFeatures(ver.features?.map((f) => ({ name: f.name, enabled: f.enabled ?? true })) || []);
        setInclusions(ver.inclusions?.map((i) => ({ name: i.name })) || []);
        setAddons(
          ver.addons?.map((a) => ({
            name: a.name,
            price: Number(a.price),
            unit: a.unit || "",
            enabled: a.enabled ?? true,
          })) || []
        );
      }
    } else {
      // Reset defaults for creation
      setName("");
      setSlug("");
      setDescription("");
      setVisibleOnLanding(true);
      setMonthlyPrice("2999");
      setAnnualPrice("29990");
      setCurrency("PHP");
      setTrialEnabled(false);
      setTrialDays(7);
      setBranchLimit(5);
      setUserLimit(50);
      setStorageGb(5);
      setFeatures([
        { name: "Inventory", enabled: true },
        { name: "Pawn Tickets", enabled: true },
        { name: "Reports", enabled: true },
        { name: "SMS Notifications", enabled: true },
      ]);
      setInclusions([{ name: "30 Days Support" }]);
      setAddons([{ name: "Additional Branch", price: 500, unit: "/mo", enabled: true }]);
    }
  }, [plan, isOpen]);

  const mPrice = Number(monthlyPrice) || 0;
  const aPrice = Number(annualPrice) || 0;
  const computedBillingType: "monthly" | "annual" | "both" =
    mPrice > 0 && aPrice > 0 ? "both" : aPrice > 0 ? "annual" : "monthly";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Plan name is required");

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        visibleOnLanding,
        monthlyPrice: mPrice,
        annualPrice: aPrice,
        currency,
        billingType: computedBillingType,
        trialEnabled,
        trialDays: Number(trialDays),
        branchLimit: Number(branchLimit),
        userLimit: Number(userLimit),
        storageGb: Number(storageGb),
        features: features.map((f, i) => ({ name: f.name, enabled: f.enabled, displayOrder: i })),
        inclusions: inclusions.map((inc, i) => ({ name: inc.name, displayOrder: i })),
        addons: addons.map((add, i) => ({
          name: add.name,
          price: Number(add.price),
          unit: add.unit || undefined,
          enabled: add.enabled,
          displayOrder: i,
        })),
      };

      if (plan?.id) {
        await api.put(`/subscriptions/plans/${plan.id}`, payload);
        toast.success(`Plan "${name}" updated (new version created if pricing changed).`);
      } else {
        await api.post("/subscriptions/plans", payload);
        toast.success(`Plan "${name}" created.`);
      }

      onClose();
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewData: PlanPreviewData = {
    name: name || "New Plan",
    monthlyPrice: mPrice,
    annualPrice: aPrice,
    currency,
    billingType: computedBillingType,
    isPopular: plan?.isPopular ?? false,
    branchLimit: Number(branchLimit) || 1,
    userLimit: Number(userLimit) || 1,
    storageGb: Number(storageGb) || 1,
    features,
    inclusions,
    addons,
  };

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    pricing: true,
    limits: true,
    features: false,
    inclusions: false,
    addons: false,
  });

  const toggleSection = (s: string) => {
    setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? `Plan Builder — ${plan.name}` : "Plan Builder — Create New Plan"}
      maxWidth="5xl"
    >
      <div className="flex flex-col lg:flex-row items-start gap-6 max-h-[75vh] overflow-hidden">
        {/* Left: Accordion Builder Form */}
        <form onSubmit={handleSubmit} className="flex-1 w-full max-h-[72vh] overflow-y-auto pr-1 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Section: General */}
          <div className="rounded-xl border border-border-main bg-surface overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("general")}
              className="w-full px-4 py-3 bg-surface-secondary flex justify-between items-center font-semibold text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>General Info</span>
              <ChevronDown
                className={`h-4 w-4 text-text-tertiary transition-transform duration-300 ${
                  openSections.general ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openSections.general ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Plan Name *</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Business"
                      className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none focus:border-pawn-gold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Description</label>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Best for growing pawnshops..."
                      className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none focus:border-pawn-gold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Pricing */}
          <div className="rounded-xl border border-border-main bg-surface overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("pricing")}
              className="w-full px-4 py-3 bg-surface-secondary flex justify-between items-center font-semibold text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>Pricing & Trial</span>
              <ChevronDown
                className={`h-4 w-4 text-text-tertiary transition-transform duration-300 ${
                  openSections.pricing ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openSections.pricing ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Monthly Price (₱)</label>
                      <input
                        type="number"
                        min="0"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        placeholder="0 if Annual only"
                        className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none focus:border-pawn-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Annual Price (₱)</label>
                      <input
                        type="number"
                        min="0"
                        value={annualPrice}
                        onChange={(e) => setAnnualPrice(e.target.value)}
                        placeholder="0 if Monthly only"
                        className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none focus:border-pawn-gold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-border-main">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={trialEnabled}
                        onChange={(e) => setTrialEnabled(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                      <span>Enable Free Trial</span>
                    </label>

                    {trialEnabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">Trial Days:</span>
                        <input
                          type="number"
                          min="1"
                          value={trialDays}
                          onChange={(e) => setTrialDays(Number(e.target.value))}
                          className="w-20 rounded border border-input-border px-2 py-1 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Limits */}
          <div className="rounded-xl border border-border-main bg-surface overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("limits")}
              className="w-full px-4 py-3 bg-surface-secondary flex justify-between items-center font-semibold text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>Usage Limits</span>
              <ChevronDown
                className={`h-4 w-4 text-text-tertiary transition-transform duration-300 ${
                  openSections.limits ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openSections.limits ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Branch Limit</label>
                      <input
                        type="number"
                        min="1"
                        value={branchLimit}
                        onChange={(e) => setBranchLimit(Number(e.target.value))}
                        className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">User Limit</label>
                      <input
                        type="number"
                        min="1"
                        value={userLimit}
                        onChange={(e) => setUserLimit(Number(e.target.value))}
                        className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Storage (GB)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={storageGb}
                        onChange={(e) => setStorageGb(Number(e.target.value))}
                        className="w-full mt-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Features */}
          <div className="rounded-xl border border-border-main bg-surface overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("features")}
              className="w-full px-4 py-3 bg-surface-secondary flex justify-between items-center font-semibold text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>Dynamic Features ({features.length})</span>
              <ChevronDown
                className={`h-4 w-4 text-text-tertiary transition-transform duration-300 ${
                  openSections.features ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openSections.features ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newFeatureName}
                      onChange={(e) => setNewFeatureName(e.target.value)}
                      placeholder="Add feature e.g. Pawn Tickets"
                      className="flex-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newFeatureName.trim()) return;
                        setFeatures([...features, { name: newFeatureName.trim(), enabled: true }]);
                        setNewFeatureName("");
                      }}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-zinc-950"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {features.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-surface-secondary px-3 py-1.5 rounded-md text-xs">
                        <span className="font-medium">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={f.enabled}
                              onChange={(e) => {
                                const updated = [...features];
                                updated[idx].enabled = e.target.checked;
                                setFeatures(updated);
                              }}
                              className="rounded accent-emerald-500"
                            />
                            <span>Enabled</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Included Services */}
          <div className="rounded-xl border border-border-main bg-surface overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("inclusions")}
              className="w-full px-4 py-3 bg-surface-secondary flex justify-between items-center font-semibold text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>Included Services ({inclusions.length})</span>
              <ChevronDown
                className={`h-4 w-4 text-text-tertiary transition-transform duration-300 ${
                  openSections.inclusions ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openSections.inclusions ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newInclusionName}
                      onChange={(e) => setNewInclusionName(e.target.value)}
                      placeholder="e.g. 30 Days Tech Support"
                      className="flex-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newInclusionName.trim()) return;
                        setInclusions([...inclusions, { name: newInclusionName.trim() }]);
                        setNewInclusionName("");
                      }}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-zinc-950"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {inclusions.map((inc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-surface-secondary px-3 py-1.5 rounded-md text-xs">
                        <span>{inc.name}</span>
                        <button
                          type="button"
                          onClick={() => setInclusions(inclusions.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Add-ons */}
          <div className="rounded-xl border border-border-main bg-surface overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleSection("addons")}
              className="w-full px-4 py-3 bg-surface-secondary flex justify-between items-center font-semibold text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span>Add-ons ({addons.length})</span>
              <ChevronDown
                className={`h-4 w-4 text-text-tertiary transition-transform duration-300 ${
                  openSections.addons ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openSections.addons ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      value={newAddonName}
                      onChange={(e) => setNewAddonName(e.target.value)}
                      placeholder="Name e.g. Additional Branch"
                      className="rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="number"
                      value={newAddonPrice}
                      onChange={(e) => setNewAddonPrice(e.target.value)}
                      placeholder="Price (₱)"
                      className="rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-xs outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        value={newAddonUnit}
                        onChange={(e) => setNewAddonUnit(e.target.value)}
                        placeholder="Unit e.g. /mo"
                        className="flex-1 rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAddonName.trim() || !newAddonPrice) return;
                          setAddons([
                            ...addons,
                            {
                              name: newAddonName.trim(),
                              price: Number(newAddonPrice),
                              unit: newAddonUnit.trim(),
                              enabled: true,
                            },
                          ]);
                          setNewAddonName("");
                          setNewAddonPrice("");
                          setNewAddonUnit("");
                        }}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-zinc-950"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {addons.map((add, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-surface-secondary px-3 py-1.5 rounded-md text-xs">
                        <span>
                          {add.name} — ₱{add.price} {add.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAddons(addons.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Visibility */}
          <div className="rounded-xl border border-border-main bg-surface p-4 space-y-2 text-xs">
            <p className="font-bold text-text-primary uppercase tracking-wider mb-2">Visibility Settings</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleOnLanding}
                  onChange={(e) => setVisibleOnLanding(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span>Show on Landing Page</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-main px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-sky-500 px-5 py-2 text-xs font-bold text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : plan ? "Save Plan Changes" : "Create Plan"}
            </button>
          </div>
        </form>

        {/* Right: Live Preview Card */}
        <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border-main pt-4 lg:pt-0 lg:pl-6 flex flex-col items-center self-start sticky top-0">
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 text-center">
            Live Card Preview (Landing Page)
          </p>
          <PlanCardPreview plan={previewData} />
        </div>
      </div>
    </Modal>
  );
}

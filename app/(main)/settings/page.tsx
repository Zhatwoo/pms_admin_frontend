"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  enforce2FA: boolean;
  dataResidency: string;
  taxRate?: number;
  currencySymbol?: string;
  invoiceHeaderNotes?: string;
  defaultTrialDays?: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<PlatformSettings>("/settings");
        setSettings(data);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const updated = await api.patch<PlatformSettings>("/settings", settings);
      setSettings(updated);
      toast.success("Platform settings saved successfully.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 max-w-4xl">
        <PageHeader title="System Settings" description="Global configuration for the SaaS environment." />
        <div className="rounded-xl border border-border-main bg-surface p-6 shadow-sm min-h-[200px] flex items-center justify-center">
          <p className="text-text-muted">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings"
        description="Global configuration for the SaaS environment."
      />

      <div className="space-y-6">
        <div className="rounded-xl border border-border-main bg-surface shadow-sm">
          <div className="border-b border-border-main p-6">
            <h3 className="text-lg font-medium text-text-primary">Global Environment</h3>
            <p className="mt-1 text-sm text-text-tertiary">Configure instance-wide parameters.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Platform Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full max-w-md rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full max-w-md rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>
          </div>
        </div>

        {/* BILLING & FINANCIAL SETTINGS */}
        <div className="rounded-xl border border-border-main bg-surface shadow-sm">
          <div className="border-b border-border-main p-6">
            <h3 className="text-lg font-medium text-text-primary">Billing & Invoicing Configuration</h3>
            <p className="mt-1 text-sm text-text-tertiary">Manage invoice taxes, currency, and default trial periods.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-text-secondary">Default Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.taxRate ?? 12}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-text-secondary">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currencySymbol ?? "$"}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
                />
              </div>
            </div>

            <div className="grid gap-2 max-w-md">
              <label className="text-sm font-medium text-text-secondary">Default Trial Duration (Days)</label>
              <input
                type="number"
                min="0"
                value={settings.defaultTrialDays ?? 14}
                onChange={(e) => setSettings({ ...settings, defaultTrialDays: Number(e.target.value) })}
                className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>

            <div className="grid gap-2 max-w-md">
              <label className="text-sm font-medium text-text-secondary">Invoice Header Notes</label>
              <textarea
                rows={2}
                value={settings.invoiceHeaderNotes ?? ""}
                onChange={(e) => setSettings({ ...settings, invoiceHeaderNotes: e.target.value })}
                className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-main bg-surface shadow-sm">
          <div className="border-b border-border-main p-6">
            <h3 className="text-lg font-medium text-text-primary">Security & Compliance</h3>
            <p className="mt-1 text-sm text-text-tertiary">Manage global security policies for all tenants.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between max-w-md">
              <div>
                <p className="text-sm font-medium text-text-secondary">Enforce 2FA</p>
                <p className="text-xs text-text-tertiary">Require two-factor authentication for all platform admins.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, enforce2FA: !settings.enforce2FA })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                  settings.enforce2FA ? "bg-brand-gold" : "bg-badge-muted-bg"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enforce2FA ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between max-w-md pt-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">Data Residency</p>
                <p className="text-xs text-text-tertiary">Default region for new tenant provisioning.</p>
              </div>
              <select
                value={settings.dataResidency}
                onChange={(e) => setSettings({ ...settings, dataResidency: e.target.value })}
                className="rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm text-text-primary outline-none"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-frankfurt-1">EU (Frankfurt)</option>
              </select>
            </div>
          </div>
          <div className="border-t border-border-main p-4 bg-surface-secondary flex justify-end rounded-b-xl">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


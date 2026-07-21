"use client";

import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
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
                defaultValue="PMS SaaS Platform"
                className="w-full max-w-md rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">Support Email</label>
              <input
                type="email"
                defaultValue="support@pms-saas.com"
                className="w-full max-w-md rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
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
              <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-brand-gold transition-colors">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
              </div>
            </div>
            
            <div className="flex items-center justify-between max-w-md pt-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">Data Residency</p>
                <p className="text-xs text-text-tertiary">Default region for new tenant provisioning.</p>
              </div>
              <select className="rounded-lg border border-input-border bg-input-bg px-3 py-1.5 text-sm text-text-primary outline-none">
                <option>US East (N. Virginia)</option>
                <option>US West (Oregon)</option>
                <option>EU (Frankfurt)</option>
              </select>
            </div>
          </div>
          <div className="border-t border-border-main p-4 bg-surface-secondary flex justify-end rounded-b-xl">
             <button className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]">
               Save Settings
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

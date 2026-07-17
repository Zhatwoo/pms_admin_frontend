"use client";

// ═══════════════════════════════════════════════════════════
// Settings Page
// ═══════════════════════════════════════════════════════════

import { PageHeader } from "../_components/common/page-header";
import { SectionHeader } from "../_components/common/section-header";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Platform Settings"
        description="Configure global settings for the SaaS platform."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "var(--cm-accent)" }}
          >
            <Save size={14} />
            Save Changes
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Nav Sidebar for Settings */}
        <div className="lg:col-span-1">
          <nav className="flex flex-col space-y-1">
            <SettingsTab label="General" active />
            <SettingsTab label="Branding" />
            <SettingsTab label="Email Templates" />
            <SettingsTab label="Billing Integrations" />
            <SettingsTab label="API & Webhooks" />
            <SettingsTab label="Security" />
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-xl border p-6"
            style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
          >
            <SectionHeader title="General Settings" description="Basic platform information and defaults." />
            
            <div className="mt-6 space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>Platform Name</label>
                <input
                  type="text"
                  defaultValue="Pawnshop Management System SaaS"
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--cm-input-bg)", borderColor: "var(--cm-input-border)", color: "var(--cm-text-primary)" }}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>Support Email</label>
                <input
                  type="email"
                  defaultValue="support@goldlink.ph"
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--cm-input-bg)", borderColor: "var(--cm-input-border)", color: "var(--cm-text-primary)" }}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>Default Timezone</label>
                <select
                  className="rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--cm-input-bg)", borderColor: "var(--cm-input-border)", color: "var(--cm-text-primary)" }}
                  defaultValue="Asia/Manila"
                >
                  <option value="Asia/Manila">Asia/Manila (PHT)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{ background: "var(--cm-surface)", borderColor: "var(--cm-error-light)" }}
          >
            <SectionHeader title="Maintenance Mode" description="Temporarily disable client access to the platform." />
            <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed p-4" style={{ borderColor: "var(--cm-border)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>Enable Maintenance Mode</p>
                <p className="text-xs" style={{ color: "var(--cm-text-muted)" }}>Clients will see a maintenance page when logging in.</p>
              </div>
              <button
                type="button"
                className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition-colors dark:bg-slate-800"
              >
                Off
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors"
      style={{
        background: active ? "var(--cm-surface-hover)" : "transparent",
        color: active ? "var(--cm-text-primary)" : "var(--cm-text-secondary)",
      }}
    >
      {label}
    </button>
  );
}

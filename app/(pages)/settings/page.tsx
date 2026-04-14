"use client";

import { useState } from "react";

const quickActions = [
  "Export current configuration",
  "Reset preview fields",
  "Sync template to branches",
];

export default function SettingsPage() {
  const [templateLocked, setTemplateLocked] = useState(true);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 text-text-primary">
      <section className="relative overflow-hidden rounded-2xl border border-border-main bg-gradient-to-r from-surface via-surface to-emerald-50/70 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.18),transparent_60%)]" />
        <div className="relative">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System settings
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                Settings
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Configure shop details, pawnshop policies, and the official agreement template from one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <Card title="Shop Information" description="Core contact details shown across receipts, documents, and public-facing references.">
            <div className="grid gap-3.5 md:grid-cols-2">
              <Field className="md:max-w-[320px]" label="Shop Name" defaultValue="JCLB BUY BACK SHOP" />
              <Field className="md:max-w-[320px]" label="Email" defaultValue="info@jclbbuyback.com" />
              <Field className="md:col-span-2 md:max-w-[520px]" label="Shop Address" defaultValue="123 Main Street, Manila, Philippines" />
              <Field className="md:max-w-[320px]" label="Phone Number" defaultValue="+63 2 1234 5678" />
              <Field className="md:max-w-[320px]" label="Business Permit ID" defaultValue="BP-2026-0014" />
            </div>
          </Card>

          <Card title="Pawnshop Policies" description="These values drive loan computations, reminders, and item release rules.">
            <div className="grid gap-3.5 md:grid-cols-3">
              <Field className="md:max-w-[230px]" label="Default Interest Rate (%)" defaultValue="3.5" helperText="per month" />
              <Field className="md:max-w-[230px]" label="Default Pawn Duration (Days)" defaultValue="30" />
              <Field className="md:max-w-[230px]" label="Grace Period (Days)" defaultValue="3" />
              <Field className="md:max-w-[230px]" label="Storage Fee / Day" defaultValue="25.00" helperText="PHP" />
              <Field className="md:max-w-[230px]" label="Penalty Trigger (Days)" defaultValue="7" />
              <Field className="md:max-w-[230px]" label="Maximum Renewal Cycles" defaultValue="2" />
            </div>
          </Card>

          <Card title="Memorandum of Agreement Template" description="Lock the template when you want branches to follow the approved wording.">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-main bg-surface-secondary px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-text-primary">Lock template</p>
                <p className="text-xs text-text-tertiary">
                  Prevents edits to the official agreement layout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTemplateLocked((current) => !current)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
                  templateLocked
                    ? "border-emerald-600 bg-emerald-600"
                    : "border-border-main bg-surface"
                }`}
                aria-pressed={templateLocked}
                aria-label="Toggle template lock"
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    templateLocked ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-border-main bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,250,251,0.88))] p-3 shadow-inner dark:bg-[linear-gradient(180deg,rgba(30,35,48,0.96),rgba(24,28,35,0.88))]">
              <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border border-border-main bg-surface px-4 py-5 text-[11px] leading-6 text-text-secondary shadow-sm">
                <div className="text-center text-xs font-semibold tracking-[0.2em] text-text-tertiary">
                  MEMORANDUM OF AGREEMENT
                </div>
                <div className="grid gap-3 text-[11px] sm:grid-cols-2">
                  <LineItem label="Unit Code" value="__________" align="right" />
                  <LineItem label="Maturity Date" value="__________" align="right" />
                  <LineItem label="Purchased Date" value="________________" />
                  <LineItem label="Expiry Date of Repurchase Back" value="__________" align="right" />
                  <LineItem label="ID(s) Presented" value="________________" />
                  <LineItem label="Pledge Reference" value="________________" />
                </div>
                <p className="pt-4 text-justify text-[11px] leading-6 text-text-secondary">
                  I, Mr./Mrs. ________________________________, of legal age and a resident of ____________________________, agree to transfer and pledge the item described herein under the prevailing pawnshop terms and conditions set by the company.
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <SignatureBlock label="Borrower signature" />
                  <SignatureBlock label="Authorized representative" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Live Configuration" description="Useful shortcuts for keeping settings consistent across the system.">
            <div className="space-y-3">
              <StatusRow label="Template status" value={templateLocked ? "Locked" : "Editable"} tone={templateLocked ? "success" : "neutral"} />
              <StatusRow label="Branch coverage" value="All branches" tone="neutral" />
              <StatusRow label="Validation" value="Ready for save" tone="success" />
            </div>
          </Card>

          <Card title="Quick Actions" description="Operational actions that usually accompany a settings update.">
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border-main bg-surface px-3 py-2.5 text-left text-sm text-text-primary shadow-sm transition hover:bg-surface-hover"
                >
                  <span>{action}</span>
                  <span className="text-text-tertiary">→</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Save Changes" description="Review edits before pushing them to production.">
            <div className="space-y-3">
              <button
                type="button"
                className="w-full rounded-xl bg-pawn-sidebar px-3 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition hover:bg-pawn-sidebar-light"
              >
                Save system settings
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-border-main bg-surface px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
              >
                Discard changes
              </button>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border-main bg-surface p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-text-secondary">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  defaultValue,
  helperText,
  className = "",
}: {
  label: string;
  defaultValue: string;
  helperText?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-text-primary">
        {label}
      </span>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-muted focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      {helperText ? (
        <span className="mt-1 block text-xs text-text-tertiary">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

function LineItem({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <span className="block font-medium text-text-primary">{label}</span>
      <span className="block text-text-secondary">{value}</span>
    </div>
  );
}

function SignatureBlock({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <div className="h-px bg-border-main" />
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-text-tertiary">
        {label}
      </p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "neutral";
}) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-surface text-emerald-text border-emerald-border"
      : "bg-surface-secondary text-text-secondary border-border-main";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border-main bg-surface-secondary px-3 py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}>
        {value}
      </span>
    </div>
  );
}

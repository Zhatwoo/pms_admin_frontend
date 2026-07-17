// ═══════════════════════════════════════════════════════════
// Client Management SaaS — Constants
// ═══════════════════════════════════════════════════════════

import type { PlanTier, ClientStatus, SubscriptionStatus, InvoiceStatus, TicketPriority, TicketStatus, HealthStatus, ActivityType, AnnouncementType } from "./types";

// ── Plan Tiers ─────────────────────────────────────────────

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
  custom: "Custom",
};

export const PLAN_TIER_COLORS: Record<PlanTier, { bg: string; text: string; border: string }> = {
  starter: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
  professional: { bg: "bg-indigo-50 dark:bg-indigo-950", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  enterprise: { bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
  custom: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
};

// ── Client Status ──────────────────────────────────────────

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  trial: "Trial",
  churned: "Churned",
};

export const CLIENT_STATUS_COLORS: Record<ClientStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  inactive: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  suspended: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  trial: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  churned: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-500" },
};

// ── Subscription Status ────────────────────────────────────

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  trial: "Trial",
  past_due: "Past Due",
  cancelled: "Cancelled",
  expired: "Expired",
  paused: "Paused",
};

export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  trial: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  past_due: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  cancelled: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  expired: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-400" },
  paused: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
};

// ── Invoice Status ─────────────────────────────────────────

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, { bg: string; text: string; dot: string }> = {
  paid: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  overdue: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  cancelled: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-400" },
  refunded: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
};

// ── Ticket ─────────────────────────────────────────────────

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
  medium: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400" },
  high: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400" },
  urgent: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-400" },
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting: "Waiting",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, { bg: string; text: string; dot: string }> = {
  open: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  in_progress: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  waiting: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  resolved: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  closed: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-400" },
};

// ── Health Status ──────────────────────────────────────────

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
  maintenance: "Maintenance",
};

export const HEALTH_STATUS_COLORS: Record<HealthStatus, { bg: string; text: string; dot: string }> = {
  operational: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  degraded: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  down: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  maintenance: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
};

// ── Activity Type ──────────────────────────────────────────

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  signup: "New Signup",
  payment: "Payment",
  upgrade: "Plan Upgrade",
  downgrade: "Plan Downgrade",
  cancellation: "Cancellation",
  ticket: "Support Ticket",
  login: "Login",
  invoice: "Invoice",
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  signup: "text-emerald-500",
  payment: "text-blue-500",
  upgrade: "text-violet-500",
  downgrade: "text-amber-500",
  cancellation: "text-red-500",
  ticket: "text-orange-500",
  login: "text-slate-500",
  invoice: "text-indigo-500",
};

// ── Announcement Type ──────────────────────────────────────

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  info: "Info",
  warning: "Warning",
  maintenance: "Maintenance",
  feature: "Feature",
  update: "Update",
};

// ── Chart Colors ───────────────────────────────────────────

export const CHART_COLORS = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  sky: "#0ea5e9",
  slate: "#64748b",
  teal: "#14b8a6",
  pink: "#ec4899",
  orange: "#f97316",
};

export const PLAN_CHART_COLORS: Record<PlanTier, string> = {
  starter: CHART_COLORS.slate,
  professional: CHART_COLORS.indigo,
  enterprise: CHART_COLORS.violet,
  custom: CHART_COLORS.amber,
};

// ── Regions ────────────────────────────────────────────────

export const REGIONS = [
  "NCR",
  "Region I",
  "Region II",
  "Region III",
  "Region IV-A",
  "Region IV-B",
  "Region V",
  "Region VI",
  "Region VII",
  "Region VIII",
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "CAR",
  "BARMM",
] as const;

// ── Export Formats ─────────────────────────────────────────

export const EXPORT_FORMATS = [
  { label: "CSV", value: "csv", icon: "FileSpreadsheet" },
  { label: "Excel", value: "xlsx", icon: "FileSpreadsheet" },
  { label: "PDF", value: "pdf", icon: "FileText" },
] as const;

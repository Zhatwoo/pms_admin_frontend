// ═══════════════════════════════════════════════════════════
// Client Management SaaS — Type Definitions
// ═══════════════════════════════════════════════════════════

// ── Plan & Subscription ────────────────────────────────────

export type PlanTier = "starter" | "professional" | "enterprise" | "custom";
export type SubscriptionStatus = "active" | "trial" | "past_due" | "cancelled" | "expired" | "paused";
export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: PlanFeature[];
  limits: {
    branches: number;
    employees: number;
    storageGb: number;
    apiCallsPerMonth: number;
  };
  isPopular: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  clientId: string;
  planId: string;
  plan: Plan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
}

// ── Client ─────────────────────────────────────────────────

export type ClientStatus = "active" | "inactive" | "suspended" | "trial" | "churned";

export interface SaasClient {
  id: string;
  companyName: string;
  logo: string;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  region: string;
  address: string;
  status: ClientStatus;
  subscription: Subscription;
  branchCount: number;
  employeeCount: number;
  storageUsedGb: number;
  storageAllocatedGb: number;
  databaseSizeMb: number;
  apiRequestsThisMonth: number;
  apiRequestsLimit: number;
  totalRevenue: number;
  outstandingBalance: number;
  lastLoginAt: string;
  createdAt: string;
}

// ── Invoice ────────────────────────────────────────────────

export type InvoiceStatus = "paid" | "pending" | "overdue" | "cancelled" | "refunded";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  issuedAt: string;
  items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ── Transaction ────────────────────────────────────────────

export type TransactionType = "payment" | "refund" | "credit" | "adjustment";
export type PaymentMethod = "credit_card" | "bank_transfer" | "paypal" | "gcash" | "maya";

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  invoiceId: string | null;
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  status: "completed" | "pending" | "failed";
  description: string;
  createdAt: string;
}

// ── Support Ticket ─────────────────────────────────────────

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

// ── Audit Log ──────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  targetType: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// ── Announcement ───────────────────────────────────────────

export type AnnouncementType = "info" | "warning" | "maintenance" | "feature" | "update";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isPublished: boolean;
  targetPlans: PlanTier[];
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// ── Usage & Analytics ──────────────────────────────────────

export interface UsageMetrics {
  totalStorageUsedGb: number;
  totalStorageAllocatedGb: number;
  totalBandwidthGb: number;
  totalApiRequests: number;
  totalDatabaseSizeMb: number;
  activeUsers: number;
  peakConcurrentUsers: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface RevenueByPlan {
  plan: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface ClientGrowthPoint {
  month: string;
  totalClients: number;
  newClients: number;
  churned: number;
}

export interface SubscriptionDistribution {
  plan: string;
  count: number;
  percentage: number;
  color: string;
}

// ── System Health ──────────────────────────────────────────

export type HealthStatus = "operational" | "degraded" | "down" | "maintenance";

export interface SystemService {
  name: string;
  status: HealthStatus;
  uptime: string;
  responseTime: string;
  lastChecked: string;
  details?: string;
}

// ── Activity Feed ──────────────────────────────────────────

export type ActivityType = "signup" | "payment" | "upgrade" | "downgrade" | "cancellation" | "ticket" | "login" | "invoice";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  clientName: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

// ── Dashboard KPIs ─────────────────────────────────────────

export interface DashboardKPIs {
  totalClients: number;
  activeClients: number;
  mrr: number;
  arr: number;
  monthlyGrowth: number;
  trialAccounts: number;
  expiredAccounts: number;
  storageUsedGb: number;
  apiRequests: number;
  totalRevenue: number;
  outstandingPayments: number;
  churnRate: number;
  avgRevenuePerClient: number;
  collectionRate: number;
  refundRate: number;
}

// ── Table & Filter ─────────────────────────────────────────

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

// ── Settings ───────────────────────────────────────────────

export interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
}

// ── CM Navigation ──────────────────────────────────────────

export interface CMNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface CMNavSection {
  title: string;
  items: CMNavItem[];
}

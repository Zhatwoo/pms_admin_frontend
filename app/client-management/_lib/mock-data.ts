// ═══════════════════════════════════════════════════════════
// Client Management SaaS — Deterministic Mock Data
// Stable across reloads thanks to seeded PRNG.
// ═══════════════════════════════════════════════════════════

import type {
  Plan, SaasClient, Subscription, Invoice, Transaction,
  SupportTicket, AuditLogEntry, Announcement, SystemService,
  ActivityItem, DashboardKPIs, TimeSeriesPoint, RevenueByPlan,
  ClientGrowthPoint, SubscriptionDistribution, UsageMetrics,
  PlanTier, ClientStatus, SubscriptionStatus, InvoiceStatus,
  TransactionType, PaymentMethod, TicketPriority, TicketStatus,
  ActivityType, AnnouncementType, BillingCycle,
} from "./types";
import { seededRandom, pick, randInt, randFloat, pseudoUUID } from "./utils";
import { PLAN_CHART_COLORS, CHART_COLORS } from "./constants";

// ── Seed ───────────────────────────────────────────────────
const rng = seededRandom(42);

// ── Reference Data ─────────────────────────────────────────
const COMPANY_NAMES = [
  "GoldLink Pawnshop", "FastCash Lending", "TrustPawn Corp", "Metro Pawn Inc",
  "Diamond Star Pawnshop", "Prime Pledge Services", "Royal Pawn Holdings",
  "Pacific Cash Express", "Unity Pawnbrokers", "Atlas Pawn Group",
  "Golden Gate Pawnshop", "Silver Line Lending", "Capital Pawn Solutions",
  "Pioneer Pledge Corp", "Crown Pawn Enterprises", "Phoenix Cash Services",
  "Emerald Pawnshop", "Summit Lending Corp", "Dragon Pawn Holdings",
  "Liberty Cash Express", "Eagle Pawnbrokers", "Titan Pawn Group",
  "Horizon Pledge Services", "Neptune Cash Corp", "Coral Pawn Solutions",
  "Sapphire Lending Inc", "Mercury Pawnshop", "Venus Cash Holdings",
  "Jupiter Pledge Corp", "Saturn Pawn Express", "Mars Lending Group",
  "Luna Pawnbrokers", "Stellar Cash Services", "Nova Pawn Holdings",
  "Cosmos Pledge Corp", "Galaxy Pawn Express", "Orbit Lending Inc",
  "Zenith Cash Corp", "Apex Pawnshop", "Vertex Pledge Services",
  "Summit Cash Express", "Ridge Pawn Holdings", "Peak Lending Group",
  "Alpine Pawnbrokers", "Crest Cash Services", "Highland Pawn Corp",
  "Valley Pledge Express", "Basin Lending Inc", "Canyon Cash Group",
  "Meadow Pawnshop", "Harbor Pledge Corp", "Bay Cash Express",
  "Port Lending Holdings", "Anchor Pawn Group", "Reef Cash Services",
  "Lagoon Pledge Corp", "Tide Pawn Express", "Wave Lending Inc",
  "Ocean Cash Corp", "Island Pawnshop", "Peninsula Pledge Holdings",
  "Gulf Pawn Express", "Strait Lending Group", "Delta Cash Corp",
  "River Pawnbrokers", "Lake Pledge Services", "Stream Cash Express",
  "Brook Lending Holdings", "Spring Pawn Group", "Falls Cash Corp",
  "Rapids Pledge Inc", "Cascade Pawnshop", "Creek Cash Express",
  "Pond Lending Corp", "Marsh Pawn Holdings", "Grove Pledge Group",
  "Forest Cash Services", "Timber Pawn Corp", "Cedar Pledge Express",
  "Pine Lending Inc", "Oak Cash Corp", "Elm Pawnshop",
  "Maple Pledge Holdings", "Birch Pawn Express", "Willow Cash Group",
  "Vine Lending Corp", "Bloom Pawn Services", "Petal Cash Express",
  "Fern Pledge Holdings", "Clover Pawn Group", "Ivy Cash Corp",
  "Jasmine Lending Inc", "Rose Pawnshop", "Lily Pledge Express",
  "Orchid Cash Holdings", "Lotus Pawn Group", "Daisy Cash Services",
  "Poppy Pledge Corp", "Tulip Pawn Express", "Iris Lending Inc",
  "Violet Cash Corp", "Amber Pawnshop", "Jade Pledge Holdings",
  "Onyx Cash Express", "Opal Lending Group", "Ruby Pawn Corp",
  "Pearl Pledge Services", "Garnet Cash Express", "Topaz Pawn Holdings",
  "Agate Lending Group", "Quartz Cash Corp", "Jasper Pawnbrokers",
  "Coral Pledge Inc", "Ivory Cash Express", "Ebony Pawn Holdings",
  "Obsidian Lending Corp", "Crystal Pawn Services", "Stone Cash Group",
  "Marble Pledge Express", "Granite Pawn Holdings", "Slate Cash Corp",
];

const OWNER_FIRST = [
  "Maria", "Jose", "Juan", "Ana", "Mark", "Michael", "Gabriel", "Rafael",
  "Carlos", "Daniel", "Fernando", "Ricardo", "Roberto", "Antonio", "Francisco",
  "Eduardo", "Alejandro", "Miguel", "David", "Luis", "Rosa", "Carmen",
  "Teresa", "Patricia", "Isabella", "Sofia", "Elena", "Victoria", "Andrea",
  "Cristina", "Manuel", "Diego", "Pablo", "Jorge", "Pedro", "Ramon",
  "Sergio", "Arturo", "Oscar", "Enrique",
];

const OWNER_LAST = [
  "Santos", "Cruz", "Reyes", "Garcia", "Torres", "Gonzales", "Lopez",
  "Hernandez", "Martinez", "Rivera", "Ramos", "Aquino", "Dela Cruz",
  "De Leon", "Villanueva", "Bautista", "Mendoza", "Castillo", "Flores",
  "Morales", "Navarro", "Aguilar", "Santiago", "Romero", "Padilla",
];

const REGIONS_DATA = [
  "NCR", "Region I", "Region II", "Region III", "Region IV-A",
  "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII",
  "Region IX", "Region X", "Region XI", "Region XII", "CAR", "BARMM",
];

const CITIES = [
  "Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Cebu City",
  "Davao City", "Caloocan", "Zamboanga", "Antipolo", "Pasay", "Las Piñas",
  "Parañaque", "Mandaluyong", "Marikina", "Baguio", "Iloilo City",
  "Bacolod", "General Santos", "Cagayan de Oro",
];

// ── Plans ──────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    tier: "starter" as PlanTier,
    description: "Perfect for small pawnshops just getting started.",
    priceMonthly: 2999,
    priceYearly: 29990,
    features: [
      { name: "Pawn transactions", included: true },
      { name: "Customer management", included: true },
      { name: "Basic reporting", included: true },
      { name: "Email support", included: true },
      { name: "Inventory tracking", included: true },
      { name: "Multi-branch", included: false },
      { name: "Advanced analytics", included: false },
      { name: "API access", included: false },
      { name: "Custom branding", included: false },
      { name: "Priority support", included: false },
    ],
    limits: { branches: 1, employees: 5, storageGb: 5, apiCallsPerMonth: 1000 },
    isPopular: false,
    isArchived: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "plan_professional",
    name: "Professional",
    tier: "professional" as PlanTier,
    description: "Ideal for growing pawnshops with multiple locations.",
    priceMonthly: 7999,
    priceYearly: 79990,
    features: [
      { name: "Pawn transactions", included: true },
      { name: "Customer management", included: true },
      { name: "Advanced reporting", included: true },
      { name: "Priority email support", included: true },
      { name: "Inventory tracking", included: true },
      { name: "Multi-branch", included: true, limit: "Up to 5 branches" },
      { name: "Advanced analytics", included: true },
      { name: "API access", included: true, limit: "10K calls/month" },
      { name: "Custom branding", included: false },
      { name: "Dedicated support", included: false },
    ],
    limits: { branches: 5, employees: 25, storageGb: 25, apiCallsPerMonth: 10000 },
    isPopular: true,
    isArchived: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    tier: "enterprise" as PlanTier,
    description: "Full-featured solution for large pawnshop chains.",
    priceMonthly: 19999,
    priceYearly: 199990,
    features: [
      { name: "Pawn transactions", included: true },
      { name: "Customer management", included: true },
      { name: "Advanced reporting", included: true },
      { name: "Dedicated support manager", included: true },
      { name: "Inventory tracking", included: true },
      { name: "Unlimited branches", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Unlimited API access", included: true },
      { name: "Custom branding", included: true },
      { name: "SLA guarantee", included: true },
    ],
    limits: { branches: 999, employees: 999, storageGb: 100, apiCallsPerMonth: 100000 },
    isPopular: false,
    isArchived: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "plan_custom",
    name: "Custom",
    tier: "custom" as PlanTier,
    description: "Tailored solution built for your specific needs.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      { name: "Everything in Enterprise", included: true },
      { name: "Custom integrations", included: true },
      { name: "On-premise deployment option", included: true },
      { name: "Dedicated infrastructure", included: true },
      { name: "Custom SLA", included: true },
      { name: "White-label option", included: true },
      { name: "Training & onboarding", included: true },
      { name: "Unlimited everything", included: true },
    ],
    limits: { branches: 9999, employees: 9999, storageGb: 500, apiCallsPerMonth: 1000000 },
    isPopular: false,
    isArchived: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

// ── Generate Clients ───────────────────────────────────────

function generateDate(yearMin: number, yearMax: number): string {
  const year = randInt(yearMin, yearMax, rng);
  const month = randInt(1, 12, rng);
  const day = randInt(1, 28, rng);
  const hour = randInt(0, 23, rng);
  const min = randInt(0, 59, rng);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00Z`;
}

function generateRecentDate(daysBack: number): string {
  const now = new Date();
  const ms = now.getTime() - randInt(0, daysBack * 86400000, rng);
  return new Date(ms).toISOString();
}

function planForIndex(i: number): Plan {
  if (i < 30) return PLANS[0]; // starter
  if (i < 75) return PLANS[1]; // professional
  if (i < 110) return PLANS[2]; // enterprise
  return PLANS[3]; // custom
}

function statusForIndex(i: number): ClientStatus {
  const statuses: ClientStatus[] = ["active", "active", "active", "active", "active", "active", "trial", "inactive", "suspended", "churned"];
  return statuses[i % statuses.length];
}

function subStatusForClient(clientStatus: ClientStatus): SubscriptionStatus {
  switch (clientStatus) {
    case "active": return "active";
    case "trial": return "trial";
    case "inactive": return "expired";
    case "suspended": return "paused";
    case "churned": return "cancelled";
  }
}

function generateSubscription(clientId: string, plan: Plan, status: SubscriptionStatus): Subscription {
  const billingCycle: BillingCycle = rng() > 0.4 ? "monthly" : "yearly";
  const createdAt = generateDate(2024, 2026);
  const periodStart = generateRecentDate(30);
  const periodEnd = new Date(new Date(periodStart).getTime() + (billingCycle === "monthly" ? 30 : 365) * 86400000).toISOString();

  return {
    id: pseudoUUID(rng),
    clientId,
    planId: plan.id,
    plan,
    status,
    billingCycle,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelledAt: status === "cancelled" ? generateRecentDate(60) : null,
    trialEndsAt: status === "trial" ? new Date(Date.now() + randInt(1, 14, rng) * 86400000).toISOString() : null,
    createdAt,
  };
}

export const MOCK_CLIENTS: SaasClient[] = Array.from({ length: 120 }, (_, i) => {
  const id = pseudoUUID(rng);
  const plan = planForIndex(i);
  const clientStatus = statusForIndex(i);
  const subStatus = subStatusForClient(clientStatus);
  const firstName = pick(OWNER_FIRST, rng);
  const lastName = pick(OWNER_LAST, rng);
  const company = COMPANY_NAMES[i % COMPANY_NAMES.length];
  const domain = company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
  const branchCount = Math.min(randInt(1, plan.limits.branches, rng), plan.limits.branches);
  const employeeCount = Math.min(randInt(branchCount, plan.limits.employees, rng), plan.limits.employees);
  const storageAllocated = plan.limits.storageGb;
  const storageUsed = randFloat(0.1, storageAllocated * 0.9, rng);

  return {
    id,
    companyName: company,
    logo: "",
    ownerName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.ph`,
    phone: `+63 9${randInt(10, 99, rng)} ${randInt(100, 999, rng)} ${randInt(1000, 9999, rng)}`,
    website: `https://${domain}.ph`,
    region: pick(REGIONS_DATA, rng),
    address: `${randInt(1, 999, rng)} ${pick(["Rizal", "Mabini", "Quezon", "Bonifacio", "Luna", "Del Pilar", "Aguinaldo"], rng)} St., ${pick(CITIES, rng)}`,
    status: clientStatus,
    subscription: generateSubscription(id, plan, subStatus),
    branchCount,
    employeeCount,
    storageUsedGb: parseFloat(storageUsed.toFixed(2)),
    storageAllocatedGb: storageAllocated,
    databaseSizeMb: parseFloat(randFloat(50, storageAllocated * 200, rng).toFixed(1)),
    apiRequestsThisMonth: randInt(100, plan.limits.apiCallsPerMonth, rng),
    apiRequestsLimit: plan.limits.apiCallsPerMonth,
    totalRevenue: parseFloat(randFloat(5000, 500000, rng).toFixed(2)),
    outstandingBalance: rng() > 0.7 ? parseFloat(randFloat(1000, 50000, rng).toFixed(2)) : 0,
    lastLoginAt: generateRecentDate(7),
    createdAt: generateDate(2024, 2026),
  };
});

// ── Invoices ───────────────────────────────────────────────

const INV_STATUSES: InvoiceStatus[] = ["paid", "paid", "paid", "paid", "pending", "pending", "overdue", "cancelled", "refunded"];

export const MOCK_INVOICES: Invoice[] = Array.from({ length: 200 }, (_, i) => {
  const client = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
  const status = pick(INV_STATUSES, rng);
  const amount = parseFloat(randFloat(2999, 25000, rng).toFixed(2));
  const tax = parseFloat((amount * 0.12).toFixed(2));

  return {
    id: pseudoUUID(rng),
    invoiceNumber: `INV-${String(2024000 + i).padStart(7, "0")}`,
    clientId: client.id,
    clientName: client.companyName,
    amount,
    tax,
    total: parseFloat((amount + tax).toFixed(2)),
    status,
    dueDate: generateRecentDate(status === "overdue" ? 60 : 30),
    paidAt: status === "paid" ? generateRecentDate(30) : null,
    issuedAt: generateRecentDate(60),
    items: [
      {
        description: `${client.subscription.plan.name} Plan - ${client.subscription.billingCycle === "monthly" ? "Monthly" : "Annual"} Subscription`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ],
  };
});

// ── Transactions ───────────────────────────────────────────

const TXN_TYPES: TransactionType[] = ["payment", "payment", "payment", "payment", "refund", "credit", "adjustment"];
const PAY_METHODS: PaymentMethod[] = ["credit_card", "bank_transfer", "gcash", "maya", "paypal"];

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 250 }, (_, i) => {
  const client = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
  const type = pick(TXN_TYPES, rng);
  const amount = parseFloat(randFloat(1000, 30000, rng).toFixed(2));

  return {
    id: pseudoUUID(rng),
    clientId: client.id,
    clientName: client.companyName,
    invoiceId: i < 200 ? MOCK_INVOICES[i].id : null,
    type,
    amount: type === "refund" ? -amount : amount,
    paymentMethod: pick(PAY_METHODS, rng),
    status: rng() > 0.1 ? "completed" : rng() > 0.5 ? "pending" : "failed",
    description: type === "payment" ? "Subscription payment" : type === "refund" ? "Refund processed" : type === "credit" ? "Account credit applied" : "Balance adjustment",
    createdAt: generateRecentDate(90),
  };
});

// ── Support Tickets ────────────────────────────────────────

const TICKET_SUBJECTS = [
  "Cannot access dashboard", "Billing discrepancy", "Branch sync not working",
  "Feature request: Export reports", "Password reset issue", "API rate limit exceeded",
  "Storage upgrade request", "Employee account locked", "Data backup inquiry",
  "Integration help needed", "Invoice not received", "Performance slow",
  "Custom report request", "Account migration help", "Training request",
  "QR scanner not working", "Print template issue", "Mobile access problem",
  "Notification not received", "Transaction rollback needed",
];

const TICKET_PRIORITIES: TicketPriority[] = ["low", "medium", "medium", "high", "urgent"];
const TICKET_STATUSES: TicketStatus[] = ["open", "in_progress", "waiting", "resolved", "closed"];
const ASSIGNEES = ["Alex M.", "Sarah K.", "James L.", "Maria G.", "David R.", null];

export const MOCK_TICKETS: SupportTicket[] = Array.from({ length: 80 }, (_, i) => {
  const client = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
  const status = pick(TICKET_STATUSES, rng);

  return {
    id: pseudoUUID(rng),
    ticketNumber: `TKT-${String(1000 + i).padStart(5, "0")}`,
    clientId: client.id,
    clientName: client.companyName,
    subject: pick(TICKET_SUBJECTS, rng),
    description: "Customer reported an issue that requires attention from the support team.",
    priority: pick(TICKET_PRIORITIES, rng),
    status,
    assignedTo: pick(ASSIGNEES, rng),
    createdAt: generateRecentDate(30),
    updatedAt: generateRecentDate(7),
    resolvedAt: status === "resolved" || status === "closed" ? generateRecentDate(5) : null,
  };
});

// ── Audit Logs ─────────────────────────────────────────────

const AUDIT_ACTIONS = [
  "client.created", "client.updated", "client.suspended", "client.activated",
  "subscription.upgraded", "subscription.downgraded", "subscription.cancelled",
  "invoice.created", "invoice.paid", "payment.received", "payment.refunded",
  "plan.updated", "settings.changed", "user.impersonated", "ticket.resolved",
  "announcement.published", "export.generated", "backup.created",
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = Array.from({ length: 150 }, (_, i) => {
  const action = pick(AUDIT_ACTIONS, rng);
  const client = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
  const actors = ["System Admin", "Super Admin", "Support Bot", "Billing System", "API Service"];

  return {
    id: pseudoUUID(rng),
    action,
    actor: pick(actors, rng),
    actorRole: "super_admin",
    target: client.companyName,
    targetType: action.split(".")[0],
    details: `${action.replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase())} for ${client.companyName}`,
    ipAddress: `${randInt(1, 223, rng)}.${randInt(0, 255, rng)}.${randInt(0, 255, rng)}.${randInt(1, 254, rng)}`,
    timestamp: generateRecentDate(30),
  };
});

// ── Announcements ──────────────────────────────────────────

const ANN_TYPES: AnnouncementType[] = ["info", "warning", "maintenance", "feature", "update"];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: pseudoUUID(rng), title: "System Maintenance Scheduled", content: "We will be performing scheduled maintenance on July 20, 2026 from 2:00 AM to 6:00 AM PHT. During this time, the system may experience brief interruptions.", type: "maintenance", isPublished: true, targetPlans: ["starter", "professional", "enterprise", "custom"], publishedAt: "2026-07-15T08:00:00Z", expiresAt: "2026-07-21T00:00:00Z", createdAt: "2026-07-14T10:00:00Z" },
  { id: pseudoUUID(rng), title: "New Feature: Advanced Reporting", content: "We're excited to announce our new Advanced Reporting module with customizable dashboards, automated report scheduling, and PDF export capabilities.", type: "feature", isPublished: true, targetPlans: ["professional", "enterprise", "custom"], publishedAt: "2026-07-10T08:00:00Z", expiresAt: null, createdAt: "2026-07-09T14:00:00Z" },
  { id: pseudoUUID(rng), title: "API Rate Limit Increase", content: "Effective August 1, 2026, we're increasing API rate limits for all plans. Starter: 2K/mo, Professional: 25K/mo, Enterprise: Unlimited.", type: "update", isPublished: true, targetPlans: ["starter", "professional", "enterprise", "custom"], publishedAt: "2026-07-05T08:00:00Z", expiresAt: null, createdAt: "2026-07-04T16:00:00Z" },
  { id: pseudoUUID(rng), title: "Security Advisory", content: "We recommend all users enable two-factor authentication for enhanced account security. This can be configured in Settings > Security.", type: "warning", isPublished: true, targetPlans: ["starter", "professional", "enterprise", "custom"], publishedAt: "2026-06-28T08:00:00Z", expiresAt: null, createdAt: "2026-06-27T11:00:00Z" },
  { id: pseudoUUID(rng), title: "Holiday Hours Notice", content: "Our support team will have limited availability during the upcoming national holidays. Emergency support remains available 24/7 for Enterprise clients.", type: "info", isPublished: false, targetPlans: ["starter", "professional", "enterprise", "custom"], publishedAt: null, expiresAt: null, createdAt: "2026-07-12T09:00:00Z" },
];

// ── System Health ──────────────────────────────────────────

export const MOCK_SYSTEM_HEALTH: SystemService[] = [
  { name: "API Server", status: "operational", uptime: "99.98%", responseTime: "45ms", lastChecked: new Date().toISOString() },
  { name: "Database (Primary)", status: "operational", uptime: "99.99%", responseTime: "12ms", lastChecked: new Date().toISOString() },
  { name: "Database (Replica)", status: "operational", uptime: "99.97%", responseTime: "15ms", lastChecked: new Date().toISOString() },
  { name: "Redis Cache", status: "operational", uptime: "99.99%", responseTime: "2ms", lastChecked: new Date().toISOString() },
  { name: "File Storage (S3)", status: "operational", uptime: "99.99%", responseTime: "85ms", lastChecked: new Date().toISOString() },
  { name: "Queue Worker", status: "operational", uptime: "99.95%", responseTime: "N/A", lastChecked: new Date().toISOString(), details: "Processing 234 jobs/min" },
  { name: "Background Jobs", status: "operational", uptime: "99.90%", responseTime: "N/A", lastChecked: new Date().toISOString(), details: "12 scheduled, 3 running" },
  { name: "Email Service", status: "operational", uptime: "99.92%", responseTime: "320ms", lastChecked: new Date().toISOString() },
  { name: "Backup Service", status: "operational", uptime: "100%", responseTime: "N/A", lastChecked: new Date().toISOString(), details: "Last backup: 2h ago" },
];

// ── Activity Feed ──────────────────────────────────────────

const ACTIVITY_TYPES: ActivityType[] = ["signup", "payment", "upgrade", "downgrade", "cancellation", "ticket", "login", "invoice"];

export const MOCK_ACTIVITIES: ActivityItem[] = Array.from({ length: 50 }, (_, i) => {
  const type = pick(ACTIVITY_TYPES, rng);
  const client = MOCK_CLIENTS[i % MOCK_CLIENTS.length];
  const descriptions: Record<ActivityType, string> = {
    signup: `${client.companyName} signed up for the ${client.subscription.plan.name} plan`,
    payment: `Payment of ₱${randInt(2999, 25000, rng).toLocaleString()} received from ${client.companyName}`,
    upgrade: `${client.companyName} upgraded to ${pick(["Professional", "Enterprise"], rng)} plan`,
    downgrade: `${client.companyName} downgraded to ${pick(["Starter", "Professional"], rng)} plan`,
    cancellation: `${client.companyName} cancelled their subscription`,
    ticket: `New support ticket from ${client.companyName}: "${pick(TICKET_SUBJECTS, rng)}"`,
    login: `${client.ownerName} from ${client.companyName} logged in`,
    invoice: `Invoice generated for ${client.companyName}`,
  };

  return {
    id: pseudoUUID(rng),
    type,
    title: type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
    description: descriptions[type],
    clientName: client.companyName,
    timestamp: generateRecentDate(7),
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ── Dashboard KPIs ─────────────────────────────────────────

const activeClients = MOCK_CLIENTS.filter((c) => c.status === "active").length;
const trialClients = MOCK_CLIENTS.filter((c) => c.status === "trial").length;
const expiredClients = MOCK_CLIENTS.filter((c) => c.status === "inactive" || c.status === "churned").length;
const totalRevenue = MOCK_CLIENTS.reduce((sum, c) => sum + c.totalRevenue, 0);
const outstanding = MOCK_CLIENTS.reduce((sum, c) => sum + c.outstandingBalance, 0);
const totalStorage = MOCK_CLIENTS.reduce((sum, c) => sum + c.storageUsedGb, 0);
const totalApi = MOCK_CLIENTS.reduce((sum, c) => sum + c.apiRequestsThisMonth, 0);

// Calculate MRR from active subscriptions
const mrr = MOCK_CLIENTS
  .filter((c) => c.status === "active" || c.status === "trial")
  .reduce((sum, c) => {
    const plan = c.subscription.plan;
    return sum + (c.subscription.billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly / 12);
  }, 0);

export const MOCK_DASHBOARD_KPIS: DashboardKPIs = {
  totalClients: MOCK_CLIENTS.length,
  activeClients,
  mrr: parseFloat(mrr.toFixed(2)),
  arr: parseFloat((mrr * 12).toFixed(2)),
  monthlyGrowth: 8.3,
  trialAccounts: trialClients,
  expiredAccounts: expiredClients,
  storageUsedGb: parseFloat(totalStorage.toFixed(2)),
  apiRequests: totalApi,
  totalRevenue: parseFloat(totalRevenue.toFixed(2)),
  outstandingPayments: parseFloat(outstanding.toFixed(2)),
  churnRate: 2.4,
  avgRevenuePerClient: parseFloat((totalRevenue / MOCK_CLIENTS.length).toFixed(2)),
  collectionRate: 94.7,
  refundRate: 1.8,
};

// ── Chart Data: MRR Growth ─────────────────────────────────

export const MOCK_MRR_TREND: TimeSeriesPoint[] = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(2026, i, 1);
  const baseValue = 400000 + i * 35000;
  return {
    date: month.toISOString().slice(0, 7),
    value: baseValue + randInt(-10000, 15000, rng),
  };
});

// ── Chart Data: Revenue Trend ──────────────────────────────

export const MOCK_REVENUE_TREND: TimeSeriesPoint[] = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(2026, i, 1);
  const baseValue = 500000 + i * 40000;
  return {
    date: month.toISOString().slice(0, 7),
    value: baseValue + randInt(-20000, 25000, rng),
  };
});

// ── Chart Data: Client Growth ──────────────────────────────

export const MOCK_CLIENT_GROWTH: ClientGrowthPoint[] = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(2026, i, 1);
  const monthStr = month.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const base = 60 + i * 8;
  const newC = randInt(5, 15, rng);
  const churned = randInt(0, 3, rng);
  return {
    month: monthStr,
    totalClients: base + newC - churned,
    newClients: newC,
    churned,
  };
});

// ── Chart Data: Subscription Distribution ──────────────────

const starterCount = MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "starter").length;
const proCount = MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "professional").length;
const entCount = MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "enterprise").length;
const customCount = MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "custom").length;
const total = MOCK_CLIENTS.length;

export const MOCK_SUBSCRIPTION_DISTRIBUTION: SubscriptionDistribution[] = [
  { plan: "Starter", count: starterCount, percentage: parseFloat(((starterCount / total) * 100).toFixed(1)), color: PLAN_CHART_COLORS.starter },
  { plan: "Professional", count: proCount, percentage: parseFloat(((proCount / total) * 100).toFixed(1)), color: PLAN_CHART_COLORS.professional },
  { plan: "Enterprise", count: entCount, percentage: parseFloat(((entCount / total) * 100).toFixed(1)), color: PLAN_CHART_COLORS.enterprise },
  { plan: "Custom", count: customCount, percentage: parseFloat(((customCount / total) * 100).toFixed(1)), color: PLAN_CHART_COLORS.custom },
];

// ── Chart Data: Revenue by Plan ────────────────────────────

export const MOCK_REVENUE_BY_PLAN: RevenueByPlan[] = [
  { plan: "Starter", revenue: MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "starter").reduce((s, c) => s + c.totalRevenue, 0), percentage: 0, color: PLAN_CHART_COLORS.starter },
  { plan: "Professional", revenue: MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "professional").reduce((s, c) => s + c.totalRevenue, 0), percentage: 0, color: PLAN_CHART_COLORS.professional },
  { plan: "Enterprise", revenue: MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "enterprise").reduce((s, c) => s + c.totalRevenue, 0), percentage: 0, color: PLAN_CHART_COLORS.enterprise },
  { plan: "Custom", revenue: MOCK_CLIENTS.filter((c) => c.subscription.plan.tier === "custom").reduce((s, c) => s + c.totalRevenue, 0), percentage: 0, color: PLAN_CHART_COLORS.custom },
].map((item) => {
  const totalRev = MOCK_CLIENTS.reduce((s, c) => s + c.totalRevenue, 0);
  return { ...item, percentage: parseFloat(((item.revenue / totalRev) * 100).toFixed(1)) };
});

// ── Usage Metrics ──────────────────────────────────────────

export const MOCK_USAGE_METRICS: UsageMetrics = {
  totalStorageUsedGb: parseFloat(totalStorage.toFixed(2)),
  totalStorageAllocatedGb: MOCK_CLIENTS.reduce((s, c) => s + c.storageAllocatedGb, 0),
  totalBandwidthGb: parseFloat(randFloat(500, 2000, rng).toFixed(2)),
  totalApiRequests: totalApi,
  totalDatabaseSizeMb: parseFloat(MOCK_CLIENTS.reduce((s, c) => s + c.databaseSizeMb, 0).toFixed(1)),
  activeUsers: activeClients * 3,
  peakConcurrentUsers: randInt(40, 120, rng),
};

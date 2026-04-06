import type { NavItem } from "@/types";

export const APP_NAME = "Pawnshop Management System";

export const SUPERADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/superadmin/dashboard" },
  { label: "Branches", href: "/superadmin/branches" },
  { label: "Users", href: "/superadmin/users" },
  { label: "Audit Logs", href: "/superadmin/audit-logs" },
  { label: "Settings", href: "/superadmin/settings" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Branches", href: "/admin/branches" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Transactions", href: "/admin/transactions" },
  { label: "Reports", href: "/admin/reports" },
];

export const BRANCH_NAV: NavItem[] = [
  { label: "Dashboard", href: "/branch/dashboard" },
  { label: "Pawn", href: "/branch/pawn" },
  { label: "Redeem", href: "/branch/redeem" },
  { label: "Inventory", href: "/branch/inventory" },
  { label: "Customers", href: "/branch/customers" },
];

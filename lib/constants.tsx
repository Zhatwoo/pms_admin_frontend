import type { NavGroup, Role } from "@/types";
import {
  DashboardIcon,
  UserManagementIcon,
  SettingsIcon,
  AuditLogIcon,
  ReportsIcon,
  BranchesIcon,
  CustomersIcon,
} from "@/lib/icons";
import { BRAND_CONFIG } from "./brand-config";

export const APP_NAME = BRAND_CONFIG.companyName;
export const APP_SHORT_NAME = BRAND_CONFIG.shortCompanyName;
export const APP_TAGLINE = BRAND_CONFIG.tagline;

const ADMIN_NAV: NavGroup[] = [
  {
    section: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    ],
  },
  {
    section: "MANAGEMENT",
    items: [
      { label: "Clients", href: "/clients", icon: <CustomersIcon /> },
      {
        label: "Tenants",
        href: "/tenants",
        icon: <BranchesIcon />,
      },
      {
        label: "Subscriptions",
        href: "/subscriptions",
        icon: <ReportsIcon />,
      },
    ],
  },
  {
    section: "FINANCIAL",
    items: [
      { label: "Billing", href: "/billing", icon: <ReportsIcon /> },
      { label: "Financial Reports", href: "/financial", icon: <ReportsIcon /> },
      { label: "Analytics", href: "/analytics", icon: <ReportsIcon /> },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { label: "Users", href: "/users", icon: <UserManagementIcon /> },
      { label: "Roles & Permissions", href: "/roles", icon: <AuditLogIcon /> },
      { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
      { label: "Audit Logs", href: "/audit-logs", icon: <AuditLogIcon /> },
    ],
  },
];

export function getNavForRole(role: Role): NavGroup[] {
  switch (role) {
    case "super_admin":
    case "admin":
      return ADMIN_NAV;
    default:
      return [];
  }
}

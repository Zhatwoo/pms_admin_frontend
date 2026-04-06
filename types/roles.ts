export type Role = "superadmin" | "admin" | "branch";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

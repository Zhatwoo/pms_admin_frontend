import type { Role, User } from "@/types";

const DEFAULT_ROUTE_BY_ROLE: Record<Role, string> = {
  super_admin: "/dashboard",
  admin: "/dashboard",
};

export function normalizeRole(role: string | null | undefined): Role | null {
  if (!role) return null;

  const normalized = role.toLowerCase().trim().replace(/\s+/g, "_");

  switch (normalized) {
    case "super_admin":
    case "superadmin":
      return "super_admin";
    case "admin":
      return "admin";
    default:
      return null;
  }
}

export function normalizeUser(user: User | null): User | null {
  if (!user) {
    return null;
  }

  const role = normalizeRole(user.role);

  if (!role) {
    return null;
  }

  return {
    ...user,
    fullName: user.fullName?.trim() || user.email,
    role,
  };
}

export function getDefaultRouteForRole(role: Role): string {
  return DEFAULT_ROUTE_BY_ROLE[role];
}

export function getAuthorizedRedirect(
  role: Role,
  requestedRedirect: string | null,
): string {
  if (!requestedRedirect || requestedRedirect === "/" || requestedRedirect.startsWith("/login")) {
    return getDefaultRouteForRole(role);
  }

  return requestedRedirect;
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
  }
}

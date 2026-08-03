"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Search, Shield, Users, Trash2, Edit2 } from "lucide-react";

type UserRole = "super_admin" | "admin";
type UserStatus = "active" | "pending" | "suspended";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  createdAt: string;
  tenant?: { id: string; name: string; subdomain: string };
}

const STATUS_STYLES: Record<UserStatus, string> = {
  active: "bg-emerald-surface text-emerald-text border border-emerald-border",
  suspended: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30",
  pending: "bg-badge-muted-bg text-badge-muted-text border border-border-main",
};

function formatLastLogin(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "tenant">("admin");
  const [search, setSearch] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteAdminTarget, setDeleteAdminTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "admin") {
        const data = await api.get<AdminUser[]>("/users");
        setAdminUsers(data);
      } else {
        const data = await api.get<TenantUser[]>("/users/tenant-users");
        setTenantUsers(data);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAdmins = adminUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredTenantUsers = tenantUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.tenant?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleDeleteAdmin = async () => {
    if (!deleteAdminTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteAdminTarget.id}`);
      toast.success(`Admin user "${deleteAdminTarget.fullName}" deleted.`);
      setDeleteAdminTarget(null);
      loadData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTenantUser = async (user: TenantUser) => {
    if (!confirm(`Delete tenant user "${user.fullName}" (${user.email})?`)) return;
    try {
      await api.delete(`/tenants/${user.tenantId}/users/${user.id}`);
      toast.success(`Tenant staff user "${user.fullName}" deleted.`);
      loadData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete tenant user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="User Directory"
          description="Manage platform administrators and client organization staff members."
        />
        {activeTab === "admin" && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            + Invite Platform Admin
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Segment Switcher Tabs */}
        <div className="flex rounded-xl bg-surface-secondary p-1 border border-border-main">
          <button
            onClick={() => {
              setActiveTab("admin");
              setSearch("");
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === "admin"
                ? "bg-brand-gold text-zinc-900 shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <Shield className="h-4 w-4" /> Platform Admins ({adminUsers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("tenant");
              setSearch("");
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === "tenant"
                ? "bg-brand-gold text-zinc-900 shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <Users className="h-4 w-4" /> Client Staff ({tenantUsers.length})
          </button>
        </div>

        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder={activeTab === "admin" ? "Search admins by name or email..." : "Search staff by name, email, or tenant..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 pl-10 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
        </div>
      </div>

      {activeTab === "tenant" && (
        <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-4 text-xs text-sky-400">
          💡 <strong>Notice:</strong> Client Staff & Tenant User accounts below are created for logging into the <strong>PMS SaaS tenant application</strong>. Only accounts under <strong>Platform Admins</strong> can log into this PMS Admin management portal.
        </div>
      )}

      {/* PLATFORM ADMINS TABLE */}
      {activeTab === "admin" && (
        <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main bg-surface text-text-primary">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                      Loading platform admins...
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                      {search ? `No admins found matching "${search}"` : "No admin users found."}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-surface-hover group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-text-primary">{user.fullName}</p>
                          <p className="text-xs text-text-tertiary">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        <span className="rounded-md bg-badge-muted-bg px-2.5 py-1 text-xs font-semibold text-badge-muted-text uppercase tracking-wide">
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-tertiary">{formatLastLogin(user.lastLoginAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditUser(user)}
                            className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                            title="Edit Role & Status"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteAdminTarget(user)}
                            className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TENANT STAFF TABLE */}
      {activeTab === "tenant" && (
        <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Staff User</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant Organization</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Added Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main bg-surface text-text-primary">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                      Loading client staff members...
                    </td>
                  </tr>
                ) : filteredTenantUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                      {search ? `No staff users matching "${search}"` : "No tenant staff users registered."}
                    </td>
                  </tr>
                ) : (
                  filteredTenantUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-surface-hover group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-text-primary">{user.fullName}</p>
                          <p className="text-xs text-text-tertiary">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        <p className="font-medium">{user.tenant?.name ?? "—"}</p>
                        {user.tenant?.subdomain && (
                          <p className="text-xs font-mono text-text-tertiary">
                            {user.tenant.subdomain}.pms.com
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-tertiary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteTenantUser(user)}
                          className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                          title="Remove Staff Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITE USER MODAL */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onCreated={loadData}
      />

      {/* EDIT ADMIN USER MODAL */}
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} onUpdated={loadData} />

      {/* DELETE ADMIN CONFIRMATION */}
      {deleteAdminTarget && (
        <Modal
          isOpen={!!deleteAdminTarget}
          onClose={() => setDeleteAdminTarget(null)}
          title={`Delete Admin Account "${deleteAdminTarget.fullName}"?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete platform admin account for{" "}
              <strong className="text-text-primary">{deleteAdminTarget.email}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteAdminTarget(null)}
                className="rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAdmin}
                disabled={isDeleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InviteUserModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/users", { fullName, email, password, role });
      toast.success(`Invited ${fullName}.`);
      reset();
      onClose();
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to invite user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Platform Administrator">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Full Name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Email Address</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Temporary Password</label>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Inviting..." : "Invite User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [role, setRole] = useState<UserRole>("admin");
  const [status, setStatus] = useState<UserStatus>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch(`/users/${user.id}`, { role, status });
      toast.success(`Updated ${user.fullName}.`);
      onClose();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!user} onClose={onClose} title={`Edit ${user.fullName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}


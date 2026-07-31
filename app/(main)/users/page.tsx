"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<AdminUser[]>("/users");
      setUsers(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="User Management"
          description="Manage SaaS portal administrators and their roles."
        />
        <button
          onClick={() => setIsInviteOpen(true)}
          className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          + Invite User
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 pl-10 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

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
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    {search ? `No users found matching "${search}"` : "No admin users yet."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-surface-hover group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{user.fullName}</p>
                        <p className="text-xs text-text-tertiary">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      <span className="rounded-md bg-badge-muted-bg px-2 py-1 text-xs font-medium text-badge-muted-text uppercase tracking-wide">
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
                      <button
                        onClick={() => setEditUser(user)}
                        className="text-sm font-medium text-pawn-gold hover:text-pawn-gold-light opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onCreated={loadUsers}
      />

      <EditUserModal user={editUser} onClose={() => setEditUser(null)} onUpdated={loadUsers} />
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
    <Modal isOpen={isOpen} onClose={onClose} title="Invite User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Full Name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-secondary">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
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
            className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-gold focus:ring-1 focus:ring-pawn-gold"
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

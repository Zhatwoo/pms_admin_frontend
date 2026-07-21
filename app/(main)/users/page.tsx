"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

type UserRole = "super_admin" | "admin";
type UserStatus = "Active" | "Pending" | "Suspended";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

const mockUsers: AdminUser[] = [
  {
    id: "u-1",
    fullName: "System Admin",
    email: "admin@example.com",
    role: "super_admin",
    status: "Active",
    lastLogin: "Just now",
  },
  {
    id: "u-2",
    fullName: "Support Lead",
    email: "support@example.com",
    role: "admin",
    status: "Active",
    lastLogin: "2 hours ago",
  },
  {
    id: "u-3",
    fullName: "John Doe",
    email: "johndoe@example.com",
    role: "admin",
    status: "Pending",
    lastLogin: "Never",
  },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="User Management" 
          description="Manage SaaS portal administrators and their roles." 
        />
        <button className="whitespace-nowrap rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 active:scale-[0.98]">
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    No users found matching "{search}"
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
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.status === "Active" 
                          ? "bg-emerald-surface text-emerald-text border border-emerald-border"
                          : user.status === "Suspended"
                          ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30"
                          : "bg-badge-muted-bg text-badge-muted-text border border-border-main"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-tertiary">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-pawn-gold hover:text-pawn-gold-light opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}

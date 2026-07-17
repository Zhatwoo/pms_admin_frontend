"use client";

// ═══════════════════════════════════════════════════════════
// Client Management — Independent Workspace Layout
// Completely separate from PMS AppLayout.
// Auth-guarded: only super_admin can access.
// ═══════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { CMSidebar } from "./_components/layout/cm-sidebar";
import { CMHeader } from "./_components/layout/cm-header";
import "../../styles/client-management-tokens.css";

export default function ClientManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!isLoading && user && user.role !== "super_admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  // Show nothing until auth is resolved
  if (isLoading || !user || user.role !== "super_admin") {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--cm-bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--cm-border)", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "var(--cm-text-muted)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--cm-bg)" }}>
      {/* Sidebar */}
      <CMSidebar />

      {/* Main content area */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* Header */}
        <CMHeader />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8"
          style={{ background: "var(--cm-bg)" }}
        >
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

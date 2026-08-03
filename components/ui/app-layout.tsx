"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { getNavForRole } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || (!user && mounted)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  const role = user?.role || "super_admin";
  const navGroups = getNavForRole(role);

  const handleMobileNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        navGroups={navGroups}
        collapsed={isSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleMobileNavigation}
        userName={user?.fullName || "Admin"}
        userRole={role}
        userAvatarUrl={user?.avatarUrl}
        onLogout={logout}
      />

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        <Header
          onMenuClick={() => setIsMobileMenuOpen(true)}
          userName={user?.fullName || "Admin"}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface-secondary">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div
              className={`transition-opacity duration-300 ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

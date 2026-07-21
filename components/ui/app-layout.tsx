"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { getNavForRole } from "@/lib/constants";
// Removed useAuth because we are building layout without auth first per user request
// We'll mock the user state for now

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mock user for now
  const mockUser = {
    fullName: "System Admin",
    role: "super_admin" as const,
    avatarUrl: "",
  };

  const navGroups = getNavForRole(mockUser.role);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMobileNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log("Mock logout");
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
        userName={mockUser.fullName}
        userRole={mockUser.role}
        userAvatarUrl={mockUser.avatarUrl}
        onLogout={handleLogout}
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
          userName={mockUser.fullName}
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

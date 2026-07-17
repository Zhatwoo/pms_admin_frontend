"use client";

// ═══════════════════════════════════════════════════════════
// Client Management — Top Header
// ═══════════════════════════════════════════════════════════

import { useAuth } from "@/contexts/auth-context";
import { CMBreadcrumbs } from "./cm-breadcrumbs";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { getInitials } from "../../_lib/utils";

export function CMHeader() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("pms-theme", next ? "dark" : "light");
  };

  const initials = user ? getInitials(user.fullName || user.email) : "SA";

  return (
    <header
      className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl lg:px-6"
      style={{
        background: "var(--cm-header-bg)",
        borderColor: "var(--cm-header-border)",
      }}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <CMBreadcrumbs />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--cm-text-tertiary)" }}
          title="Search (Ctrl+K)"
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cm-surface-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Search size={16} />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--cm-text-tertiary)" }}
          title="Toggle theme"
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cm-surface-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--cm-text-tertiary)" }}
          title="Notifications"
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cm-surface-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Bell size={16} />
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full"
            style={{ background: "var(--cm-error)" }}
          />
        </button>

        {/* Divider */}
        <div className="mx-2 h-6 w-px" style={{ background: "var(--cm-border)" }} />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
            style={{
              background: "var(--cm-accent-light)",
              color: "var(--cm-accent)",
            }}
          >
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium leading-tight" style={{ color: "var(--cm-text-primary)" }}>
              {user?.fullName || "Super Admin"}
            </p>
            <p className="text-[11px] leading-tight" style={{ color: "var(--cm-text-muted)" }}>
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

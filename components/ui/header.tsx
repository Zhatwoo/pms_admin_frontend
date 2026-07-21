"use client";

import { useTheme } from "@/contexts/theme-context";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { BellIcon, MenuIcon } from "@/lib/icons";

interface HeaderProps {
  onMenuClick: () => void;
  userName?: string;
  isSidebarCollapsed: boolean;
}

export function Header({
  onMenuClick,
  userName,
  isSidebarCollapsed,
}: HeaderProps) {
  const { isDark } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-border-main bg-header-bg/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-text-tertiary hover:bg-surface-hover hover:text-text-primary"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </div>
      
      <div className="hidden lg:flex flex-1" />

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          
          <button
            type="button"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-tertiary transition-all duration-300 hover:bg-surface-hover hover:text-pawn-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pawn-gold/60 focus-visible:ring-offset-2"
            aria-label="View notifications"
          >
            <BellIcon />
            <span className="absolute right-2.5 top-2.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </span>
          </button>
        </div>

        <div className="h-8 w-px bg-border-main" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-text-primary">
              {userName || "Admin User"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

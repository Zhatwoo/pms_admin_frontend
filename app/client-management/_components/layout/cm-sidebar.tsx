"use client";

// ═══════════════════════════════════════════════════════════
// Client Management — Workspace Sidebar
// Slate/Indigo design, independent from PMS sidebar.
// ═══════════════════════════════════════════════════════════

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, Package, Receipt, TrendingUp,
  ArrowLeftRight, FileText, BarChart3, HardDrive, Activity,
  LifeBuoy, ClipboardList, Megaphone, HeartPulse, Settings,
  ChevronLeft, ChevronRight, ArrowLeft, Zap,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/client-management", icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: "Client Management",
    items: [
      { label: "Clients", href: "/client-management/clients", icon: <Users size={18} /> },
      { label: "Subscriptions", href: "/client-management/subscriptions", icon: <CreditCard size={18} /> },
      { label: "Plans", href: "/client-management/plans", icon: <Package size={18} /> },
    ],
  },
  {
    title: "Financial",
    items: [
      { label: "Billing & Revenue", href: "/client-management/billing", icon: <Receipt size={18} /> },
      { label: "Transactions", href: "/client-management/transactions", icon: <ArrowLeftRight size={18} /> },
      { label: "Invoices", href: "/client-management/invoices", icon: <FileText size={18} /> },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Usage Analytics", href: "/client-management/analytics", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Support Tickets", href: "/client-management/support", icon: <LifeBuoy size={18} /> },
      { label: "Announcements", href: "/client-management/announcements", icon: <Megaphone size={18} /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "System Health", href: "/client-management/system-health", icon: <HeartPulse size={18} /> },
      { label: "Settings", href: "/client-management/settings", icon: <Settings size={18} /> },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/client-management") {
    return pathname === "/client-management";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function CMSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCompact = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden"
        style={{
          background: "var(--cm-surface)",
          borderColor: "var(--cm-border)",
          color: "var(--cm-text-primary)",
        }}
      >
        <LayoutDashboard size={18} />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 ease-out lg:static lg:z-auto ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${isCompact ? "w-[68px]" : "w-[260px]"}`}
        style={{
          background: "var(--cm-sidebar-bg)",
          borderRight: "1px solid var(--cm-sidebar-border)",
        }}
      >
        {/* Brand Header */}
        <div className={`flex items-center gap-3 border-b px-4 py-4 ${isCompact ? "justify-center" : ""}`} style={{ borderColor: "var(--cm-sidebar-border)" }}>
          {!isCompact && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--cm-sidebar-text)" }}
              title="Back to PMS"
            >
              <ArrowLeft size={14} />
              <span>Back to PMS</span>
            </Link>
          )}
          {isCompact && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center transition-colors hover:opacity-80"
              style={{ color: "var(--cm-sidebar-text)" }}
              title="Back to PMS"
            >
              <ArrowLeft size={16} />
            </Link>
          )}
          {!isCompact && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md transition-colors"
              style={{ color: "var(--cm-sidebar-text)" }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Brand Badge */}
        <div className={`border-b px-4 py-3 ${isCompact ? "flex justify-center" : ""}`} style={{ borderColor: "var(--cm-sidebar-border)" }}>
          {isCompact ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "var(--cm-accent)", color: "#fff" }}
              aria-label="Expand sidebar"
            >
              <Zap size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "var(--cm-accent)", color: "#fff" }}
              >
                <Zap size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--cm-sidebar-text-active)" }}>
                  Client Management
                </p>
                <p className="text-[11px]" style={{ color: "var(--cm-sidebar-section)" }}>
                  SaaS Administration
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              {!isCompact && (
                <p
                  className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--cm-sidebar-section)" }}
                >
                  {section.title}
                </p>
              )}
              {isCompact && (
                <div
                  className="mx-auto my-2 h-px w-6"
                  style={{ background: "var(--cm-sidebar-border)" }}
                />
              )}
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={isCompact ? item.label : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                        isCompact ? "justify-center px-0" : ""
                      }`}
                      style={{
                        background: active ? "var(--cm-sidebar-active)" : "transparent",
                        color: active ? "var(--cm-sidebar-text-active)" : "var(--cm-sidebar-text)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "var(--cm-sidebar-hover)";
                          e.currentTarget.style.color = "var(--cm-sidebar-text-active)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--cm-sidebar-text)";
                        }
                      }}
                    >
                      <span className="flex-shrink-0" style={{ color: active ? "var(--cm-accent)" : undefined }}>
                        {item.icon}
                      </span>
                      {!isCompact && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only, when collapsed) */}
        {isCompact && (
          <div className="border-t p-2" style={{ borderColor: "var(--cm-sidebar-border)" }}>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex w-full items-center justify-center rounded-lg py-2 transition-colors"
              style={{ color: "var(--cm-sidebar-text)" }}
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

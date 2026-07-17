"use client";

// ═══════════════════════════════════════════════════════════
// Drawer — Slide-in panel for detail views
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export function Drawer({ isOpen, onClose, title, subtitle, children, width = "max-w-lg" }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="fixed inset-0 z-50 cursor-default"
            style={{ background: "var(--cm-surface-overlay)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col ${width}`}
            style={{
              background: "var(--cm-surface)",
              borderLeft: "1px solid var(--cm-border)",
              boxShadow: "var(--cm-shadow-xl)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between border-b px-6 py-4"
                style={{ borderColor: "var(--cm-border)" }}
              >
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--cm-text-primary)" }}>
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-0.5 text-sm" style={{ color: "var(--cm-text-tertiary)" }}>
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ color: "var(--cm-text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cm-surface-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

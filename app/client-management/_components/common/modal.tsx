"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal dialog */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 overflow-y-auto">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className={`relative w-full ${width} rounded-2xl border shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95`}
          style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b px-6 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--cm-text-primary)" }}>
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm" style={{ color: "var(--cm-text-tertiary)" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: "var(--cm-text-muted)" }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6 scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

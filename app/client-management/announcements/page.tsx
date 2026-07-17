"use client";

// ═══════════════════════════════════════════════════════════
// Announcements Page
// ═══════════════════════════════════════════════════════════

import { PageHeader } from "../_components/common/page-header";
import { MOCK_ANNOUNCEMENTS } from "../_lib/mock-data";
import { ANNOUNCEMENT_TYPE_LABELS } from "../_lib/constants";
import { formatDateTime } from "../_lib/utils";
import { Plus, Megaphone, Info, AlertTriangle, PenTool, CalendarClock } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Broadcast messages, updates, and maintenance notices to clients."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ background: "var(--cm-accent)" }}
          >
            <Plus size={14} />
            New Announcement
          </button>
        }
      />

      <div className="grid gap-4">
        {MOCK_ANNOUNCEMENTS.map((announcement) => {
          const isWarning = announcement.type === "warning" || announcement.type === "maintenance";
          const Icon = isWarning ? AlertTriangle : announcement.type === "feature" ? Megaphone : Info;
          
          return (
            <div
              key={announcement.id}
              className="flex gap-4 rounded-xl border p-5 transition-colors"
              style={{
                background: "var(--cm-surface)",
                borderColor: "var(--cm-border)",
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: isWarning ? "var(--cm-warning-light)" : "var(--cm-accent-light)",
                  color: isWarning ? "var(--cm-warning)" : "var(--cm-accent)",
                }}
              >
                <Icon size={18} />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "var(--cm-text-primary)" }}>
                      {announcement.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--cm-text-muted)" }}>
                      <span className="inline-flex items-center gap-1">
                        <PenTool size={12} />
                        {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
                      </span>
                      {announcement.isPublished && announcement.publishedAt ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock size={12} />
                          Published {formatDateTime(announcement.publishedAt)}
                        </span>
                      ) : (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--cm-accent)" }}
                  >
                    Edit
                  </button>
                </div>
                
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--cm-text-secondary)" }}>
                  {announcement.content}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {announcement.targetPlans.map((plan) => (
                    <span
                      key={plan}
                      className="rounded-md border px-2 py-0.5 text-[11px] capitalize"
                      style={{ borderColor: "var(--cm-border)", color: "var(--cm-text-tertiary)" }}
                    >
                      {plan}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

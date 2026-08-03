"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Eye } from "lucide-react";

type AuditAction = "create" | "update" | "delete" | "login" | "logout";

interface AuditLog {
  id: string;
  actorEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditLogResponse {
  data: AuditLog[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const ACTION_STYLES: Record<AuditAction, string> = {
  create: "bg-emerald-surface text-emerald-text border border-emerald-border",
  update: "bg-sky-500/10 text-sky-500 border border-sky-500/30",
  delete: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30",
  login: "bg-badge-muted-bg text-badge-muted-text border border-border-main",
  logout: "bg-badge-muted-bg text-badge-muted-text border border-border-main",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [meta, setMeta] = useState<AuditLogResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (actionFilter !== "all") params.set("action", actionFilter);
        const res = await api.get<AuditLogResponse>(`/audit-logs?${params.toString()}`);
        setLogs(res.data);
        setMeta(res.meta);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [page, actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Audit Logs"
          description="System-wide audit trail of SaaS administrative actions."
        />

        {/* Action Filter Pills */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-surface-secondary p-1 border border-border-main">
          {["all", "create", "update", "delete", "login", "logout"].map((act) => (
            <button
              key={act}
              onClick={() => {
                setActionFilter(act);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                actionFilter === act
                  ? "bg-brand-gold text-zinc-900 shadow-sm"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border-main bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Actor</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Resource</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    No audit activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-surface-hover group">
                    <td className="px-6 py-4 text-text-tertiary whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{log.actorEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ACTION_STYLES[log.action]}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-mono text-xs">
                      {log.resourceType}
                      {log.resourceId && (
                        <span className="ml-1 text-text-tertiary font-normal">
                          #{log.resourceId.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-tertiary max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1 text-text-tertiary hover:text-brand-gold transition-colors"
                        title="View Full Metadata"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-main px-6 py-4">
            <p className="text-sm text-text-tertiary">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-border-main bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-border-main bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AUDIT LOG DETAILS MODAL */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Log Record #${selectedLog.id.slice(0, 8).toUpperCase()}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-surface-secondary p-3 rounded-lg border border-border-main">
              <div>
                <p className="text-text-tertiary text-xs">Actor</p>
                <p className="font-semibold text-text-primary text-xs">{selectedLog.actorEmail}</p>
              </div>
              <div>
                <p className="text-text-tertiary text-xs">Timestamp</p>
                <p className="font-semibold text-text-primary text-xs">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-text-tertiary text-xs">Action</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${ACTION_STYLES[selectedLog.action]}`}>
                  {selectedLog.action}
                </span>
              </div>
              <div>
                <p className="text-text-tertiary text-xs">Resource Type</p>
                <p className="font-mono text-text-primary text-xs">{selectedLog.resourceType}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-text-primary text-xs mb-2">Event Metadata (JSON)</p>
              <pre className="p-4 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-border-main">
                {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-brand-gold px-4 py-2 text-xs font-semibold text-zinc-900 hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


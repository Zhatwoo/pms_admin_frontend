"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

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
  const [meta, setMeta] = useState<AuditLogResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.get<AuditLogResponse>(`/audit-logs?page=${page}&limit=20`);
        setLogs(res.data);
        setMeta(res.meta);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="System-wide audit trail of SaaS administrative actions."
      />

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
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-surface text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    No audit activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-6 py-4 text-text-tertiary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{log.actorEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ACTION_STYLES[log.action]}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {log.resourceType}
                      {log.resourceId && (
                        <span className="ml-1 text-xs text-text-tertiary">
                          #{log.resourceId.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-tertiary max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
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
    </div>
  );
}

"use client";

// ═══════════════════════════════════════════════════════════
// Support Tickets Page
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "../_components/common/page-header";
import { DataTable } from "../_components/common/data-table";
import { StatusBadge } from "../_components/common/status-badge";
import { MOCK_TICKETS } from "../_lib/mock-data";
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from "../_lib/constants";
import { formatRelativeTime } from "../_lib/utils";
import type { SupportTicket } from "../_lib/types";
import { Search } from "lucide-react";

export default function SupportTicketsPage() {
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    if (!search) return MOCK_TICKETS;
    const lower = search.toLowerCase();
    return MOCK_TICKETS.filter((t) =>
      t.ticketNumber.toLowerCase().includes(lower) ||
      t.clientName.toLowerCase().includes(lower) ||
      t.subject.toLowerCase().includes(lower)
    );
  }, [search]);

  const columns: ColumnDef<SupportTicket, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "ticketNumber",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="text-xs font-medium" style={{ color: "var(--cm-text-muted)" }}>
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[300px]">
            <p className="truncate text-sm font-medium" style={{ color: "var(--cm-text-primary)" }}>
              {row.original.subject}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--cm-text-muted)" }}>
              {row.original.clientName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const p = row.original.priority;
          const colors = TICKET_PRIORITY_COLORS[p];
          return (
            <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
              {TICKET_PRIORITY_LABELS[p]}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          return <StatusBadge status={TICKET_STATUS_LABELS[s]} colors={TICKET_STATUS_COLORS[s]} />;
        },
      },
      {
        accessorKey: "assignedTo",
        header: "Assignee",
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return (
            <span className="text-sm" style={{ color: val ? "var(--cm-text-secondary)" : "var(--cm-text-muted)" }}>
              {val || "Unassigned"}
            </span>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ getValue }) => (
          <span className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            {formatRelativeTime(getValue() as string)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Manage client issues and requests." />

      <div
        className="flex items-center gap-3 rounded-xl border p-3"
        style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
      >
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-text-muted)" }} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
            style={{ background: "var(--cm-input-bg)", borderColor: "var(--cm-input-border)", color: "var(--cm-text-primary)" }}
          />
        </div>
      </div>

      <DataTable columns={columns} data={data} pageSize={15} />
    </div>
  );
}

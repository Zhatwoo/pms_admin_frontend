"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/lib/api";
import { useBranch } from "@/contexts/branch-context";
import { PaginationFooter } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";

interface PawnTicketItem {
  id: string;
  item_name: string | null;
  item_id: string | null;
  unit_code: string | null;
  serial_number: string | null;
  amount: number | string | null;
  pawn_date: string | null;
  status: string;
  branch_id: string;
  customer?: { id: string; full_name: string; contact_number?: string | null } | null;
  branch?: { name: string } | null;
}

const ITEMS_PER_PAGE = 20;

function statusVariant(status: string): "green" | "yellow" | "red" {
  const s = status.toLowerCase();
  if (s === "active") return "green";
  if (s === "redeemed") return "yellow";
  return "red";
}

export default function PawnTicketPage() {
  const { selectedBranch, isAllBranches } = useBranch();
  const [tickets, setTickets] = useState<PawnTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (!isAllBranches) params.set("branch", selectedBranch.id);
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const data = await api.get<PawnTicketItem[]>(`/pawn-tickets?${params}`);
      setTickets(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pawn tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch.id, isAllBranches, statusFilter, search]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedBranch.id]);

  const totalPages = Math.max(1, Math.ceil(tickets.length / ITEMS_PER_PAGE));
  const paginatedTickets = useMemo(
    () => tickets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [tickets, currentPage],
  );

  const statuses = ["All", "Active", "Redeemed", "Expired"];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-tertiary">
          View and audit pawn tickets across all branches.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, unit code, serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-border-main bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-emerald-500 w-72"
        />
        <div className="inline-flex rounded-lg border border-border-main bg-surface">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                s === statusFilter
                  ? "bg-pawn-sidebar text-white"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-text-muted">
          {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border-main bg-surface px-4 py-10 text-center text-sm text-text-tertiary">
          Loading pawn tickets...
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-main bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="bg-emerald-900 text-amber-400">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Unit Code</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Item</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Serial No.</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Customer</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Branch</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">Amount</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Pawn Date</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-tertiary">
                      No pawn tickets found.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-border-subtle bg-surface-secondary transition-colors hover:bg-emerald-surface/60">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-emerald-text">
                        {ticket.unit_code || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                        {ticket.item_name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-secondary font-mono text-xs">
                        {ticket.serial_number || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                        {ticket.customer?.full_name || "Walk-in"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                        {ticket.branch?.name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">
                        ₱{Number(ticket.amount ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                        {ticket.pawn_date
                          ? new Date(ticket.pawn_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge label={ticket.status} variant={statusVariant(ticket.status)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tickets.length > ITEMS_PER_PAGE && (
        <div className="overflow-hidden rounded-lg border border-border-main bg-surface">
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={tickets.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            className="border-t-0"
          />
        </div>
      )}
    </div>
  );
}

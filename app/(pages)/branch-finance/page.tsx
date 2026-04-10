"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useBranch } from "@/contexts/branch-context";
import { BalanceOverview } from "./_components/balance-overview";
import type { BranchBalance } from "./_components/balance-overview";
import { ActionButtons } from "./_components/action-buttons";
import { AddFundsModal } from "./_components/add-funds-modal";
import type { AddFundsResult, Manager } from "./_components/add-funds-modal";
import { TransferFundsModal } from "./_components/transfer-funds-modal";
import type { TransferFundsResult } from "./_components/transfer-funds-modal";
import { TransactionFilters } from "./_components/transaction-filters";
import { TransactionTable } from "./_components/transaction-table";
import type { FinanceTransaction } from "./_components/transaction-table";
import { ApprovalPanel } from "./_components/approval-panel";
import type { ApprovalRequest } from "./_components/approval-panel";

/* ══════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════ */
const MOCK_BALANCES: BranchBalance[] = [
  {
    branchId: "001",
    name: "Main Branch",
    startingBalance: 500_000,
    currentBalance: 485_000,
    totalAdded: 150_000,
    totalTransferred: 165_000,
    lastUpdated: "2026-04-10T08:00:00Z",
    status: "Active",
  },
  {
    branchId: "002",
    name: "BGC Branch",
    startingBalance: 300_000,
    currentBalance: 342_000,
    totalAdded: 80_000,
    totalTransferred: 38_000,
    lastUpdated: "2026-04-10T09:30:00Z",
    status: "Active",
  },
  {
    branchId: "003",
    name: "Makati Branch",
    startingBalance: 250_000,
    currentBalance: 273_500,
    totalAdded: 45_000,
    totalTransferred: 21_500,
    lastUpdated: "2026-04-09T16:45:00Z",
    status: "Active",
  },
  {
    branchId: "004",
    name: "Quezon City Branch",
    startingBalance: 200_000,
    currentBalance: 188_000,
    totalAdded: 30_000,
    totalTransferred: 42_000,
    lastUpdated: "2026-04-09T14:20:00Z",
    status: "Active",
  },
];

const MOCK_MANAGERS: Record<string, Manager[]> = {
  "001": [{ id: "mgr-001", name: "Juan Dela Cruz", role: "admin" }],
  "002": [
    { id: "mgr-002", name: "Maria Santos", role: "admin" },
    { id: "mgr-003", name: "Pedro Reyes", role: "admin" },
  ],
  "003": [{ id: "mgr-004", name: "Ana Garcia", role: "admin" }],
  "004": [
    { id: "mgr-005", name: "Carlos Rivera", role: "admin" },
    { id: "mgr-006", name: "Rosa Aquino", role: "admin" },
  ],
};

const INITIAL_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: "TXN-001",
    date: "2026-04-10",
    branch: "Main Branch",
    branchId: "001",
    type: "ADD_FUNDS",
    amount: 50_000,
    balanceAfter: 535_000,
    status: "Approved",
    approvedBy: "Juan Dela Cruz",
    approvalDate: "2026-04-10",
    notes: "Weekly fund allocation",
  },
  {
    id: "TXN-002",
    date: "2026-04-09",
    branch: "Main Branch",
    branchId: "001",
    type: "TRANSFER_OUT",
    amount: 20_000,
    balanceAfter: 485_000,
    status: "Approved",
    approvedBy: "Juan Dela Cruz",
    approvalDate: "2026-04-09",
    notes: "Transfer to BGC Branch",
  },
  {
    id: "TXN-003",
    date: "2026-04-09",
    branch: "BGC Branch",
    branchId: "002",
    type: "TRANSFER_IN",
    amount: 20_000,
    balanceAfter: 342_000,
    status: "Approved",
    approvedBy: "Maria Santos",
    approvalDate: "2026-04-09",
    notes: "Received from Main Branch",
  },
  {
    id: "TXN-004",
    date: "2026-04-10",
    branch: "BGC Branch",
    branchId: "002",
    type: "ADD_FUNDS",
    amount: 75_000,
    balanceAfter: 417_000,
    status: "Pending",
    approvedBy: null,
    approvalDate: null,
    notes: "Emergency fund request",
  },
  {
    id: "TXN-005",
    date: "2026-04-08",
    branch: "Makati Branch",
    branchId: "003",
    type: "ADD_FUNDS",
    amount: 25_000,
    balanceAfter: 273_500,
    status: "Approved",
    approvedBy: "Ana Garcia",
    approvalDate: "2026-04-08",
    notes: "Monthly replenishment",
  },
  {
    id: "TXN-006",
    date: "2026-04-08",
    branch: "Quezon City Branch",
    branchId: "004",
    type: "TRANSFER_OUT",
    amount: 15_000,
    balanceAfter: 188_000,
    status: "Approved",
    approvedBy: "Carlos Rivera",
    approvalDate: "2026-04-08",
    notes: "Emergency transfer to Makati",
  },
  {
    id: "TXN-007",
    date: "2026-04-08",
    branch: "Makati Branch",
    branchId: "003",
    type: "TRANSFER_IN",
    amount: 15_000,
    balanceAfter: 288_500,
    status: "Approved",
    approvedBy: "Ana Garcia",
    approvalDate: "2026-04-08",
    notes: "Received from QC Branch",
  },
  {
    id: "TXN-008",
    date: "2026-04-10",
    branch: "Main Branch",
    branchId: "001",
    type: "TRANSFER_OUT",
    amount: 30_000,
    balanceAfter: 455_000,
    status: "Pending",
    approvedBy: null,
    approvalDate: null,
    notes: "Transfer to Quezon City Branch",
  },
  {
    id: "TXN-009",
    date: "2026-04-07",
    branch: "BGC Branch",
    branchId: "002",
    type: "ADD_FUNDS",
    amount: 40_000,
    balanceAfter: 322_000,
    status: "Rejected",
    approvedBy: "Maria Santos",
    approvalDate: "2026-04-07",
    notes: "Budget not approved by HQ",
  },
  {
    id: "TXN-010",
    date: "2026-04-07",
    branch: "Quezon City Branch",
    branchId: "004",
    type: "ADD_FUNDS",
    amount: 60_000,
    balanceAfter: 248_000,
    status: "Pending",
    approvedBy: null,
    approvalDate: null,
    notes: "Large cash replenishment",
  },
];

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: "APR-001",
    type: "ADD_FUNDS",
    amount: 75_000,
    requestedBy: "Super Admin",
    branch: "BGC Branch",
    date: "2026-04-10",
    requiredApprovers: 2,
    currentApprovals: 0,
    notes: "Emergency fund request",
  },
  {
    id: "APR-002",
    type: "TRANSFER_OUT",
    amount: 30_000,
    requestedBy: "Super Admin",
    branch: "Main Branch",
    date: "2026-04-10",
    requiredApprovers: 1,
    currentApprovals: 0,
    notes: "Transfer to Quezon City Branch",
  },
  {
    id: "APR-003",
    type: "ADD_FUNDS",
    amount: 60_000,
    requestedBy: "Super Admin",
    branch: "Quezon City Branch",
    date: "2026-04-07",
    requiredApprovers: 2,
    currentApprovals: 1,
    notes: "Large cash replenishment",
  },
];

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function BranchFinancePage() {
  const { user } = useAuth();
  const { selectedBranch, isAllBranches } = useBranch();

  // State
  const [balances, setBalances] = useState<BranchBalance[]>(MOCK_BALANCES);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(INITIAL_TRANSACTIONS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);

  // Modals
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // Current branch info
  const currentBranchId = isAllBranches ? "001" : selectedBranch.id;
  const currentBranchName = isAllBranches
    ? "All Branches"
    : selectedBranch.name;

  const getManagersForBranch = useCallback(
    (branchId: string): Manager[] => MOCK_MANAGERS[branchId] || [],
    [],
  );

  const currentManagers = useMemo(
    () => getManagersForBranch(currentBranchId),
    [currentBranchId, getManagersForBranch],
  );

  // Scoped balances based on branch selection
  const scopedBalances = useMemo(() => {
    if (isAllBranches) return balances;
    return balances.filter((b) => b.branchId === selectedBranch.id);
  }, [balances, isAllBranches, selectedBranch.id]);

  // Scoped transactions
  const scopedTransactions = useMemo(() => {
    if (isAllBranches) return transactions;
    return transactions.filter((t) => t.branchId === selectedBranch.id);
  }, [transactions, isAllBranches, selectedBranch.id]);

  // Generate unique txn ID
  function nextTxnId() {
    return `TXN-${String(transactions.length + 1).padStart(3, "0")}`;
  }

  function nextAprId() {
    return `APR-${String(approvals.length + 1).padStart(3, "0")}`;
  }

  /* ── Add Funds ──────────────────────────────────────── */
  function handleAddFunds(data: AddFundsResult) {
    const branch = balances.find((b) => b.branchId === currentBranchId);
    if (!branch) return;

    const newTxn: FinanceTransaction = {
      id: nextTxnId(),
      date: new Date().toISOString().slice(0, 10),
      branch: branch.name,
      branchId: branch.branchId,
      type: "ADD_FUNDS",
      amount: data.amount,
      balanceAfter: branch.currentBalance + data.amount,
      status: "Pending",
      approvedBy: null,
      approvalDate: null,
      notes: data.notes || "Fund addition",
    };

    const newApproval: ApprovalRequest = {
      id: nextAprId(),
      type: "ADD_FUNDS",
      amount: data.amount,
      requestedBy: user?.fullName || "Super Admin",
      branch: branch.name,
      date: new Date().toISOString().slice(0, 10),
      requiredApprovers: data.requireAll ? data.approvers.length : 1,
      currentApprovals: 0,
      notes: data.notes || "",
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setApprovals((prev) => [newApproval, ...prev]);
    showToast("Fund request submitted for approval");
  }

  /* ── Transfer Funds ─────────────────────────────────── */
  function handleTransfer(data: TransferFundsResult) {
    const fromBranch = balances.find((b) => b.branchId === data.fromBranchId);
    const toBranch = balances.find((b) => b.branchId === data.toBranchId);
    if (!fromBranch || !toBranch) return;

    const txnOut: FinanceTransaction = {
      id: nextTxnId(),
      date: new Date().toISOString().slice(0, 10),
      branch: fromBranch.name,
      branchId: fromBranch.branchId,
      type: "TRANSFER_OUT",
      amount: data.amount,
      balanceAfter: fromBranch.currentBalance - data.amount,
      status: "Pending",
      approvedBy: null,
      approvalDate: null,
      notes: `Transfer to ${toBranch.name}${data.notes ? ` — ${data.notes}` : ""}`,
    };

    const txnIn: FinanceTransaction = {
      id: `${nextTxnId()}-IN`,
      date: new Date().toISOString().slice(0, 10),
      branch: toBranch.name,
      branchId: toBranch.branchId,
      type: "TRANSFER_IN",
      amount: data.amount,
      balanceAfter: toBranch.currentBalance + data.amount,
      status: "Pending",
      approvedBy: null,
      approvalDate: null,
      notes: `Received from ${fromBranch.name}${data.notes ? ` — ${data.notes}` : ""}`,
    };

    const newApproval: ApprovalRequest = {
      id: nextAprId(),
      type: "TRANSFER_OUT",
      amount: data.amount,
      requestedBy: user?.fullName || "Super Admin",
      branch: fromBranch.name,
      date: new Date().toISOString().slice(0, 10),
      requiredApprovers: data.approvers.length > 1 ? data.approvers.length : 1,
      currentApprovals: 0,
      notes: `To ${toBranch.name}${data.notes ? ` — ${data.notes}` : ""}`,
    };

    setTransactions((prev) => [txnIn, txnOut, ...prev]);
    setApprovals((prev) => [newApproval, ...prev]);
    showToast("Transfer request submitted for approval");
  }

  /* ── Approve / Reject ───────────────────────────────── */
  function handleApprove(approvalId: string) {
    setApprovals((prev) => {
      const req = prev.find((a) => a.id === approvalId);
      if (!req) return prev;

      const newApprovals = req.currentApprovals + 1;
      const isFullyApproved = newApprovals >= req.requiredApprovers;

      if (isFullyApproved) {
        // Update transactions to Approved
        setTransactions((txns) =>
          txns.map((t) => {
            const matchesBranch = t.branch === req.branch;
            const matchesType =
              t.type === req.type ||
              (req.type === "TRANSFER_OUT" && (t.type === "TRANSFER_OUT" || t.type === "TRANSFER_IN"));
            const matchesAmount = t.amount === req.amount;
            const isPending = t.status === "Pending";

            if (matchesBranch && matchesType && matchesAmount && isPending) {
              return {
                ...t,
                status: "Approved" as const,
                approvedBy: user?.fullName || "Manager",
                approvalDate: new Date().toISOString().slice(0, 10),
              };
            }
            // If transfer, also approve the paired TRANSFER_IN
            if (req.type === "TRANSFER_OUT" && t.type === "TRANSFER_IN" && t.amount === req.amount && t.status === "Pending") {
              return {
                ...t,
                status: "Approved" as const,
                approvedBy: user?.fullName || "Manager",
                approvalDate: new Date().toISOString().slice(0, 10),
              };
            }
            return t;
          }),
        );

        // Update balances
        setBalances((bals) =>
          bals.map((b) => {
            if (req.type === "ADD_FUNDS" && b.name === req.branch) {
              return {
                ...b,
                currentBalance: b.currentBalance + req.amount,
                totalAdded: b.totalAdded + req.amount,
                lastUpdated: new Date().toISOString(),
              };
            }
            if (req.type === "TRANSFER_OUT") {
              if (b.name === req.branch) {
                return {
                  ...b,
                  currentBalance: b.currentBalance - req.amount,
                  totalTransferred: b.totalTransferred + req.amount,
                  lastUpdated: new Date().toISOString(),
                };
              }
              // Find destination from notes
              const destMatch = req.notes.match(/^To (.+?)(?:\s*—|$)/);
              if (destMatch && b.name === destMatch[1]) {
                return {
                  ...b,
                  currentBalance: b.currentBalance + req.amount,
                  totalAdded: b.totalAdded + req.amount,
                  lastUpdated: new Date().toISOString(),
                };
              }
            }
            return b;
          }),
        );

        // Remove from approvals
        return prev.filter((a) => a.id !== approvalId);
      }

      // Partially approved — update count
      return prev.map((a) =>
        a.id === approvalId ? { ...a, currentApprovals: newApprovals } : a,
      );
    });

    showToast("Request approved successfully");
  }

  function handleReject(approvalId: string) {
    const req = approvals.find((a) => a.id === approvalId);
    if (!req) return;

    // Update transaction status
    setTransactions((txns) =>
      txns.map((t) => {
        const matches =
          t.branch === req.branch &&
          t.amount === req.amount &&
          t.status === "Pending";

        if (matches) {
          return {
            ...t,
            status: "Rejected" as const,
            approvedBy: user?.fullName || "Manager",
            approvalDate: new Date().toISOString().slice(0, 10),
          };
        }
        return t;
      }),
    );

    setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    showToast("Request rejected");
  }

  function clearFilters() {
    setSearchQuery("");
    setBranchFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-300/70 bg-emerald-100/70 px-5 py-3 shadow-xl backdrop-blur-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-emerald-900">{toast}</span>
          </div>
        </div>
      )}

      {/* Page header */}
      <div>
        <p className="mt-1 text-sm text-text-tertiary">
          Manage branch finances, fund allocations, and inter-branch transfers.
        </p>
      </div>

      {/* Section 1: Balance Overview */}
      <BalanceOverview
        isAllBranches={isAllBranches}
        selectedBranchId={currentBranchId}
        balances={scopedBalances}
      />

      {/* Approval Panel */}
      <ApprovalPanel
        requests={approvals}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Section 2: Action Buttons */}
      <ActionButtons
        isAllBranches={isAllBranches}
        onAddFunds={() => setAddFundsOpen(true)}
        onTransferFunds={() => setTransferOpen(true)}
      />

      {/* Section 3: Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-surface text-emerald-text">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-text-primary">Transaction History</h2>
        </div>

        <TransactionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          branches={balances}
          onClearFilters={clearFilters}
        />

        <TransactionTable
          transactions={scopedTransactions}
          searchQuery={searchQuery}
          branchFilter={branchFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      </div>

      {/* Modals */}
      <AddFundsModal
        isOpen={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
        onSubmit={handleAddFunds}
        branchName={currentBranchName}
        managers={currentManagers}
      />

      <TransferFundsModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSubmit={handleTransfer}
        branches={balances}
        currentBranchId={currentBranchId}
        getManagersForBranch={getManagersForBranch}
      />
    </div>
  );
}

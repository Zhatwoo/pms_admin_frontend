"use client";

import { useState, useEffect, useMemo } from "react";
import type { Manager } from "./add-funds-modal";
import type { BranchBalance } from "./balance-overview";

export interface TransferFundsResult {
  fromBranchId: string;
  toBranchId: string;
  amount: number;
  notes: string;
  approvers: string[];
  requireReceivingConfirmation: boolean;
}

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransferFundsResult) => void;
  branches: BranchBalance[];
  currentBranchId: string;
  getManagersForBranch: (branchId: string) => Manager[];
}

const MULTI_APPROVAL_THRESHOLD = 50_000;

export function TransferFundsModal({
  isOpen,
  onClose,
  onSubmit,
  branches,
  currentBranchId,
  getManagersForBranch,
}: TransferFundsModalProps) {
  const [fromBranchId, setFromBranchId] = useState(currentBranchId);
  const [toBranchId, setToBranchId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [requireReceiving, setRequireReceiving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const needsMultiApproval = numericAmount >= MULTI_APPROVAL_THRESHOLD;
  const fromBranch = branches.find((b) => b.branchId === fromBranchId);
  const managers = useMemo(
    () => getManagersForBranch(fromBranchId),
    [fromBranchId, getManagersForBranch],
  );
  const singleAdmin = managers.length === 1;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setFromBranchId(currentBranchId);
      setToBranchId("");
      setAmount("");
      setNotes("");
      setSelectedApprovers([]);
      setRequireReceiving(false);
      setErrors({});
    }
  }, [isOpen, currentBranchId]);

  // Auto-select single admin
  useEffect(() => {
    if (singleAdmin && managers[0]) {
      setSelectedApprovers([managers[0].id]);
    } else {
      setSelectedApprovers([]);
    }
  }, [singleAdmin, managers]);

  const minimumApprovers = useMemo(() => {
    if (needsMultiApproval && managers.length >= 2) return 2;
    return 1;
  }, [needsMultiApproval, managers.length]);

  function toggleApprover(id: string) {
    if (singleAdmin) return;
    setSelectedApprovers((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!fromBranchId) errs.from = "Select source branch";
    if (!toBranchId) errs.to = "Select destination branch";
    if (fromBranchId && toBranchId && fromBranchId === toBranchId)
      errs.to = "Cannot transfer to the same branch";
    if (!amount.trim() || numericAmount <= 0) errs.amount = "Enter a valid amount";
    if (fromBranch && numericAmount > fromBranch.currentBalance)
      errs.amount = `Insufficient balance (available: ₱${fromBranch.currentBalance.toLocaleString("en-PH")})`;
    if (selectedApprovers.length < minimumApprovers)
      errs.approvers = `At least ${minimumApprovers} approver(s) required`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      fromBranchId,
      toBranchId,
      amount: numericAmount,
      notes: notes.trim(),
      approvers: selectedApprovers,
      requireReceivingConfirmation: requireReceiving,
    });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg animate-[fadeInUp_0.25s_ease-out] rounded-xl border border-border-main bg-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4 sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Transfer Funds</h2>
              <p className="text-xs text-text-tertiary">Transfer requires source branch approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                From Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(e.target.value)}
                className={`rounded-lg border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-sidebar ${
                  errors.from ? "border-red-400" : "border-input-border"
                }`}
              >
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.name}
                  </option>
                ))}
              </select>
              {fromBranch && (
                <span className="text-[10px] text-text-muted">
                  Balance: ₱{fromBranch.currentBalance.toLocaleString("en-PH")}
                </span>
              )}
              {errors.from && <span className="text-[10px] text-red-500">{errors.from}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                To Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                className={`rounded-lg border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-pawn-sidebar ${
                  errors.to ? "border-red-400" : "border-input-border"
                }`}
              >
                <option value="">Select branch...</option>
                {branches
                  .filter((b) => b.branchId !== fromBranchId)
                  .map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.name}
                    </option>
                  ))}
              </select>
              {errors.to && <span className="text-[10px] text-red-500">{errors.to}</span>}
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-600">
              <span className="text-xs font-semibold">{fromBranch?.name ?? "—"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span className="text-xs font-semibold">
                {toBranchId ? branches.find((b) => b.branchId === toBranchId)?.name : "—"}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">₱</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="0.00"
                className={`w-full rounded-lg border bg-input-bg py-2 pl-8 pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-pawn-sidebar ${
                  errors.amount ? "border-red-400" : "border-input-border"
                }`}
              />
            </div>
            {errors.amount && <span className="text-[10px] text-red-500">{errors.amount}</span>}
            {numericAmount >= MULTI_APPROVAL_THRESHOLD && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Large amount — requires multi-approval (2 approvers minimum)
              </span>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Reason for transfer..."
              className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-pawn-sidebar resize-none"
            />
          </div>

          {/* Source Branch Approval */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h4 className="text-xs font-bold text-amber-700">
                Source Branch Approval
              </h4>
            </div>

            <div className="space-y-2">
              {managers.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    selectedApprovers.includes(m.id)
                      ? "border-emerald-400/50 bg-emerald-50/80"
                      : "border-border-subtle bg-surface hover:bg-surface-secondary"
                  } ${singleAdmin ? "cursor-not-allowed opacity-75" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedApprovers.includes(m.id)}
                    onChange={() => toggleApprover(m.id)}
                    disabled={singleAdmin}
                    className="h-3.5 w-3.5 rounded accent-emerald-600"
                  />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pawn-sidebar text-[10px] font-bold text-pawn-gold">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{m.name}</p>
                    <p className="text-[10px] text-text-muted capitalize">{m.role}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.approvers && (
              <p className="mt-2 text-[10px] text-red-500">{errors.approvers}</p>
            )}

            {singleAdmin && (
              <p className="mt-2 text-[10px] italic text-text-muted">
                Only one manager — auto-selected.
              </p>
            )}
          </div>

          {/* Receiving confirmation toggle */}
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div
              className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                requireReceiving ? "bg-blue-600" : "bg-zinc-300"
              }`}
              onClick={() => setRequireReceiving(!requireReceiving)}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  requireReceiving ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-[11px] font-medium text-text-secondary">
              Require receiving branch confirmation
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-main bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg border border-blue-600 bg-blue-600 px-5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              Submit Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

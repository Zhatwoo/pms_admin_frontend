"use client";

import { useState, useEffect, useMemo } from "react";

export interface Manager {
  id: string;
  name: string;
  role: string;
}

export interface AddFundsResult {
  amount: number;
  notes: string;
  approvers: string[];
  requireAll: boolean;
}

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddFundsResult) => void;
  branchName: string;
  managers: Manager[];
}

const MULTI_APPROVAL_THRESHOLD = 50_000;

export function AddFundsModal({
  isOpen,
  onClose,
  onSubmit,
  branchName,
  managers,
}: AddFundsModalProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [requireAll, setRequireAll] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const needsMultiApproval = numericAmount >= MULTI_APPROVAL_THRESHOLD;
  const singleAdmin = managers.length === 1;

  // Auto-select single admin
  useEffect(() => {
    if (singleAdmin && managers[0]) {
      setSelectedApprovers([managers[0].id]);
    }
  }, [singleAdmin, managers]);

  // Auto-toggle multi-approval for large amounts
  useEffect(() => {
    if (needsMultiApproval && managers.length >= 2) {
      setRequireAll(true);
    }
  }, [needsMultiApproval, managers.length]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setNotes("");
      setSelectedApprovers(singleAdmin && managers[0] ? [managers[0].id] : []);
      setRequireAll(false);
      setErrors({});
    }
  }, [isOpen, singleAdmin, managers]);

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
    if (!amount.trim() || numericAmount <= 0) errs.amount = "Enter a valid amount";
    if (selectedApprovers.length < minimumApprovers)
      errs.approvers = `At least ${minimumApprovers} approver(s) required${needsMultiApproval ? " (amount ≥ ₱50k)" : ""}`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      amount: numericAmount,
      notes: notes.trim(),
      approvers: selectedApprovers,
      requireAll,
    });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg animate-[fadeInUp_0.25s_ease-out] rounded-xl border border-border-main bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Add Funds</h2>
              <p className="text-xs text-text-tertiary">Funds will require approval before processing</p>
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
          {/* Branch */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Branch</label>
            <input
              type="text"
              value={branchName}
              readOnly
              disabled
              className="cursor-not-allowed rounded-lg border border-border-subtle bg-surface-secondary px-3 py-2 text-sm font-semibold text-text-muted outline-none"
            />
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
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.,]/g, "");
                  setAmount(val);
                }}
                placeholder="0.00"
                className={`w-full rounded-lg border bg-input-bg py-2 pl-8 pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-pawn-sidebar ${
                  errors.amount ? "border-red-400" : "border-input-border"
                }`}
              />
            </div>
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
            {errors.amount && <span className="text-[10px] text-red-500">{errors.amount}</span>}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Weekly cash replenishment"
              className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted transition-colors focus:border-pawn-sidebar resize-none"
            />
          </div>

          {/* Approval Section */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h4 className="text-xs font-bold text-amber-700">Approval Required</h4>
            </div>

            {/* Manager checkboxes */}
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

            {/* Require all toggle */}
            {managers.length >= 2 && (
              <label className="mt-3 flex cursor-pointer items-center gap-2.5">
                <div
                  className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                    requireAll ? "bg-emerald-600" : "bg-zinc-300"
                  }`}
                  onClick={() => {
                    if (!needsMultiApproval) setRequireAll(!requireAll);
                  }}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      requireAll ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-[11px] font-medium text-text-secondary">
                  Require all approvers
                  {needsMultiApproval && (
                    <span className="ml-1 text-amber-600">(auto-enabled for ≥₱50k)</span>
                  )}
                </span>
              </label>
            )}

            {singleAdmin && (
              <p className="mt-2 text-[10px] italic text-text-muted">
                Only one manager available — auto-selected as approver.
              </p>
            )}
          </div>

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
              className="rounded-lg border border-emerald-700 bg-pawn-sidebar px-5 py-2 text-xs font-bold text-pawn-gold transition-opacity hover:opacity-90"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

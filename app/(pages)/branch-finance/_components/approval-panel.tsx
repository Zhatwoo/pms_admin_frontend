"use client";

import { useState } from "react";

export interface ApprovalRequest {
  id: string;
  type: "ADD_FUNDS" | "TRANSFER_OUT" | "TRANSFER_IN";
  amount: number;
  requestedBy: string;
  branch: string;
  date: string;
  requiredApprovers: number;
  currentApprovals: number;
  notes: string;
}

interface ApprovalPanelProps {
  requests: ApprovalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const typeLabel: Record<string, string> = {
  ADD_FUNDS: "Add Funds",
  TRANSFER_OUT: "Transfer Out",
  TRANSFER_IN: "Transfer In",
};

const typeColor: Record<string, string> = {
  ADD_FUNDS: "bg-emerald-100 text-emerald-700",
  TRANSFER_OUT: "bg-red-100 text-red-600",
  TRANSFER_IN: "bg-blue-100 text-blue-700",
};

function fmt(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

export function ApprovalPanel({
  requests,
  onApprove,
  onReject,
}: ApprovalPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const pendingCount = requests.length;

  if (pendingCount === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 shadow-sm transition-colors duration-300">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            {/* Badge */}
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {pendingCount}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Pending Approvals</h3>
            <p className="text-[10px] text-text-muted">
              {pendingCount} request{pendingCount !== 1 ? "s" : ""} waiting for your review
            </p>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-amber-500/20 px-5 pb-4 pt-2">
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-border-main bg-surface p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Type badge */}
                  <span className={`mt-0.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${typeColor[req.type]}`}>
                    {typeLabel[req.type]}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{fmt(req.amount)}</p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">
                      <span className="font-medium">{req.branch}</span>
                      {" · "}
                      Requested by <span className="font-medium">{req.requestedBy}</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-text-muted">
                      {new Date(req.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {req.notes && <> · {req.notes}</>}
                    </p>
                    {/* Approval progress */}
                    <p className="mt-1.5 text-[10px] font-medium text-amber-600">
                      Waiting for approval from {req.requiredApprovers - req.currentApprovals} manager(s)
                      {req.requiredApprovers > 1 && (
                        <span className="ml-1 text-text-muted">
                          ({req.currentApprovals}/{req.requiredApprovers} approved)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApprove(req.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(req.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

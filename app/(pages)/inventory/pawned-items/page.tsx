"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { FilterSelect } from "@/components/shared/filter-select";

type PawnedStatus = "Active" | "Redeemed" | "Expired";
type ViewMode = "list" | "calendar";

interface Renewal {
  date: string;
  amount: number;
}

interface PawnedItem {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  branch: string;
  pawnDate: string;
  status: PawnedStatus;
  renewalCount: number;
  renewals: Renewal[];
  remarks: string;
  qrCode?: string;
  originalPhoto?: string;
  conditionReport?: string;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
  userFullName?: string;
  branchName?: string;
}

interface ExpireApprovalRequest {
  id: string;
  pawnedItemId: string;
  itemId: string;
  itemName: string;
  branch: string;
  message: string;
  requestedBy: string;
  createdAt: string;
}

const branchOptions = [
  { value: "all", label: "All Branches" },
  { value: "taguig", label: "Taguig" },
  { value: "makati", label: "Makati" },
  { value: "pasay", label: "Pasay" },
];

const categoryOptions = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "jewellery", label: "Jewellery" },
  { value: "gadgets", label: "Gadgets" },
  { value: "vehicles", label: "Vehicles" },
];

const pawnedStatusOptions = [
  { value: "all", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Redeemed", label: "Redeemed" },
  { value: "Expired", label: "Expired" },
];

const statusVariant: Record<string, "green" | "blue" | "red" | "orange"> = {
  Active: "green",
  Redeemed: "blue",
  Expired: "red",
};

// ─── Renewal Details ──────────────────────────────────────────
function RenewalDetails({ renewals }: { renewals: Renewal[] }) {
  if (renewals.length === 0) return <span className="text-text-muted text-xs">No renewals yet</span>;
  return (
    <div className="space-y-1.5">
      {renewals.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            Renew {i + 1}
          </span>
          <span className="text-xs text-text-tertiary">{r.date}</span>
          <span className="text-xs font-bold text-text-secondary">₱{r.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────
function ViewModal({ item, onClose, onSaveRemarks, userRole }: {
  item: PawnedItem;
  onClose: () => void;
  onSaveRemarks: (id: string, remarks: string) => void;
  userRole: string;
}) {
  const [editRemarks, setEditRemarks] = useState(item.remarks || "");
  const canEdit = userRole === "super_admin" || userRole === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-surface shadow-2xl border border-border-main overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-emerald-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Item #{item.itemId}</p>
            <h2 className="text-white text-xl font-bold">{item.itemName}</h2>
          </div>
          <StatusBadge label={item.status} variant={statusVariant[item.status] || "green"} />
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs uppercase text-text-muted font-bold">Category</p><p className="text-base text-text-primary">{item.category}</p></div>
            <div><p className="text-xs uppercase text-text-muted font-bold">Branch</p><p className="text-base text-text-primary">{item.branch}</p></div>
            <div><p className="text-xs uppercase text-text-muted font-bold">Pawn Date</p><p className="text-base text-text-primary">{item.pawnDate}</p></div>
            <div><p className="text-xs uppercase text-text-muted font-bold">Renewal Count</p><p className="text-base text-text-primary font-bold">{item.renewalCount}x</p></div>
          </div>
          {item.status === "Expired" && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-2">
              <p className="text-xs font-bold uppercase text-red-600 tracking-wider">Expired Item — QR Security Info</p>
              {item.originalPhoto && <div><p className="text-xs text-text-tertiary">Original Photo:</p><p className="text-sm text-text-secondary">{item.originalPhoto}</p></div>}
              {item.conditionReport && <div><p className="text-xs text-text-tertiary">Condition Report:</p><p className="text-sm text-text-secondary">{item.conditionReport}</p></div>}
              {item.qrCode && <div><p className="text-xs text-text-tertiary">QR Code:</p><p className="text-sm font-mono text-text-secondary">{item.qrCode}</p></div>}
            </div>
          )}
          <div>
            <p className="text-xs uppercase text-text-muted font-bold mb-2">Renewal History</p>
            <RenewalDetails renewals={item.renewals} />
          </div>
          <div>
            <p className="text-xs uppercase text-text-muted font-bold mb-1">Remarks / Notes</p>
            {canEdit ? (
              <textarea
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                rows={3}
                placeholder="Add remarks about item condition, defects, investigations..."
                className="w-full rounded-md border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-emerald-500 resize-none"
              />
            ) : (
              <p className="text-sm text-text-secondary bg-surface-secondary rounded-md p-2 border border-border-subtle">{item.remarks || "No remarks"}</p>
            )}
          </div>
        </div>
        <div className="border-t border-border-main px-6 py-3 flex justify-end gap-2 bg-surface-secondary">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-text-secondary rounded-md border border-border-main hover:bg-surface-hover">Close</button>
          {canEdit && (
            <button
              onClick={() => { onSaveRemarks(item.id, editRemarks); onClose(); }}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-700 rounded-md hover:bg-emerald-800"
            >
              Save Remarks
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAWNED ITEMS PAGE (Under Inventory)
// ═══════════════════════════════════════════════════════════════
export default function PawnedItemsPage() {
  const userRole = "super_admin";
  const isSuperAdmin = userRole === "super_admin";
  const canEdit = userRole === "super_admin" || userRole === "admin";

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [branch, setBranch] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("Active"); // Default to Active per requirement
  const [monthFilter, setMonthFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [pawnedItems, setPawnedItems] = useState<PawnedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingItem, setViewingItem] = useState<PawnedItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expireRequests, setExpireRequests] = useState<ExpireApprovalRequest[]>([]);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => { setCurrentPage(1); }, [branch, category, status, searchQuery]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (branch !== "all") params.set("branch", branch);
        if (category !== "all") params.set("category", category);
        if (status !== "all") params.set("status", status);
        if (monthFilter !== "all") params.set("month", monthFilter);
        if (searchQuery) params.set("search", searchQuery);
        // By default API should sort by date and time descending
        params.set("sort", "datetime_desc");
        params.set("page", String(currentPage));
        params.set("limit", String(itemsPerPage));

        const data = await api.get<{ items: PawnedItem[]; total: number }>(`/inventory/pawned?${params}`);
        setPawnedItems(data.items || []);
        setTotalItems(data.total || 0);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [branch, category, status, searchQuery, currentPage]);

  useEffect(() => {
    async function fetchExpireRequests() {
      if (!isSuperAdmin) {
        setExpireRequests([]);
        return;
      }

      try {
        const logs = await api.get<ActivityLogEntry[]>("/activity-logs");

        const requests = logs
          .filter((log) => log.action === "PAWN_ITEM_EXPIRE_REQUEST")
          .map((log) => {
            let parsed: Record<string, string> = {};

            if (log.details) {
              try {
                parsed = JSON.parse(log.details) as Record<string, string>;
              } catch {
                parsed = {};
              }
            }

            const requestStatus = (parsed.requestStatus || "pending").toLowerCase();

            return {
              id: log.id,
              pawnedItemId: parsed.pawnedItemId || "",
              itemId: parsed.itemId || "Unknown",
              itemName: parsed.itemName || "Unnamed item",
              branch: parsed.branch || log.branchName || "Unknown branch",
              message: parsed.message || "(No message)",
              requestedBy: log.userFullName || "Unknown user",
              createdAt: log.createdAt,
              requestStatus,
            };
          })
          .filter((request) => request.requestStatus === "pending")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setExpireRequests(requests);
      } catch (err) {
        console.error("Failed to fetch expire approval requests:", err);
      }
    }

    void fetchExpireRequests();
  }, [isSuperAdmin]);

  const handleSaveRemarks = useCallback(async (itemId: string, remarks: string) => {
    try {
      await api.post(`/inventory/pawned/${itemId}/remarks`, { remark: remarks });
      setPawnedItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, remarks } : i)));
    } catch (err) {
      console.error("Failed to save remarks:", err);
    }
  }, []);

  const handleMarkExpired = useCallback(async (itemId: string) => {
    if (!confirm("Mark this item as Expired? It will be auto-transferred to Items For Sale.")) return;
    try {
      await api.post(`/inventory/pawned/${itemId}/expire`, {});
      setPawnedItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: "Expired" as PawnedStatus } : i)));
    } catch (err) {
      console.error("Failed to expire item:", err);
    }
  }, []);

  const handleDelete = useCallback(async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this pawned item? This cannot be undone.")) return;
    try {
      await api.delete(`/inventory/pawned/${itemId}`);
      setPawnedItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  }, []);

  const handleQRScan = useCallback(() => {
    alert("QR Scanner will open here. Scan all items in the vault to tally physical count vs system inventory.");
  }, []);

  const handleReviewExpireRequest = useCallback(
    async (request: ExpireApprovalRequest, decision: "approve" | "reject") => {
      if (!request.pawnedItemId) {
        setReviewError("This request is missing pawned item metadata and cannot be reviewed.");
        return;
      }

      try {
        setReviewingRequestId(request.id);
        setReviewError("");

        const requestPaths = [
          `/inventory/pawned/${request.pawnedItemId}/expire-request/${request.id}/review`,
          `/inventory/pawned/${request.pawnedItemId}/request-expire/${request.id}/review`,
        ];

        let processed = false;
        let lastError: unknown = null;

        for (const path of requestPaths) {
          try {
            await api.patch(path, { decision });
            processed = true;
            break;
          } catch (patchErr) {
            lastError = patchErr;
            const patchText =
              patchErr instanceof Error ? patchErr.message.toLowerCase() : String(patchErr).toLowerCase();
            const patchRouteMissing = patchText.includes("cannot patch") || patchText.includes("not found");

            if (!patchRouteMissing) {
              throw patchErr;
            }

            try {
              await api.post(path, { decision });
              processed = true;
              break;
            } catch (postErr) {
              lastError = postErr;
              const postText =
                postErr instanceof Error ? postErr.message.toLowerCase() : String(postErr).toLowerCase();
              const postRouteMissing = postText.includes("cannot post") || postText.includes("not found");

              if (!postRouteMissing) {
                throw postErr;
              }
            }
          }
        }

        if (!processed) {
          throw lastError instanceof Error ? lastError : new Error("Review endpoint is unavailable");
        }

        setExpireRequests((prev) => prev.filter((entry) => entry.id !== request.id));

        if (decision === "approve") {
          setPawnedItems((prev) =>
            prev.map((item) =>
              item.id === request.pawnedItemId
                ? { ...item, status: "Expired" as PawnedStatus }
                : item,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to review expire request:", err);
        const errorText = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
        if (errorText.includes("cannot post") || errorText.includes("cannot patch") || errorText.includes("not found")) {
          setReviewError("Review endpoint is not available yet. Restart PMS_backend so the latest routes are loaded.");
        } else {
          setReviewError("Unable to process request. Please try again.");
        }
      } finally {
        setReviewingRequestId(null);
      }
    },
    [],
  );

  return (
    <div className="space-y-3 pb-4">
      {isSuperAdmin && (
        <div className="w-full md:max-w-3xl rounded-lg border border-amber-200 bg-amber-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Pending Approval Requests</p>
              <p className="text-xs text-amber-900/80">Expire requests submitted by admins and employees</p>
            </div>
            <span className="rounded bg-amber-200/70 px-2 py-1 text-[11px] font-bold text-amber-800">
              {expireRequests.length}
            </span>
          </div>

          {expireRequests.length === 0 ? (
            <p className="text-xs text-amber-900/70">No pending expire approval requests.</p>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {expireRequests.map((request) => (
                <div key={request.id} className="rounded-md border border-amber-200 bg-white px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-text-primary">
                      {request.itemId} - {request.itemName}
                    </p>
                    <span className="text-[11px] text-text-tertiary">
                      {new Date(request.createdAt).toLocaleString("en-PH")}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-text-tertiary">
                    Branch: {request.branch} | Requested by: {request.requestedBy}
                  </p>
                  <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-text-secondary">
                    {request.message}
                  </p>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReviewExpireRequest(request, "reject")}
                      disabled={reviewingRequestId === request.id || !request.pawnedItemId}
                      className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {reviewingRequestId === request.id ? "Processing..." : "Reject"}
                    </button>
                    <button
                      onClick={() => handleReviewExpireRequest(request, "approve")}
                      disabled={reviewingRequestId === request.id || !request.pawnedItemId}
                      className="rounded border border-emerald-700 bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {reviewingRequestId === request.id ? "Processing..." : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviewError && (
            <p className="mt-2 text-xs font-medium text-red-600">{reviewError}</p>
          )}
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-wrap items-end justify-between gap-3 bg-surface p-3 rounded-lg border border-border-main transition-colors duration-300">
        <div className="flex flex-wrap items-end gap-3">
          {isSuperAdmin && <FilterSelect label="Branch" options={branchOptions} value={branch} onChange={setBranch} />}
          <FilterSelect label="Category" options={categoryOptions} value={category} onChange={setCategory} />
          <FilterSelect label="Status" options={pawnedStatusOptions} value={status} onChange={setStatus} />
          <FilterSelect 
            label="Month" 
            options={[
              { value: "all", label: "All Months" },
              { value: "current", label: "Current Month" },
              { value: "last", label: "Last Month" }
            ]} 
            value={monthFilter} 
            onChange={setMonthFilter} 
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide text-text-tertiary">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="h-10 rounded-md border border-input-border bg-input-bg px-4 text-sm text-text-primary outline-none focus:border-emerald-500 w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleQRScan} className="flex items-center gap-1.5 rounded-md border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            QR Scan
          </button>
          <div className="flex rounded-md border border-border-main overflow-hidden">
            <button onClick={() => setViewMode("list")} className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "list" ? "bg-emerald-700 text-white" : "bg-surface text-text-secondary hover:bg-surface-hover"}`}>
              List
            </button>
            <button onClick={() => setViewMode("calendar")} className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "calendar" ? "bg-emerald-700 text-white" : "bg-surface text-text-secondary hover:bg-surface-hover"}`}>
              Calendar
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" && (
        <div className="overflow-hidden rounded-lg border border-border-main bg-surface transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-900 text-amber-400">
                  {["ID", "Item Name", "Category", "Branch", "Date & Time", "Status", "Renewal", "Note"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="py-8 text-center text-base text-zinc-400">Loading...</td></tr>
                ) : pawnedItems.length === 0 ? (
                  <tr><td colSpan={9} className="py-8 text-center text-base text-zinc-400">No pawned items found</td></tr>
                ) : (
                  pawnedItems.map((item, idx) => (
                    <Fragment key={item.id}>
                      <tr 
                        className="border-t border-border-subtle bg-surface-secondary transition-colors hover:bg-emerald-surface/60 cursor-pointer"
                        onClick={() => setViewingItem(item)}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-400">{item.itemId}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary">{item.itemName}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-text-tertiary">{item.category}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-text-tertiary">{item.branch}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-text-tertiary">{item.pawnDate} 10:00 AM</td>
                        <td className="whitespace-nowrap px-4 py-3"><StatusBadge label={item.status} variant={statusVariant[item.status] || "green"} /></td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary font-medium">
                          {item.renewalCount > 0 ? `Renew ${item.renewalCount}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-tertiary max-w-[150px] truncate" title={item.remarks || "No description"}>
                          {item.remarks || "—"}
                        </td>
                      </tr>
                      {expandedRow === item.itemId && (
                        <tr key={`${item.itemId}-exp`} className="bg-amber-50/50">
                          <td colSpan={9} className="px-6 py-3 border-t border-amber-100">
                            <RenewalDetails renewals={item.renewals} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "calendar" && (
        <div className="rounded-lg border border-border-main bg-surface p-4 transition-colors duration-300">
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold text-text-secondary uppercase mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1 auto-rows-[100px]">
            {/* Example mock calendar grid */}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 3; // Shift to start from 1st roughly
              const isCurrentMonth = day > 0 && day <= 30;
              const hasItem = isCurrentMonth && (day === 5 || day === 12 || day === 18);
              
              return (
                <div key={i} className={`border rounded p-1 ${isCurrentMonth ? "border-border-subtle bg-surface" : "border-transparent bg-transparent"} ${isCurrentMonth && day === new Date().getDate() ? "ring-1 ring-emerald-500" : ""}`}>
                  {isCurrentMonth && (
                    <>
                      <div className="text-xs font-bold text-text-tertiary text-right">{day}</div>
                      {hasItem && (
                        <div className="mt-1 rounded bg-emerald-100 px-1 py-0.5 text-[10px] font-bold text-emerald-800 text-left truncate">
                          2 Items Pawned
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border-main bg-surface transition-colors duration-300">
        <Pagination currentPage={currentPage} totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>

      {viewingItem && <ViewModal item={viewingItem} onClose={() => setViewingItem(null)} onSaveRemarks={handleSaveRemarks} userRole={userRole} />}
    </div>
  );
}

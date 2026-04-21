"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useBranch } from "@/contexts/branch-context";
import { api } from "@/lib/api";

type PasswordChangeRequest = {
  id: string;
  requestStatus: string;
  requestedAt: string;
  requestedByUserId: string;
  requestedByRole: string;
  requestedByName: string;
  approverRole: string | null;
  branchId: string | null;
};

type ActivityLogRecord = {
  id: string;
  userId: string;
  branchId: string | null;
  action: string;
  details: string | null;
  createdAt: string;
  userFullName?: string;
  userRole?: string;
  branchName?: string;
};

function safeParseDetails(details: string | null): Record<string, unknown> {
  if (!details) return {};

  try {
    const parsed = JSON.parse(details) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default function EmployeeSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const [activeTab, setActiveTab] = useState("Profile");
  const [toast, setToast] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const branchName = selectedBranch?.name || "Bgc Branch";
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>([]);
  const [isLoadingPasswordRequests, setIsLoadingPasswordRequests] = useState(false);
  const [passwordRequestsError, setPasswordRequestsError] = useState<string | null>(null);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "super_admin") {
      setPasswordRequests([]);
      setPasswordRequestsError(null);
      return;
    }

    let cancelled = false;

    async function loadPasswordRequests() {
      try {
        setIsLoadingPasswordRequests(true);
        setPasswordRequestsError(null);
        const isBranchAdmin = user?.role === "admin";
        let records: ActivityLogRecord[] = [];

        try {
          records = await api.get<ActivityLogRecord[]>(
            isBranchAdmin ? "/activity-logs" : "/activity-logs",
          );
        } catch {
          // Fallback to the dedicated route if the activity log endpoint is unavailable.
          const fallback = await api.get<PasswordChangeRequest[]>("/auth/password-change-requests");
          if (!cancelled) {
            setPasswordRequests(Array.isArray(fallback) ? fallback : []);
          }
          return;
        }

        const mappedRequests = records
          .filter((record) => record.action === "PASSWORD_CHANGE_REQUEST")
          .map((record) => {
            const details = safeParseDetails(record.details);
            const requestStatus =
              typeof details.requestStatus === "string"
                ? details.requestStatus
                : "pending";
            const approverRole =
              typeof details.approverRole === "string"
                ? details.approverRole
                : null;

            return {
              id: record.id,
              requestStatus,
              requestedAt:
                typeof details.requestedAt === "string"
                  ? details.requestedAt
                  : record.createdAt,
              requestedByUserId:
                typeof details.requestedByUserId === "string"
                  ? details.requestedByUserId
                  : record.userId,
              requestedByRole:
                typeof details.requestedByRole === "string"
                  ? details.requestedByRole
                  : record.userRole || "employee",
              requestedByName:
                typeof details.requestedByName === "string"
                  ? details.requestedByName
                  : record.userFullName || "Unknown user",
              approverRole,
              branchId: record.branchId,
            };
          })
          .filter((request) => {
            if (request.requestStatus !== "pending") {
              return false;
            }
            if (!request.approverRole) {
              return true;
            }
            return request.approverRole === user?.role;
          });

        if (!cancelled) {
          setPasswordRequests(mappedRequests);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load password requests.";
          setPasswordRequestsError(errorMessage);
          setPasswordRequests([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPasswordRequests(false);
        }
      }
    }

    void loadPasswordRequests();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "super_admin") {
      setPasswordRequests([]);
      setPasswordRequestsError(null);
      return;
    }

    let cancelled = false;

    async function loadPasswordRequests() {
      try {
        setIsLoadingPasswordRequests(true);
        setPasswordRequestsError(null);
        const isBranchAdmin = user?.role === "admin";
        let records: ActivityLogRecord[] = [];

        try {
          records = await api.get<ActivityLogRecord[]>(
            isBranchAdmin ? "/activity-logs" : "/activity-logs",
          );
        } catch {
          // Fallback to the dedicated route if the activity log endpoint is unavailable.
          const fallback = await api.get<PasswordChangeRequest[]>("/auth/password-change-requests");
          if (!cancelled) {
            setPasswordRequests(Array.isArray(fallback) ? fallback : []);
          }
          return;
        }

        const mappedRequests = records
          .filter((record) => record.action === "PASSWORD_CHANGE_REQUEST")
          .map((record) => {
            const details = safeParseDetails(record.details);
            const requestStatus =
              typeof details.requestStatus === "string"
                ? details.requestStatus
                : "pending";
            const approverRole =
              typeof details.approverRole === "string"
                ? details.approverRole
                : null;

            return {
              id: record.id,
              requestStatus,
              requestedAt:
                typeof details.requestedAt === "string"
                  ? details.requestedAt
                  : record.createdAt,
              requestedByUserId:
                typeof details.requestedByUserId === "string"
                  ? details.requestedByUserId
                  : record.userId,
              requestedByRole:
                typeof details.requestedByRole === "string"
                  ? details.requestedByRole
                  : record.userRole || "employee",
              requestedByName:
                typeof details.requestedByName === "string"
                  ? details.requestedByName
                  : record.userFullName || "Unknown user",
              approverRole,
              branchId: record.branchId,
            };
          })
          .filter((request) => {
            if (request.requestStatus !== "pending") {
              return false;
            }
            if (!request.approverRole) {
              return true;
            }
            return request.approverRole === user?.role;
          });

        if (!cancelled) {
          setPasswordRequests(mappedRequests);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load password requests.";
          setPasswordRequestsError(errorMessage);
          setPasswordRequests([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPasswordRequests(false);
        }
      }
    }

    void loadPasswordRequests();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setToast(null);
    try {
      await api.patch("/auth/profile", { fullName });
      await refreshProfile();
      setToast("Profile updated successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setFullName(user.fullName || "");
      setToast(null);
    }
  };

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setToast("Please complete all password fields.");
      setTimeout(() => setToast(null), 2500);
      return false;
    }

    if (newPassword.length < 6) {
      setToast("New password must be at least 6 characters.");
      setTimeout(() => setToast(null), 2500);
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      setToast("New passwords do not match.");
      setTimeout(() => setToast(null), 2500);
      return false;
    }

    try {
      setIsChangingPassword(true);
      const requiresApproval = user?.role === "admin" || user?.role === "employee";
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);

      if (requiresApproval) {
        const approverLabel = user?.role === "admin" ? "Super Admin" : "Branch Admin";
        setToast(`Password change request sent to ${approverLabel} for approval.`);
      } else {
        setToast("Password changed successfully.");
      }
      setTimeout(() => setToast(null), 2500);
      return true;
    } catch (err) {
      console.error("Failed to change password:", err);
      const errorText = err instanceof Error ? err.message : "Failed to change password.";
      setToast(errorText);
      setTimeout(() => setToast(null), 2500);
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  }

  function closePasswordModal() {
    if (isChangingPassword) return;
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  }

  async function submitPasswordChangeFromModal() {
    const changed = await handleChangePassword();
    if (changed) {
      closePasswordModal();
    }
  }

  async function handleReviewPasswordRequest(
    requestId: string,
    decision: "approve" | "reject",
  ) {
    try {
      setReviewingRequestId(requestId);
      await api.patch(`/auth/password-change-requests/${encodeURIComponent(requestId)}/review`, {
        decision,
      });

      setPasswordRequests((prev) => prev.filter((request) => request.id !== requestId));
      setToast(
        decision === "approve"
          ? "Password change request approved."
          : "Password change request rejected.",
      );
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to review request.";
      setToast(errorMessage);
      setTimeout(() => setToast(null), 2500);
    } finally {
      setReviewingRequestId(null);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center">
          <div className="rounded-xl border border-emerald-300 bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-xl">
            {toast}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-text-primary leading-tight">Settings</h1>
      </div>

      <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-border-main bg-white dark:bg-surface p-1 max-w-fit overflow-hidden">
        {["Profile", "Branch Config"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setToast(null);
            }}
            className={`px-6 py-2 text-xs font-bold transition-all rounded-md ${
              activeTab === tab
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-surface-secondary hover:text-zinc-800 dark:hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {activeTab === "Profile" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-800 mb-4 pb-2 border-b">My Account Profile</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">Full Name</label>
                      <input 
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 focus:border-emerald-500 outline-none transition-colors" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                       <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">Account Role</label>
                       <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 capitalize">
                       {user?.role || "Employee"}
                     </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">Email Address</label>
                    <input 
                      className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-400 outline-none cursor-not-allowed" 
                      value={email}
                      readOnly
                    title="Email cannot be changed from this page"
                    />
                  <p className="text-[10px] text-zinc-400 italic">Email updates require administrative verification.</p>
                  </div>
                </div>
              </div>

              {(user?.role === "admin" || user?.role === "super_admin") && (
                <div className="rounded-xl border border-zinc-200 dark:border-border-main bg-white dark:bg-surface p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-4 border-b border-border-subtle pb-2">
                    <h3 className="text-base font-bold text-zinc-800 dark:text-text-primary">
                      Password Change Requests
                    </h3>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      {passwordRequests.length} pending
                    </span>
                  </div>

                  {isLoadingPasswordRequests && (
                    <p className="text-sm text-zinc-500 dark:text-text-muted">Loading requests...</p>
                  )}

                  {!isLoadingPasswordRequests && passwordRequestsError && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      {passwordRequestsError}
                    </p>
                  )}

                  {!isLoadingPasswordRequests && !passwordRequestsError && passwordRequests.length === 0 && (
                    <p className="text-sm text-zinc-500 dark:text-text-muted">No pending password change requests.</p>
                  )}

                  {!isLoadingPasswordRequests && !passwordRequestsError && passwordRequests.length > 0 && (
                    <div className="space-y-3">
                      {passwordRequests.map((request) => {
                        const requestedAtLabel = request.requestedAt
                          ? new Date(request.requestedAt).toLocaleString()
                          : "Unknown date";
                        const isBusy = reviewingRequestId === request.id;

                        return (
                          <div
                            key={request.id}
                            className="rounded-lg border border-zinc-200 dark:border-border-main bg-zinc-50/80 dark:bg-surface-secondary p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-zinc-800 dark:text-text-primary">
                                  {request.requestedByName}
                                </p>
                                <p className="text-xs text-zinc-600 dark:text-text-secondary">
                                  Role: {request.requestedByRole}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-text-muted">
                                  Requested: {requestedAtLabel}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReviewPasswordRequest(request.id, "approve")}
                                  disabled={isBusy}
                                  className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isBusy ? "Processing..." : "Approve"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewPasswordRequest(request.id, "reject")}
                                  disabled={isBusy}
                                  className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "Branch Config" && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-emerald-800 mb-4 pb-2 border-b">Current Location: {branchName}</h3>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-text-muted tracking-wide">Opening Time</label>
                    <p className="text-sm text-zinc-800 dark:text-text-primary pt-1">08:00 AM</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-text-muted tracking-wide">Closing Time</label>
                    <p className="text-sm text-zinc-800 dark:text-text-primary pt-1">06:00 PM</p>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 col-span-2">
                    <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wide mb-1 flex items-center gap-1.5">
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                       Security Restriction
                    </p>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      Branch associates are restricted to accessing data for their assigned terminal only. 
                      Changes to operation hours must be approved by the Super Admin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
             <button 
               onClick={handleSave}
               disabled={isSaving || fullName === user?.fullName}
               className="rounded-lg bg-emerald-700 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSaving ? "Saving..." : "Save Changes"}
             </button>
             <button 
               onClick={handleDiscard}
               className="rounded-lg border border-zinc-300 px-6 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
             >
               Discard
             </button>
          </div>
        </div>

        <div className="space-y-6">
           <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-800 flex items-center justify-center text-white text-3xl font-bold mb-4 border-4 border-emerald-50 overflow-hidden">
                 {initials}
              </div>
              <h4 className="text-lg font-bold text-zinc-900 truncate px-2">{fullName || "Employee"}</h4>
              <p className="text-xs text-zinc-500 mb-4">{branchName}</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="w-full py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors">
                  Change Avatar
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full py-2 rounded-lg border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  Change Password
                </button>
              </div>
           </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
          onClick={closePasswordModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border-main bg-surface shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-emerald-900 px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">Security</p>
              <div className="mt-2 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Change Password</h2>
                  <p className="mt-1 text-sm text-emerald-50/80">Update your account password securely.</p>
                </div>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Close change password modal"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-text-muted tracking-wide">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-zinc-300 dark:border-border-main bg-white dark:bg-surface-secondary px-3 py-2 pr-14 text-sm text-zinc-800 dark:text-text-primary focus:border-emerald-500 outline-none"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-emerald-700 hover:bg-emerald-50"
                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  >
                    {showCurrentPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.17 4.54" />
                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-text-muted tracking-wide">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="w-full rounded-lg border border-zinc-300 dark:border-border-main bg-white dark:bg-surface-secondary px-3 py-2 pr-14 text-sm text-zinc-800 dark:text-text-primary focus:border-emerald-500 outline-none"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-emerald-700 hover:bg-emerald-50"
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showNewPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.17 4.54" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                          <path d="M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-text-muted tracking-wide">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      className="w-full rounded-lg border border-zinc-300 dark:border-border-main bg-white dark:bg-surface-secondary px-3 py-2 pr-14 text-sm text-zinc-800 dark:text-text-primary focus:border-emerald-500 outline-none"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-emerald-700 hover:bg-emerald-50"
                      aria-label={showConfirmNewPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmNewPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.17 4.54" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                          <path d="M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-border-main pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="rounded-md border border-border-main px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitPasswordChangeFromModal}
                  disabled={isChangingPassword}
                  className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

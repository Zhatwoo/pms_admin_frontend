"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useBranch } from "@/contexts/branch-context";
import { api } from "@/lib/api";

export default function EmployeeSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const [activeTab, setActiveTab] = useState("Profile");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await api.patch("/auth/profile", { fullName });
      await refreshProfile();
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setMessage(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900 leading-tight">Settings</h1>
      </div>

      <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 max-w-fit overflow-hidden">
        {["Profile", "Branch Config"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setMessage(null);
            }}
            className={`px-6 py-2 text-xs font-bold transition-all rounded-md ${
              activeTab === tab
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {activeTab === "Profile" && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-800 mb-4 pb-2 border-b">My Account Profile</h3>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                  message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {message.text}
                </div>
              )}

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
                     <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">Job Title</label>
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
          )}

          {activeTab === "Branch Config" && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-emerald-800 mb-4 pb-2 border-b">Current Location: {selectedBranch.name}</h3>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">Opening Time</label>
                    <p className="text-sm text-zinc-800 pt-1">08:00 AM</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">Closing Time</label>
                    <p className="text-sm text-zinc-800 pt-1">06:00 PM</p>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 col-span-2">
                    <p className="text-[10px] font-bold uppercase text-emerald-700 tracking-wide mb-1 flex items-center gap-1.5">
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                       Security Restriction
                    </p>
                    <p className="text-xs text-emerald-900 leading-relaxed">
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
               disabled={isSaving || (fullName === user?.fullName && email === user?.email)}
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
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : initials}
               </div>
               <h4 className="text-lg font-bold text-zinc-900 truncate px-2">{fullName || "Employee"}</h4>
               <p className="text-xs text-zinc-500 mb-4">{selectedBranch.name}</p>
               <button className="w-full py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors">
                 Change Avatar
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}

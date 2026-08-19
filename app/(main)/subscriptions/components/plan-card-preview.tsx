"use client";

import { useState } from "react";
import { Check, Zap, Sparkles, Layers } from "lucide-react";

export interface PlanPreviewData {
  name: string;
  badge?: string;
  themeColor?: string;
  monthlyPrice: number;
  annualPrice: number;
  currency?: string;
  billingType?: "monthly" | "annual" | "both";
  isPopular?: boolean;
  branchLimit: number;
  userLimit: number;
  storageGb: number;
  features: { name: string; enabled?: boolean }[];
  inclusions: { name: string }[];
  addons: { name: string; price: number; unit?: string }[];
}

export function PlanCardPreview({ plan }: { plan: PlanPreviewData }) {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");

  const price = cycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const isDarkCard = plan.isPopular;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0f172a] text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Bookmark-like Yellow Badge for Most Availed */}
      {plan.isPopular && (
        <div className="absolute top-0 right-5 bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-b-md shadow-md flex items-center gap-1">
          ★ Most Availed
        </div>
      )}

      {/* Top Header */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {plan.name || "Plan Name"}
          </span>
        </div>

        {/* Toggle Billing Cycle */}
        {plan.billingType === "both" && (
          <div className="flex bg-slate-800/70 p-1 rounded-lg mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`flex-1 py-1 rounded-md transition-colors ${
                cycle === "monthly" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className={`flex-1 py-1 rounded-md transition-colors ${
                cycle === "annual" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Annual (Save)
            </button>
          </div>
        )}

        {/* Price Display */}
        <div className="flex items-baseline gap-1 my-3">
          <span className="text-3xl font-extrabold text-white">
            {price === 0 ? "Custom" : `₱${price.toLocaleString()}`}
          </span>
          {price > 0 && (
            <span className="text-xs font-medium text-slate-400">
              /{cycle === "annual" ? "yearly" : "mo"}
            </span>
          )}
        </div>

        {/* Limits summary pills */}
        <div className="flex flex-wrap gap-2 my-4 pt-2 border-t border-slate-800 text-xs font-medium text-slate-300">
          <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            🏢 {plan.branchLimit} {plan.branchLimit === 1 ? "Branch" : "Branches"}
          </span>
          <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            👥 {plan.userLimit} Users
          </span>
          <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            💾 {plan.storageGb}GB Storage
          </span>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2 my-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Features</p>
          <ul className="space-y-1.5 text-xs text-slate-200 max-h-48 overflow-y-auto pr-1">
            {plan.features.length === 0 ? (
              <li className="text-slate-500 italic">No features added yet</li>
            ) : (
              plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className={f.enabled === false ? "line-through text-slate-500" : ""}>
                    {f.name}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Included Services */}
        {plan.inclusions.length > 0 && (
          <div className="my-4 pt-3 border-t border-slate-800 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Included Services
            </p>
            <ul className="space-y-1 text-xs text-slate-300">
              {plan.inclusions.map((inc, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-sky-400">✦</span>
                  <span>{inc.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Addons */}
        {plan.addons.length > 0 && (
          <div className="my-4 pt-3 border-t border-slate-800 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Available Add-ons
            </p>
            <div className="grid grid-cols-1 gap-1 text-xs text-slate-300">
              {plan.addons.map((add, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-800/50 px-2 py-1 rounded">
                  <span>{add.name}</span>
                  <span className="font-semibold text-amber-300">
                    ₱{add.price.toLocaleString()}
                    {add.unit ? ` ${add.unit}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        type="button"
        disabled
        className="mt-4 w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-opacity shadow-md"
      >
        Get Started
      </button>
    </div>
  );
}

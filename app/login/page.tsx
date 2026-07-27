"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, Sun, Moon } from "lucide-react";

function LoginForm({ isDark }: { isDark: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const notice = searchParams.get("notice");
  const reason = searchParams.get("reason");

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace(redirectUrl);
    }
  }, [user, isAuthLoading, router, redirectUrl]);

  useEffect(() => {
    if (notice) {
      toast.info(notice);
    } else if (reason === "session-expired") {
      toast.warning("Session expired. Please sign in again.");
    }
  }, [notice, reason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email.trim(), password.trim());
      toast.success(`Welcome back, ${loggedUser.fullName || loggedUser.email}!`);
      router.push(redirectUrl);
    } catch (err: any) {
      const message =
        err?.message || "Invalid credentials or unauthorized access.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSuperAdminCredentials = () => {
    setEmail("admin@pawnshop.com");
    setPassword("Admin123!");
    setErrorMsg("");
    toast.info("Superadmin credentials filled!");
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className={`h-8 w-8 animate-spin rounded-full border-4 border-t-transparent ${isDark ? "border-sky-500" : "border-sky-600"}`} />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/logo.png"
          alt="Quick Pawn"
          className="h-16 w-auto sm:h-20"
        />

        <h1 className={`mt-4 text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
          Admin Sign In
        </h1>
        <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Access multi-tenant administration & SaaS operations
        </p>
      </div>

      {/* Quick Fill Banner for SuperAdmin */}
      <div className={`mt-6 rounded-xl border p-3.5 text-xs ${isDark ? "border-sky-500/20 bg-sky-950/30 text-sky-300" : "border-sky-300 bg-sky-50 text-sky-700"}`}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className={`h-3.5 w-3.5 ${isDark ? "text-sky-400" : "text-sky-600"}`} />
            Demo Credentials Available
          </span>
          <button
            type="button"
            onClick={fillSuperAdminCredentials}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${isDark
                ? "bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 hover:text-white"
                : "bg-sky-600/10 text-sky-700 hover:bg-sky-600/20"
              }`}
          >
            Auto-fill SuperAdmin
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className={`mt-4 rounded-xl border p-3.5 text-xs font-medium animate-fadeIn ${isDark ? "border-rose-500/30 bg-rose-950/40 text-rose-300" : "border-rose-300 bg-rose-50 text-rose-700"
          }`}>
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Admin Email
          </label>
          <div className="relative mt-1.5">
            <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? "text-slate-400" : "text-slate-400"}`}>
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pawnshop.com"
              required
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors ${isDark
                  ? "border-slate-800 bg-slate-950/60 text-white focus:border-sky-500 focus:ring-sky-500"
                  : "border-slate-300 bg-white text-slate-900 focus:border-sky-500 focus:ring-sky-500"
                }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Password
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors ${isDark
                  ? "border-slate-800 bg-slate-950/60 text-white focus:border-sky-500 focus:ring-sky-500"
                  : "border-slate-300 bg-white text-slate-900 focus:border-sky-500 focus:ring-sky-500"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60 transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 font-sans antialiased transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
    >
      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={() => setIsDark(!isDark)}
        aria-label="Toggle theme"
        className={`absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${isDark
            ? "border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          }`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Dynamic Background Effects */}
      {isDark && (
        <>
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-600/20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
        </>
      )}

      {/* Grid Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${isDark
            ? "bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,#cbd5e130_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e130_1px,transparent_1px)]"
          } bg-[size:4rem_4rem]`}
      />

      {/* Login Card */}
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl border p-8 shadow-2xl backdrop-blur-xl transition-all sm:p-10 ${isDark
            ? "border-slate-800/80 bg-slate-900/80"
            : "border-slate-200 bg-white/90"
          }`}
      >
        <Suspense
          fallback={
            <div className="flex h-48 w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          }
        >
          <LoginForm isDark={isDark} />
        </Suspense>

        {/* Footer info */}
        <div className={`mt-8 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          <p>{BRAND_CONFIG.companyName} &bull; Administration Portal</p>
        </div>
      </div>
    </div>
  );
}
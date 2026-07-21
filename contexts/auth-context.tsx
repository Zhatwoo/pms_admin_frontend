"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import type { User } from "@/types";
import { ApiError, api } from "@/lib/api";
import { normalizeUser } from "@/lib/auth";
import { SessionExpiredModal } from "@/components/ui/session-expired-modal";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isSessionExpiryActive: boolean;
  requireReLogin: (message?: string) => void;
  forceLogoutToLogin: (message?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in again.";
const SESSION_REDIRECT_DELAY_MS = 3500;

function cookieSecuritySuffix() {
  return window.location.protocol === "https:" ? "; secure" : "";
}

function rememberedSessionCookie(maxAge: number) {
  return `admin_was_logged_in=1; path=/; max-age=${maxAge}; samesite=lax${cookieSecuritySuffix()}`;
}

function clearRememberedSessionCookie() {
  return `admin_was_logged_in=; path=/; max-age=0; samesite=lax${cookieSecuritySuffix()}`;
}

interface RefreshProfileOptions {
  suppressSessionExpired?: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(SESSION_EXPIRED_MESSAGE);
  const [isSessionExpiryActive, setIsSessionExpiryActive] = useState(false);
  const [secondsUntilRedirect, setSecondsUntilRedirect] = useState(
    Math.ceil(SESSION_REDIRECT_DELAY_MS / 1000),
  );
  const isRefreshingRef = useRef(false);
  const isHandlingSessionExpiryRef = useRef(false);
  const sessionRedirectTimeoutRef = useRef<number | null>(null);
  const sessionCountdownIntervalRef = useRef<number | null>(null);

  const clearSession = useCallback((clearRememberedSession = false) => {
    if (clearRememberedSession) {
      document.cookie = clearRememberedSessionCookie();
    }
    localStorage.removeItem("admin_user");
    setUser(null);
  }, []);

  const redirectToLogin = useCallback((reason?: string) => {
    const params = new URLSearchParams();
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (reason) {
      params.set("reason", reason);
    }

    if (currentPath && !currentPath.startsWith("/login")) {
      params.set("redirect", currentPath);
    }

    const query = params.toString();
    window.location.href = query ? `/login?${query}` : "/login";
  }, []);

  const clearSessionExpiryTimers = useCallback(() => {
    if (sessionRedirectTimeoutRef.current != null) {
      window.clearTimeout(sessionRedirectTimeoutRef.current);
      sessionRedirectTimeoutRef.current = null;
    }

    if (sessionCountdownIntervalRef.current != null) {
      window.clearInterval(sessionCountdownIntervalRef.current);
      sessionCountdownIntervalRef.current = null;
    }
  }, []);

  const requireReLogin = useCallback((message?: string) => {
    if (typeof window === "undefined") return;
    if (isHandlingSessionExpiryRef.current) return;

    isHandlingSessionExpiryRef.current = true;
    clearSessionExpiryTimers();
    clearSession(true);
    void api.post("/auth/logout", {}).catch(() => {});

    const nextMessage = message?.trim() || SESSION_EXPIRED_MESSAGE;
    setSessionExpiredMessage(nextMessage);
    setSecondsUntilRedirect(Math.ceil(SESSION_REDIRECT_DELAY_MS / 1000));
    setIsSessionExpiryActive(true);

    const startedAt = Date.now();
    sessionCountdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remainingMs = Math.max(0, SESSION_REDIRECT_DELAY_MS - elapsed);
      setSecondsUntilRedirect(Math.ceil(remainingMs / 1000));
    }, 250);

    sessionRedirectTimeoutRef.current = window.setTimeout(() => {
      clearSessionExpiryTimers();
      redirectToLogin("session-expired");
    }, SESSION_REDIRECT_DELAY_MS);
  }, [clearSession, clearSessionExpiryTimers, redirectToLogin]);

  const forceLogoutToLogin = useCallback((message?: string) => {
    if (typeof window === "undefined") return;

    clearSessionExpiryTimers();
    clearSession(true);
    void api.post("/auth/logout", {}).finally(() => {
      const params = new URLSearchParams();
      if (message?.trim()) {
        params.set("notice", message.trim());
      }
      window.location.href = `/login${params.toString() ? `?${params.toString()}` : ""}`;
    });
  }, [clearSession, clearSessionExpiryTimers]);

  const refreshProfile = useCallback(async (options?: RefreshProfileOptions) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const freshUser = await api.get<User>("/auth/me", {
        suppressAuthExpired: options?.suppressSessionExpired,
      });
      const normalizedUser = normalizeUser(freshUser);
      if (normalizedUser) {
        setUser(normalizedUser);
        localStorage.setItem("admin_user", JSON.stringify(normalizedUser));
      } else {
        clearSession(false);
      }
    } catch (err) {
      clearSession(false);
      const isExpectedUnauthorizedRefresh =
        err instanceof ApiError &&
        err.statusCode === 401 &&
        options?.suppressSessionExpired;
      if (!isExpectedUnauthorizedRefresh) {
        console.warn("[AuthContext] Failed to refresh profile:", err);
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [clearSession]);

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const detail =
        event instanceof CustomEvent
          ? (event.detail as { message?: string } | undefined)
          : undefined;

      requireReLogin(detail?.message);
    };

    window.addEventListener("admin:auth-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("admin:auth-expired", handleSessionExpired);
    };
  }, [requireReLogin]);

  // Initial load
  useEffect(() => {
    const cachedUser = localStorage.getItem("admin_user");

    if (cachedUser) {
      try {
        setUser(normalizeUser(JSON.parse(cachedUser)));
      } catch {
        localStorage.removeItem("admin_user");
      }
    }

    void refreshProfile({ suppressSessionExpired: true }).finally(() => setIsLoading(false));
  }, [refreshProfile]);

  useEffect(() => {
    if (isLoading) return;
    if (pathname.startsWith("/login")) return;
    if (user) return;

    const hadPreviousSession = document.cookie.includes("admin_was_logged_in=1");

    if (!user && hadPreviousSession) {
      requireReLogin();
    }
  }, [isLoading, pathname, requireReLogin, user]);

  useEffect(() => {
    return () => {
      clearSessionExpiryTimers();
    };
  }, [clearSessionExpiryTimers]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: User }>(
      "/auth/login",
      { email, password },
    );

    const normalizedUser = normalizeUser(data.user);

    if (!normalizedUser) {
      throw new Error("Unauthorized");
    }

    document.cookie = rememberedSessionCookie(2_592_000);

    clearSessionExpiryTimers();
    isHandlingSessionExpiryRef.current = false;
    setIsSessionExpiryActive(false);
    setSessionExpiredMessage(SESSION_EXPIRED_MESSAGE);
    setSecondsUntilRedirect(Math.ceil(SESSION_REDIRECT_DELAY_MS / 1000));
    setUser(normalizedUser);
    localStorage.setItem("admin_user", JSON.stringify(normalizedUser));

    void refreshProfile({ suppressSessionExpired: true });

    return normalizedUser;
  }, [clearSessionExpiryTimers, refreshProfile]);

  const logout = useCallback(() => {
    clearSessionExpiryTimers();
    isHandlingSessionExpiryRef.current = false;
    setIsSessionExpiryActive(false);
    clearSession(true);
    void api.post("/auth/logout", {}).finally(() => {
      window.location.href = "/login";
    });
  }, [clearSession, clearSessionExpiryTimers]);

  return (
    <AuthContext
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshProfile,
        isSessionExpiryActive,
        requireReLogin,
        forceLogoutToLogin,
      }}
    >
      {children}
      <SessionExpiredModal
        isOpen={isSessionExpiryActive}
        message={sessionExpiredMessage}
        secondsUntilRedirect={secondsUntilRedirect}
        onConfirm={() => {
          clearSessionExpiryTimers();
          redirectToLogin("session-expired");
        }}
      />
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

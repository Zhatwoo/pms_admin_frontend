"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getDefaultRouteForRole } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(getDefaultRouteForRole(user.role));
  }, [isLoading, router, user]);

  return (
    <div className="flex h-screen items-center justify-center bg-pawn-content">
      <div className="text-sm text-text-tertiary">Redirecting...</div>
    </div>
  );
}

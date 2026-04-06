"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { BRANCH_NAV } from "@/lib/constants";

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar items={BRANCH_NAV} title="Branch" />
      <main className="flex-1 overflow-y-auto bg-zinc-50 p-8 dark:bg-zinc-950">
        {children}
      </main>
    </div>
  );
}

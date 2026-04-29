"use client";

import { usePathname } from "next/navigation";
import { useBranch } from "@/contexts/branch-context";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedBranch, isAllBranches } = useBranch();

  const isPawned = pathname.includes("pawned-items");

  return (
    <div className="p-4">

      {/* Page Content */}
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}


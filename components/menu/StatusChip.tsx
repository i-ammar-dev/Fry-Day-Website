"use client";

import { useEffect, useState } from "react";
import { getStatus } from "@/lib/hours";

export function useShopStatus() {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getStatus());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  return status;
}

export default function StatusChip({ className = "" }: { className?: string }) {
  const status = useShopStatus();
  if (!status) return <span className={`inline-block h-7 w-[72px] ${className}`} aria-hidden />;

  return (
    <span
      role="status"
      aria-label={status.label}
      title={status.label}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
        status.isOpen
          ? "border-green-500/50 bg-green-500/10 text-green-400"
          : "border-[#E63B2E]/60 bg-[#E63B2E]/10 text-[#ff7a6e]"
      } ${className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${status.isOpen ? "bg-green-400" : "bg-[#E63B2E]"}`}
      />
      {status.isOpen ? "Open" : "Closed"}
    </span>
  );
}

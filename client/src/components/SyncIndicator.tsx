/*
 * SyncIndicator — quiet "syncing / saved" dot for data-heavy pages.
 * Uses react-query's global fetch/mutation counters, so it reflects any
 * in-flight tracker log, checklist tick, or photo upload without wiring.
 */
import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Check, RefreshCw, WifiOff } from "lucide-react";
import { useOnline } from "@/components/OfflineBanner";

export default function SyncIndicator({ className = "" }: { className?: string }) {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const online = useOnline();
  const busy = fetching + mutating > 0;

  // Show a short-lived "saved" confirmation after activity settles.
  const [showSaved, setShowSaved] = useState(false);
  const [wasBusy, setWasBusy] = useState(false);
  useEffect(() => {
    if (busy) {
      setWasBusy(true);
      setShowSaved(false);
    } else if (wasBusy) {
      setShowSaved(true);
      const t = setTimeout(() => {
        setShowSaved(false);
        setWasBusy(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [busy, wasBusy]);

  if (!online) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#8A6A4F] ${className}`}
        role="status"
      >
        <WifiOff size={10} /> Offline
      </span>
    );
  }
  if (busy) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#8A6A4F] ${className}`}
        role="status"
      >
        <RefreshCw size={10} className="animate-spin" /> Syncing
      </span>
    );
  }
  if (showSaved) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#6B7C5A] ${className}`}
        role="status"
      >
        <Check size={10} /> Saved
      </span>
    );
  }
  return null;
}

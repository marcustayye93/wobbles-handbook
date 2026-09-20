/*
 * PawFab — floating paw quick-log button, present on every page.
 * Docked inside the phone column (max-w-md), just above the bottom nav,
 * with a visible "Log" label. Opens the shared QuickLogSheet.
 */
import { useState } from "react";
import { PawPrint } from "lucide-react";
import QuickLogSheet from "@/components/QuickLogSheet";

export default function PawFab() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="fixed inset-x-0 mx-auto w-full max-w-md z-40 pointer-events-none print:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Quick log — open the logging sheet"
          className="pointer-events-auto absolute right-4 bottom-0 h-12 pl-3.5 pr-4 rounded-full bg-[#B4512E] text-[#FFFDF8] flex items-center gap-1.5 shadow-[0_8px_24px_rgba(180,81,46,0.45)] press-scale"
        >
          <PawPrint size={20} strokeWidth={2.2} />
          <span className="text-[13px] font-body font-extrabold">Log</span>
        </button>
      </div>
      <QuickLogSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

/*
 * PawFab — floating paw quick-log button, present on every page.
 * Sits just above the bottom nav pill, right side. Opens the shared
 * QuickLogSheet (tracker grid → mini form → saves to the family server).
 */
import { useState } from "react";
import { PawPrint } from "lucide-react";
import QuickLogSheet from "@/components/QuickLogSheet";

export default function PawFab() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick log — open the logging sheet"
        className="fixed z-40 right-4 w-14 h-14 rounded-full bg-[#B4512E] text-[#FFFDF8] flex items-center justify-center shadow-[0_8px_24px_rgba(180,81,46,0.45)] press-scale"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <PawPrint size={24} strokeWidth={2.2} />
      </button>
      <QuickLogSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

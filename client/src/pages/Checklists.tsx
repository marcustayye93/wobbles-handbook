/*
 * Redesign v2 — "Keepsake Field Guide" digital checklists.
 * Ink navy active chips, moss ticks, keepsake card container.
 * Pick a list, tick paw-checkboxes (synced live for the family), or reset.
 * Everything lives on the phones — nothing needs printing.
 */
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/AppShell";
import SyncIndicator from "@/components/SyncIndicator";
import { CHECKLISTS } from "@/content/checklists";
import { useSharedState } from "@/hooks/useSyncedData";
import { cn } from "@/lib/utils";
import { PawPrint, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Checklists() {
  const [ticks, setTicks] = useSharedState<Record<string, boolean>>("checklists", {});
  const [activeId, setActiveId] = useState(CHECKLISTS[0].id);
  const active = CHECKLISTS.find((c) => c.id === activeId)!;

  const doneCount = active.items.filter((_, i) => ticks[`${active.id}:${i}`]).length;

  const resetActive = () => {
    setTicks((p) => {
      const n = { ...p };
      active.items.forEach((_, i) => delete n[`${active.id}:${i}`]);
      return n;
    });
    toast(`"${active.title}" reset`);
  };

  return (
    <PageShell>
      <PageHeader title="Checklists" subtitle="Tick together — synced to both phones" back="/handbook" emoji="✅" />

      {/* list picker */}
      <div className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
          {CHECKLISTS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "shrink-0 px-3.5 py-2 rounded-full text-xs font-extrabold press-scale border transition-colors",
                c.id === activeId
                  ? "bg-[#22364D] text-[#FFFDF8] border-transparent"
                  : "bg-card border-border text-foreground/70",
              )}
            >
              {c.emoji} {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* active list */}
      <div className="px-5 pt-4">
        <div className="keepsake-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-semibold text-[1.3rem] leading-tight text-[#22364D]">
                {active.emoji} {active.title}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {active.cadence} · {doneCount}/{active.items.length} done <SyncIndicator className="ml-1" />
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={resetActive}
                className="w-11 h-11 rounded-full bg-[#22364D]/8 text-[#22364D] flex items-center justify-center press-scale"
                aria-label="Reset list"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div className="h-2 rounded-full bg-muted overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-[#7B8C6A] transition-[width] duration-300"
              style={{ width: `${(doneCount / active.items.length) * 100}%` }}
            />
          </div>

          <ul className="mt-3.5 space-y-1">
            {active.items.map((item, i) => {
              const key = `${active.id}:${i}`;
              const done = !!ticks[key];
              return (
                <li key={i}>
                  <button
                    className="w-full flex items-start gap-3 text-left rounded-xl px-2 py-2.5 press-scale hover:bg-muted/50 transition-colors"
                    onClick={() => setTicks((p) => ({ ...p, [key]: !p[key] }))}
                  >
                    <span
                      className={cn(
                        "shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-colors",
                        done
                          ? "bg-[#7B8C6A] border-[#7B8C6A] text-white"
                          : "border-border bg-background",
                      )}
                    >
                      {done && <PawPrint size={13} />}
                    </span>
                    <span className={cn("text-[14px] leading-relaxed", done && "line-through text-muted-foreground")}>
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-3 pb-4">
          Ticks sync instantly to both phones — the daily and weekly lists reset from the fridge to your pocket.
        </p>
      </div>
    </PageShell>
  );
}

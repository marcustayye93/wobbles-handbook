/*
 * Redesign v2 — "Keepsake Field Guide" printable checklists.
 * Ink navy active chips, moss ticks, keepsake card container.
 * Pick a list, tick paw-checkboxes (synced for the family), reset, or print
 * (print stylesheet shows all items with empty boxes).
 */
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/AppShell";
import { CHECKLISTS } from "@/content/checklists";
import { useSharedState } from "@/hooks/useSyncedData";
import { cn } from "@/lib/utils";
import { PawPrint, Printer, RotateCcw } from "lucide-react";
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
      <PageHeader title="Checklists" subtitle="Tick on screen, or print blank copies" back="/handbook" emoji="✅" />

      {/* list picker */}
      <div className="px-5 pt-4 print:hidden">
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

      {/* active list (screen) */}
      <div className="px-5 pt-4 print:hidden">
        <div className="keepsake-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-semibold text-[1.3rem] leading-tight text-[#22364D]">
                {active.emoji} {active.title}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {active.cadence} · {doneCount}/{active.items.length} done
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={resetActive}
                className="w-9 h-9 rounded-full bg-[#22364D]/8 text-[#22364D] flex items-center justify-center press-scale"
                aria-label="Reset list"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => window.print()}
                className="w-9 h-9 rounded-full bg-[#C66A3D] text-[#FFFDF8] flex items-center justify-center press-scale"
                aria-label="Print all checklists"
              >
                <Printer size={15} />
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
          Printing gives you ALL {CHECKLISTS.length} lists with blank boxes — stick them on the fridge.
        </p>
      </div>

      {/* print version: all lists, blank boxes */}
      <div className="hidden print:block px-2 text-black">
        <h1 className="text-2xl font-bold mb-1">Wobbles' Checklists 🐶</h1>
        <p className="text-xs mb-4">From Wobbles' Handbook — wobbles-handbook</p>
        {CHECKLISTS.map((c) => (
          <div key={c.id} style={{ breakInside: "avoid" }} className="mb-5">
            <h2 className="text-base font-bold border-b border-black pb-1 mb-2">
              {c.emoji} {c.title} <span className="font-normal text-xs">({c.cadence})</span>
            </h2>
            <ul className="text-[11px] leading-snug space-y-1">
              {c.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="inline-block w-3 h-3 border border-black rounded-sm mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

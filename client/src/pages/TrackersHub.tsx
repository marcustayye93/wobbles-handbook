/*
 * Redesign v2 — "Keepsake Field Guide" trackers hub.
 * Grouped into Daily care / Health & vet / Growing up (mockup grouping),
 * ivory rows with last-logged summaries, peeking Wobbles spot illustration,
 * navy quick-log FAB opening a bottom-sheet drawer of all trackers.
 */
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { PageShell, Eyebrow } from "@/components/AppShell";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { TRACKERS, TRACKER_GROUPS, type TrackerEntry } from "@/lib/trackers";
import { ASSETS } from "@/content/wobbles";
import { ChevronRight, Plus } from "lucide-react";

/** Read latest entry for each tracker straight from localStorage (read-only summary). */
function readLatest(id: string): TrackerEntry | undefined {
  try {
    const raw = localStorage.getItem(`wobbles:tracker:${id}`);
    if (!raw) return undefined;
    const arr = JSON.parse(raw) as TrackerEntry[];
    return arr[0];
  } catch {
    return undefined;
  }
}

function summarise(e: TrackerEntry | undefined, unit?: string): string {
  if (!e) return "No logs yet";
  const bits: string[] = [];
  if (e.time) bits.push(e.time);
  if (e.option) bits.push(e.option);
  if (e.value != null) bits.push(`${e.value}${unit ? ` ${unit}` : ""}`);
  const when = new Date(e.date + "T12:00:00");
  const today = new Date();
  const days = Math.round((today.setHours(12, 0, 0, 0) - when.getTime()) / 86400000);
  const ago = days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  return bits.length ? `${bits.join(" · ")} · ${ago}` : `Last logged ${ago}`;
}

export default function TrackersHub() {
  const [, navigate] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Latest summaries, computed once per mount
  const latest = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of TRACKERS) {
      map[t.id] = summarise(readLatest(t.id), t.fields.value?.unit);
    }
    return map;
  }, []);

  return (
    <PageShell>
      <header className="relative px-5 pt-9 pb-1 overflow-hidden">
        <Eyebrow>Trackers</Eyebrow>
        <h1 className="font-display font-semibold text-[2.4rem] leading-[1.02] mt-1.5">
          Wobbles’ Logbook
        </h1>
        <p className="text-[13px] font-body text-muted-foreground mt-2 leading-relaxed max-w-[240px]">
          Little logs, big patterns. Everything stays on this phone.
        </p>
        {/* Peeking Wobbles */}
        <img
          src={ASSETS.v2SpotPeek}
          alt=""
          aria-hidden
          className="absolute -right-3 bottom-0 w-28 h-28 object-contain object-bottom"
        />
      </header>

      <div className="px-4 pt-4 space-y-6 pb-4">
        {TRACKER_GROUPS.map((g) => {
          const members = TRACKERS.filter((t) => t.group === g.id);
          return (
            <section key={g.id}>
              <div className="flex items-baseline justify-between px-1 mb-2.5">
                <Eyebrow>{g.title}</Eyebrow>
                <span className="text-[10px] font-body font-bold text-muted-foreground">{g.blurb}</span>
              </div>
              <div className="keepsake-card overflow-hidden divide-y divide-border/50">
                {members.map((t) => (
                  <Link
                    key={t.id}
                    href={`/trackers/${t.id}`}
                    className="flex items-center gap-3.5 px-4 py-3.5 press-scale bg-transparent"
                  >
                    <span className="w-10 h-10 rounded-2xl bg-[#22364D]/6 flex items-center justify-center text-lg shrink-0">
                      {t.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-body font-bold text-[14px] leading-snug text-[#22364D]">
                        {t.title}
                      </span>
                      <span className="block text-[11px] font-body text-muted-foreground truncate mt-0.5">
                        {latest[t.id]}
                      </span>
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Quick-log FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Quick log"
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-[#22364D] text-[#FFFDF8] flex items-center justify-center shadow-[0_10px_28px_rgba(34,54,77,0.4)] press-scale"
      >
        <Plus size={26} />
      </button>

      {/* Quick-log bottom sheet */}
      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className="bg-[#FFFDF8]">
          <DrawerHeader className="pb-1">
            <DrawerTitle className="font-display text-[1.5rem] text-[#22364D]">
              What are we logging?
            </DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-4 gap-2.5 px-4 pb-8 pt-2">
            {TRACKERS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSheetOpen(false);
                  navigate(`/trackers/${t.id}?add=1`);
                }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#F8F3EB] border border-border/60 press-scale"
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-[9px] font-body font-extrabold uppercase tracking-wide text-[#22364D] text-center leading-tight px-1">
                  {t.title}
                </span>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </PageShell>
  );
}

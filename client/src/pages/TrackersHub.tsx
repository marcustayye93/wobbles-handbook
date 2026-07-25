/*
 * Redesign v2 — "Keepsake Field Guide" trackers hub.
 * Grouped into Daily care / Health & vet / Growing up (mockup grouping),
 * ivory rows with last-logged summaries, peeking Wobbles spot illustration,
 * navy quick-log FAB opening a bottom-sheet drawer of all trackers.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { PageShell, Eyebrow } from "@/components/AppShell";
import SyncIndicator from "@/components/SyncIndicator";
import QuickLogSheet from "@/components/QuickLogSheet";
import { TRACKERS, TRACKER_GROUPS, type TrackerEntry } from "@/lib/trackers";
import { useTrackerFeed, rowToEntry } from "@/hooks/useSyncedData";
import { buildMonthRollups } from "@/lib/yearScale";
import { ASSETS } from "@/content/wobbles";
import { ChevronRight, Plus, CalendarRange, ListTodo } from "lucide-react";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTracker, setSheetTracker] = useState<string | null>(null);
  const [view, setView] = useState<"recent" | "months">("recent");
  const { rows } = useTrackerFeed();

  // U4 — per-month rollups (only computed when Months view is open)
  const rollups = useMemo(
    () => (view === "months" ? buildMonthRollups(rows) : []),
    [view, rows],
  );

  // Latest summaries from the shared family feed (rows are newest-first)
  const latest = useMemo(() => {
    const firstRow = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      if (!firstRow.has(r.trackerId)) firstRow.set(r.trackerId, r);
    }
    const map: Record<string, string> = {};
    for (const t of TRACKERS) {
      const row = firstRow.get(t.id);
      map[t.id] = summarise(row ? rowToEntry(row) : undefined, t.fields.value?.unit);
    }
    return map;
  }, [rows]);

  const quickAdd = (id: string | null) => {
    setSheetTracker(id);
    setSheetOpen(true);
  };

  return (
    <PageShell>
      <header className="relative px-5 pt-9 pb-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <Eyebrow>Trackers</Eyebrow>
          <SyncIndicator />
        </div>
        <h1 className="relative z-10 font-display font-semibold text-[clamp(1.8rem,9vw,2.4rem)] leading-[1.02] mt-1.5">
          Wobbles’ Logbook
        </h1>
        <p className="relative z-10 text-[13px] font-body text-muted-foreground mt-2 leading-relaxed max-w-[230px]">
          Little logs, big patterns. Synced live for the whole family.
        </p>
        {/* Peeking Wobbles — sits behind the text and below the title line */}
        <img
          src={ASSETS.v2SpotPeek}
          alt=""
          aria-hidden
          className="absolute -right-2 bottom-0 w-[76px] h-[76px] object-contain object-bottom opacity-95"
        />
      </header>

      {/* U4 — Recent | Months segmented toggle */}
      <div className="px-5 pt-3">
        <div
          role="tablist"
          aria-label="Logbook view"
          className="inline-flex rounded-full bg-[#22364D]/6 p-1 border border-[#E5DAC8]"
        >
          {(
            [
              { id: "recent", label: "Recent", icon: ListTodo },
              { id: "months", label: "Months", icon: CalendarRange },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={view === tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-body font-extrabold uppercase tracking-[0.1em] press-scale transition-colors ${
                view === tab.id
                  ? "bg-[#22364D] text-[#FFFDF8] shadow-sm"
                  : "text-[#22364D]/70"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Months rollup view (U4) ===== */}
      {view === "months" && (
        <div className="px-4 pt-4 space-y-3 pb-4">
          {rollups.length === 0 && (
            <div className="keepsake-card p-5 text-center">
              <p className="text-[13px] font-body text-muted-foreground leading-relaxed">
                No months to roll up yet — once the logs start, each month of
                Wobbles&rsquo; life gets its own summary card here.
              </p>
            </div>
          )}
          {rollups.map((m) => (
            <div key={m.key} className="keepsake-card p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display font-semibold text-[1.3rem] text-[#22364D]">
                  {m.label}
                </h2>
                <span className="text-[10px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                  {m.total} logs · {m.activeDays} days
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                {m.walks > 0 && (
                  <p className="text-[12px] font-body text-[#33475C]">
                    🐾 <strong className="font-bold">{m.walks}</strong> walks
                  </p>
                )}
                {m.meals > 0 && (
                  <p className="text-[12px] font-body text-[#33475C]">
                    🍽️ <strong className="font-bold">{m.meals}</strong> meals
                  </p>
                )}
                {m.toiletSuccess != null && (
                  <p className="text-[12px] font-body text-[#33475C]">
                    🚽 <strong className="font-bold">{m.toiletSuccess}%</strong> toilet success
                  </p>
                )}
                {m.avgWeight != null && (
                  <p className="text-[12px] font-body text-[#33475C]">
                    ⚖️ <strong className="font-bold">{m.avgWeight} kg</strong> avg weight
                  </p>
                )}
                {m.trainingSessions > 0 && (
                  <p className="text-[12px] font-body text-[#33475C]">
                    🎓 <strong className="font-bold">{m.trainingSessions}</strong> training
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-dashed border-[#E5DAC8]">
                {TRACKER_GROUPS.map((g) => (
                  <span
                    key={g.id}
                    className="text-[10px] font-body font-extrabold uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    {g.title}: {m.groupCounts[g.id] ?? 0}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "recent" && (
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
                  <div key={t.id} className="flex items-center gap-2 pr-3">
                    <Link
                      href={`/trackers/${t.id}`}
                      className="flex items-center gap-3.5 pl-4 py-3.5 press-scale bg-transparent min-w-0 flex-1"
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
                    <button
                      onClick={() => quickAdd(t.id)}
                      aria-label={`Quick log ${t.title}`}
                      className="w-8 h-8 rounded-full bg-[#C66A3D]/10 text-[#B4512E] flex items-center justify-center shrink-0 press-scale"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      )}

      {/* Quick-log FAB */}
      <button
        onClick={() => quickAdd(null)}
        aria-label="Quick log"
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-[#22364D] text-[#FFFDF8] flex items-center justify-center shadow-[0_10px_28px_rgba(34,54,77,0.4)] press-scale"
      >
        <Plus size={26} />
      </button>

      {/* Quick-log bottom sheet (shared component — grid + inline mini-form) */}
      <QuickLogSheet open={sheetOpen} onOpenChange={setSheetOpen} initialTracker={sheetTracker} />
    </PageShell>
  );
}

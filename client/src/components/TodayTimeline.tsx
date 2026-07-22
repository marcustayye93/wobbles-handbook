/*
 * Keepsake Field Guide — TodayTimeline.
 * Unified chronological feed merging every tracker's entries for one day
 * into a single dashed-spine timeline: "08:12 🍽️ Breakfast · 120 g".
 * Now reads from the family-shared server feed instead of localStorage.
 */
import { useMemo } from "react";
import { TRACKERS } from "@/lib/trackers";
import { useTrackerFeed, rowToEntry, type SyncedEntry } from "@/hooks/useSyncedData";

interface FeedItem {
  entry: SyncedEntry;
  trackerId: string;
  emoji: string;
  title: string;
  unit?: string;
}

const TRACKER_META = new Map(TRACKERS.map((t) => [t.id, t]));

/** All tracker entries for a given ISO date, newest first (server-backed). */
export function useDayFeed(dateISO: string): { feed: FeedItem[]; isLoading: boolean } {
  const { rows, isLoading } = useTrackerFeed();
  const feed = useMemo(() => {
    const items: FeedItem[] = [];
    for (const row of rows) {
      if (row.date !== dateISO) continue;
      const t = TRACKER_META.get(row.trackerId);
      if (!t) continue;
      items.push({
        entry: rowToEntry(row),
        trackerId: t.id,
        emoji: t.emoji,
        title: t.title,
        unit: t.fields.value?.unit,
      });
    }
    return items.sort((a, b) => (b.entry.time ?? "00:00").localeCompare(a.entry.time ?? "00:00"));
  }, [rows, dateISO]);
  return { feed, isLoading };
}

function line(item: FeedItem): string {
  const e = item.entry;
  const bits: string[] = [];
  if (e.option) bits.push(e.option);
  if (e.value != null) bits.push(`${e.value}${item.unit ? ` ${item.unit}` : ""}`);
  if (bits.length === 0) bits.push(item.title);
  return bits.join(" · ");
}

export default function TodayTimeline({ dateISO }: { dateISO: string }) {
  const { feed } = useDayFeed(dateISO);

  if (feed.length === 0) return null;

  return (
    <div className="keepsake-card px-4 py-4">
      <ol className="relative space-y-3">
        {feed.map((item, i) => (
          <li key={item.entry.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
              <span className="w-8 h-8 rounded-full bg-[#22364D]/6 flex items-center justify-center text-[15px]">
                {item.emoji}
              </span>
              {i < feed.length - 1 && (
                <span className="w-px flex-1 min-h-[10px] border-l border-dashed border-[#C66A3D]/40 mt-1" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-body font-bold text-[13px] text-[#22364D] leading-snug">{line(item)}</p>
              <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                {item.entry.time ?? "—"} · {item.title}
                {item.entry.note ? ` — ${item.entry.note}` : ""}
                {item.entry.createdByName ? ` · ${item.entry.createdByName}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/*
 * Keepsake Field Guide — TodayTimeline.
 * Unified chronological feed merging every tracker's entries for one day
 * into a single dashed-spine timeline: "08:12 🍽️ Breakfast · 120 g".
 */
import { useMemo } from "react";
import { TRACKERS, type TrackerEntry } from "@/lib/trackers";
import { useLogVersion } from "@/components/QuickLogSheet";

interface FeedItem {
  entry: TrackerEntry;
  trackerId: string;
  emoji: string;
  title: string;
  unit?: string;
}

/** Read all tracker entries for a given ISO date, newest first. */
export function readDayFeed(dateISO: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const t of TRACKERS) {
    try {
      const raw = localStorage.getItem(`wobbles:tracker:${t.id}`);
      if (!raw) continue;
      const arr = JSON.parse(raw) as TrackerEntry[];
      for (const e of arr) {
        if (e.date === dateISO) {
          items.push({ entry: e, trackerId: t.id, emoji: t.emoji, title: t.title, unit: t.fields.value?.unit });
        }
      }
    } catch {
      /* ignore malformed storage */
    }
  }
  return items.sort((a, b) => (b.entry.time ?? "00:00").localeCompare(a.entry.time ?? "00:00"));
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
  const version = useLogVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const feed = useMemo(() => readDayFeed(dateISO), [dateISO, version]);

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
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

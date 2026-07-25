/*
 * U4 — "On This Day" keepsake card. Renders only when a photo or tracker
 * entry exists from the same MM-DD in a previous year. Zero-cost until 2027.
 */
import { useMemo } from "react";
import { Link } from "wouter";
import { Eyebrow } from "@/components/AppShell";
import { trpc } from "@/lib/trpc";
import { useTrackerFeed } from "@/hooks/useSyncedData";
import { findOnThisDay } from "@/lib/yearScale";
import { TRACKERS } from "@/lib/trackers";
import { todayISO } from "@/lib/dates";
import { History } from "lucide-react";

const trackerMeta = (id: string) => TRACKERS.find((t) => t.id === id);

export default function OnThisDay() {
  const { rows } = useTrackerFeed();
  const { data: photos } = trpc.photos.list.useQuery(undefined, {
    staleTime: 5 * 60_000,
  });

  const match = useMemo(() => {
    if (!photos && rows.length === 0) return null;
    return findOnThisDay(
      todayISO(),
      (photos ?? []).map((p) => ({
        id: p.id,
        date: p.date,
        url: p.url,
        caption: p.caption,
      })),
      rows,
    );
  }, [photos, rows]);

  if (!match) return null;

  const agoLabel =
    match.yearsAgo === 1 ? "One year ago today" : `${match.yearsAgo} years ago today`;

  return (
    <section className="px-4 mt-8">
      <Eyebrow className="mb-2.5 px-1">On this day</Eyebrow>
      <Link href="/journey" className="block keepsake-card overflow-hidden press-scale">
        {match.photo && (
          <img
            src={match.photo.url}
            alt={match.photo.caption ?? `Wobbles on this day in ${match.year}`}
            className="w-full aspect-[16/9] object-cover"
            loading="lazy"
          />
        )}
        <div className="p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-body font-extrabold uppercase tracking-[0.14em] text-[#C66A3D]">
            <History size={12} />
            {agoLabel} · {match.year}
          </p>
          {match.photo?.caption && (
            <p className="font-display font-semibold text-[1.15rem] text-[#22364D] leading-snug mt-1">
              {match.photo.caption}
            </p>
          )}
          {match.entries.length > 0 && (
            <ul className="mt-2 space-y-1">
              {match.entries.map((e, i) => {
                const t = trackerMeta(e.trackerId);
                return (
                  <li key={i} className="text-[12px] font-body text-[#33475C] leading-snug">
                    {t?.emoji ?? "📌"} {t?.title ?? e.trackerId}
                    {e.option ? ` — ${e.option}` : ""}
                    {e.value != null && e.value !== "" ? ` · ${e.value}` : ""}
                    {e.note ? ` · “${e.note}”` : ""}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Link>
    </section>
  );
}

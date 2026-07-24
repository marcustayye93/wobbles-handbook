/*
 * TrackerInsights — the "so what?" layer for the feeding and toilet logs.
 * Renders interpreted trend cards from the deterministic insights engine and,
 * for locked trends, a "Trends pending" state that says exactly how many more
 * logs unlock each one. Keepsake Field Guide styling.
 */
import { useMemo, useState } from "react";
import {
  toiletIntelligence,
  feedingIntelligence,
  type Insight,
  type TrackerIntelligence,
} from "@/lib/insights";
import type { TrackerEntry } from "@/lib/trackers";
import { useTrackerEntries } from "@/hooks/useSyncedData";
import { Eyebrow } from "@/components/AppShell";
import { Sparkles, Hourglass, ChevronDown, ChevronUp } from "lucide-react";

const INK = "#22364D";
const SIENNA = "#C66A3D";

const TONE_STYLES: Record<Insight["tone"], { bar: string; label: string }> = {
  good: { bar: "#7B8C6A", label: "On track" },
  watch: { bar: "#C6963D", label: "Worth watching" },
  action: { bar: "#B4512E", label: "Do this" },
  info: { bar: "#5A6B7E", label: "Insight" },
};

function InsightCard({ ins }: { ins: Insight }) {
  const tone = TONE_STYLES[ins.tone];
  return (
    <div className="keepsake-card relative overflow-hidden p-4 pl-5">
      <span
        className="absolute left-0 top-0 bottom-0 w-[4px]"
        style={{ backgroundColor: tone.bar }}
        aria-hidden
      />
      <p
        className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em]"
        style={{ color: tone.bar }}
      >
        {tone.label}
      </p>
      <p className="font-body font-bold text-[14px] leading-snug mt-1" style={{ color: INK }}>
        <span className="mr-1.5">{ins.emoji}</span>
        {ins.title}
      </p>
      <p className="text-[12.5px] font-body text-muted-foreground leading-relaxed mt-1">{ins.body}</p>
      {ins.recommendation && (
        <p
          className="text-[12.5px] font-body font-bold leading-relaxed mt-2 border-t border-dashed pt-2"
          style={{ color: INK, borderColor: "#E5DAC8" }}
        >
          → {ins.recommendation}
        </p>
      )}
    </div>
  );
}

function IntelligenceBlock({ intel }: { intel: TrackerIntelligence }) {
  const [showPending, setShowPending] = useState(false);
  return (
    <div className="space-y-2.5">
      {intel.allPending ? (
        <div className="keepsake-card p-5 text-center">
          <Hourglass size={22} className="mx-auto" style={{ color: `${SIENNA}99` }} />
          <p className="font-body font-bold text-[14px] mt-2" style={{ color: INK }}>
            Trends pending
          </p>
          <p className="text-[12.5px] font-body text-muted-foreground leading-relaxed mt-1">
            Keep logging — each trend below unlocks automatically once there's enough data to
            interpret honestly, and turns into predictions and recommendations.
          </p>
        </div>
      ) : (
        intel.insights.map((ins) => <InsightCard key={ins.id} ins={ins} />)
      )}

      {intel.pending.length > 0 && (
        <div className="sticker-card px-4 py-3">
          <button
            onClick={() => setShowPending((v) => !v)}
            className="w-full flex items-center gap-2 press-scale"
            aria-expanded={showPending || intel.allPending}
          >
            <Hourglass size={13} className="shrink-0" style={{ color: SIENNA }} />
            <span className="text-[11px] font-body font-extrabold uppercase tracking-wide" style={{ color: INK }}>
              {intel.pending.length} trend{intel.pending.length === 1 ? "" : "s"} pending
            </span>
            {showPending || intel.allPending ? (
              <ChevronUp size={14} className="ml-auto text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="ml-auto text-muted-foreground" />
            )}
          </button>
          {(showPending || intel.allPending) && (
            <ul className="mt-2.5 space-y-2 border-t border-dashed pt-2.5" style={{ borderColor: "#E5DAC8" }}>
              {intel.pending.map((p) => (
                <li key={p.id} className="flex gap-2.5 items-baseline">
                  <span className="text-[13px] shrink-0">{p.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-body font-bold leading-snug" style={{ color: INK }}>
                      {p.title}
                    </span>
                    <span className="block text-[11.5px] font-body text-muted-foreground leading-snug mt-0.5">
                      Unlocks with {p.needs}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Insights section for a tracker page. Renders only for feeding/toilet.
 * Feeding entries are cross-referenced for the meal→toilet correlation.
 */
export default function TrackerInsights({
  trackerId,
  entries,
}: {
  trackerId: string;
  entries: TrackerEntry[];
}) {
  const isToilet = trackerId === "toilet";
  const isFeeding = trackerId === "feeding";
  // cross-tracker data: toilet insights need meals; hooks must run unconditionally
  const other = useTrackerEntries(isToilet ? "feeding" : "toilet");

  const intel = useMemo<TrackerIntelligence | null>(() => {
    if (isToilet) return toiletIntelligence(entries, new Date(), other.entries);
    if (isFeeding) return feedingIntelligence(entries);
    return null;
  }, [isToilet, isFeeding, entries, other.entries]);

  if (!intel) return null;

  return (
    <section className="mt-6">
      <p
        className="flex items-center gap-1.5 text-[11px] font-body font-extrabold uppercase tracking-wider mb-2.5"
        style={{ color: SIENNA }}
      >
        <Sparkles size={13} /> What the data says
      </p>
      <IntelligenceBlock intel={intel} />
    </section>
  );
}

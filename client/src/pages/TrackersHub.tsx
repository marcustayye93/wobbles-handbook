/*
 * Storybook Picture-Book theme — Trackers hub.
 * 8 on-device logs presented as a scrapbook grid of sticker cards,
 * each showing its latest entry / count.
 */
import { Link } from "wouter";
import { PageShell, PageHeader } from "@/components/AppShell";
import { TRACKERS, useTrackerEntries } from "@/lib/trackers";
import { ChevronRight } from "lucide-react";

function TrackerCard({ id, index }: { id: string; index: number }) {
  const meta = TRACKERS.find((t) => t.id === id)!;
  const [entries] = useTrackerEntries(id);
  const latest = entries[0];

  return (
    <Link
      href={`/trackers/${id}`}
      className="sticker-card p-4 press-scale flex flex-col gap-2"
      style={{ transform: `rotate(${index % 2 ? 0.45 : -0.45}deg)` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{meta.emoji}</span>
        <ChevronRight size={15} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-display font-bold text-[14px] leading-snug">{meta.title}</p>
        <p className="text-[11px] text-muted-foreground leading-snug mt-1">
          {entries.length === 0
            ? meta.empty
            : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}${latest ? ` · last ${latest.date.slice(5).split("-").reverse().join("/")}` : ""}`}
        </p>
      </div>
    </Link>
  );
}

export default function TrackersHub() {
  return (
    <PageShell>
      <PageHeader title="Trackers" subtitle="Little logs, big peace of mind" emoji="📋" />
      <div className="px-5 pt-5 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Everything is saved <strong className="text-foreground">on this device only</strong> — no accounts,
          no cloud. Log the everyday stuff so patterns (and problems) show up early.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {TRACKERS.map((t, i) => (
            <TrackerCard key={t.id} id={t.id} index={i} />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
          Tip: the weight chart is the one vets love most — weigh Wobbles weekly on
          bathroom scales (you holding him, minus you).
        </p>
      </div>
    </PageShell>
  );
}

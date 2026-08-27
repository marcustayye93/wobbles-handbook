import { Link } from "wouter";
import { ClipboardList, Plus, ChevronRight } from "lucide-react";
import { PageShell, PageHeader, Eyebrow } from "@/components/AppShell";
import { TRACKERS } from "@/lib/trackers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { WOBBLES, isPreHomecoming } from "@/content/wobbles";

export default function TrackersHub() {
  const { data: entries = [] } = useQuery({
    queryKey: ["tracker-entries"],
    queryFn: api.listTrackerEntries,
  });
  const waiting = isPreHomecoming();

  return (
    <PageShell hideFab={waiting}>
      <PageHeader title="Logs" emoji="📋" />
      <div className="px-4 py-5 space-y-4">
        <Eyebrow>Logs</Eyebrow>
        <h2 className="font-display font-bold text-2xl text-[#22364D]">Paddington's Logbook</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {waiting
            ? `He's still in Queensland until ${WOBBLES.homecomingLabel}. Empty logs are the truth — nothing to tap until he lands.`
            : "Weight, toilet, sleep first. The rest of the book fills in as the week goes."}
        </p>

        <div className="space-y-2.5">
          {TRACKERS.map((t) => {
            const count = entries.filter((e) => e.kind === t.kind).length;
            return (
              <Link
                key={t.kind}
                href={`/trackers/${t.slug}`}
                className="block press-scale"
              >
                <div className="sticker-card p-3.5 flex items-center gap-3">
                  <span className="text-2xl leading-none">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-[15px] text-[#22364D]">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {count === 0 ? "Empty — that's the truth." : `${count} ${count === 1 ? "entry" : "entries"}`}
                    </p>
                  </div>
                  {waiting ? (
                    <ClipboardList size={16} className="text-[#C9BBA4] shrink-0" />
                  ) : (
                    <Plus size={16} className="text-[#C66A3D] shrink-0" />
                  )}
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

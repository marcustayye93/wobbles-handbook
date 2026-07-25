/*
 * U4 — Year in Review (/growth/year/:year). A keepsake annual report:
 * age span, weight journey, totals grid, milestones that fell in the year,
 * and a small photo strip. Pure client-side compose from synced data.
 */
import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { PageShell, Eyebrow } from "@/components/AppShell";
import { trpc } from "@/lib/trpc";
import { useTrackerFeed } from "@/hooks/useSyncedData";
import { buildYearReport, monthKeyLabel } from "@/lib/yearScale";
import { WOBBLES, MILESTONES, daysUntil, formatDate } from "@/content/wobbles";
import { ArrowLeft, PawPrint, Scale } from "lucide-react";

const STAT_DEFS: { key: keyof ReturnType<typeof buildYearReport>["totals"]; emoji: string; label: string }[] = [
  { key: "walks", emoji: "🐾", label: "walks" },
  { key: "meals", emoji: "🍽️", label: "meals" },
  { key: "trainingSessions", emoji: "🎓", label: "training sessions" },
  { key: "groomSessions", emoji: "✂️", label: "grooming sessions" },
  { key: "socialOutings", emoji: "🌏", label: "social outings" },
  { key: "photos", emoji: "📷", label: "photos kept" },
];

export default function YearReview() {
  const { year: yearParam } = useParams<{ year: string }>();
  const year = Number(yearParam);

  const { rows } = useTrackerFeed();
  const { data: photos } = trpc.photos.list.useQuery(undefined, { staleTime: 5 * 60_000 });

  const photoLikes = useMemo(
    () => (photos ?? []).map((p) => ({ id: p.id, date: p.date, url: p.url, caption: p.caption })),
    [photos],
  );

  const report = useMemo(
    () => (Number.isFinite(year) ? buildYearReport(year, rows, photoLikes) : null),
    [year, rows, photoLikes],
  );

  const yearMilestones = useMemo(
    () =>
      MILESTONES.filter((m) => m.date.startsWith(`${year}-`) && daysUntil(m.date) < 0).sort(
        (a, b) => a.date.localeCompare(b.date),
      ),
    [year],
  );

  const yearPhotos = useMemo(
    () => photoLikes.filter((p) => p.date.startsWith(`${year}-`)).slice(0, 6),
    [photoLikes, year],
  );

  if (!report || !Number.isFinite(year)) {
    return (
      <PageShell className="pb-28 px-5 pt-8">
        <p className="font-body text-[13px] text-muted-foreground">That year doesn't look right.</p>
        <Link href="/growth" className="btn-ink mt-4 inline-flex">
          <ArrowLeft size={15} /> Back to Growth
        </Link>
      </PageShell>
    );
  }

  const hasData = report.totals.entries > 0 || report.totals.photos > 0;

  return (
    <PageShell className="pb-28">
      {/* Header */}
      <header className="px-5 pt-6">
        <Link
          href="/growth"
          className="inline-flex items-center gap-1.5 text-[11px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E] press-scale"
        >
          <ArrowLeft size={13} /> Growth
        </Link>
        <h1 className="font-display font-semibold text-[2.4rem] leading-tight text-[#22364D] mt-2">
          {year} in review
        </h1>
        <p className="text-[12px] font-body font-extrabold uppercase tracking-[0.16em] text-[#C66A3D] mt-1">
          {WOBBLES.name} · {report.ageSpan}
        </p>
      </header>

      {!hasData && (
        <section className="px-4 mt-6">
          <div className="keepsake-card p-6 text-center">
            <PawPrint size={22} className="mx-auto text-[#C66A3D]" />
            <p className="mt-3 text-[13px] font-body text-muted-foreground leading-relaxed">
              Nothing logged in {year} yet. Once the logs and photos start, this page
              becomes his annual keepsake report.
            </p>
          </div>
        </section>
      )}

      {hasData && (
        <>
          {/* Weight journey */}
          {(report.weightStart != null || report.weightEnd != null) && (
            <section className="px-4 mt-6">
              <div className="keepsake-card p-5">
                <Eyebrow className="mb-3">Weight journey</Eyebrow>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center">
                    <p className="font-display font-bold text-[1.8rem] text-[#22364D] leading-none">
                      {report.weightStart ?? "—"}
                      <span className="text-[0.9rem] font-body font-bold text-muted-foreground"> kg</span>
                    </p>
                    <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground mt-1.5">
                      first weigh-in
                    </p>
                  </div>
                  <Scale size={18} className="text-[#C66A3D] shrink-0" />
                  <div className="flex-1 text-center">
                    <p className="font-display font-bold text-[1.8rem] text-[#B4512E] leading-none">
                      {report.weightEnd ?? "—"}
                      <span className="text-[0.9rem] font-body font-bold text-muted-foreground"> kg</span>
                    </p>
                    <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground mt-1.5">
                      last weigh-in
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Totals grid */}
          <section className="px-4 mt-4">
            <div className="keepsake-card p-5">
              <Eyebrow className="mb-3">The year in numbers</Eyebrow>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {STAT_DEFS.map((s) => {
                  const v = report.totals[s.key];
                  if (!v) return null;
                  return (
                    <div key={s.key} className="flex items-baseline gap-2">
                      <span className="text-[15px]">{s.emoji}</span>
                      <p className="font-body text-[13px] text-[#33475C]">
                        <strong className="font-display font-bold text-[1.2rem] text-[#22364D]">{v}</strong>{" "}
                        {s.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-dashed border-[#E5DAC8] flex flex-wrap gap-x-4 gap-y-1">
                <p className="text-[11px] font-body text-muted-foreground">
                  <strong className="font-bold text-[#22364D]">{report.totals.entries}</strong> logs across{" "}
                  <strong className="font-bold text-[#22364D]">{report.totals.activeDays}</strong> days
                </p>
                {report.totals.toiletSuccess != null && (
                  <p className="text-[11px] font-body text-muted-foreground">
                    🚽 <strong className="font-bold text-[#22364D]">{report.totals.toiletSuccess}%</strong> toilet success
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Milestones that happened this year */}
          {yearMilestones.length > 0 && (
            <section className="px-4 mt-4">
              <Eyebrow className="px-1 mb-2.5">Milestones reached</Eyebrow>
              <div className="space-y-2">
                {yearMilestones.map((m) => (
                  <div key={`${m.date}-${m.label}`} className="sticker-card px-4 py-3">
                    <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.12em] text-[#6B7C5A]">
                      {formatDate(m.date)}
                    </p>
                    <p className="font-body font-bold text-[13px] text-[#22364D] leading-snug mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Photo strip */}
          {yearPhotos.length > 0 && (
            <section className="px-4 mt-5">
              <div className="flex items-baseline justify-between px-1 mb-2.5">
                <Eyebrow>Snapshots</Eyebrow>
                <Link href="/memories" className="text-[11px] font-body font-extrabold text-[#B4512E]">
                  All memories →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {yearPhotos.map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt={p.caption ?? `Wobbles in ${year}`}
                    className="w-full aspect-square object-cover rounded-xl border border-[#E5DAC8]"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Active months footnote */}
          {report.months.length > 0 && (
            <p className="px-5 mt-6 text-center text-[10.5px] font-body text-muted-foreground leading-relaxed">
              Data from {report.months.map((m) => monthKeyLabel(m)).join(" · ")}
            </p>
          )}
        </>
      )}
    </PageShell>
  );
}

/*
 * Journey tab — Paddington's learning journey.
 * Top: trick library grouped by level (foundation → core → party tricks),
 * each card showing its gouache illustration and a live "times practiced"
 * counter fed by Training Log entries. Tap → trick detail page.
 * Below: the broader journey — socialisation sprint status + milestone road.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { PageShell, PageHeader, Eyebrow, PawDivider } from "@/components/AppShell";
import QuickLogSheet from "@/components/QuickLogSheet";
import { useTrackerEntries } from "@/hooks/useSyncedData";
import { TRICKS, practiceCount, type Trick, type TrickLevel } from "@/content/tricks";
import { WOBBLES, MILESTONES, wobblesAge, daysUntil, formatDate } from "@/content/wobbles";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  ChevronRight,
  Star,
  Hand,
  Syringe,
  BadgeCheck,
  Shield,
  Stethoscope,
  Home as HomeIcon,
  Users,
  Trees,
  Scissors,
  Cake,
  Sparkles,
  Footprints,
} from "lucide-react";

const LEVELS: { id: TrickLevel; label: string; blurb: string }[] = [
  { id: "foundation", label: "Foundations", blurb: "Start here — the big three every puppy needs first." },
  { id: "core", label: "Life skills", blurb: "The skills that make daily life with Paddington easy." },
  { id: "party", label: "Party tricks", blurb: "Pure fun — confidence, body awareness and applause." },
];

const MILESTONE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  star: Star,
  hand: Hand,
  syringe: Syringe,
  "badge-check": BadgeCheck,
  shield: Shield,
  stethoscope: Stethoscope,
  home: HomeIcon,
  users: Users,
  trees: Trees,
  scissors: Scissors,
  cake: Cake,
  footprints: Footprints,
};

function TrickCard({ trick, count }: { trick: Trick; count: number }) {
  return (
    <Link
      href={`/journey/tricks/${trick.id}`}
      className="keepsake-card overflow-hidden press-scale flex flex-col"
    >
      <div className="relative">
        <img
          src={trick.image}
          alt={`Gouache illustration of training "${trick.name}"`}
          className="w-full aspect-[4/3] object-cover"
          loading="lazy"
        />
        {count > 0 && (
          <span className="absolute top-2 right-2 bg-[#6B7C5A] text-[#FFFDF8] text-[9px] font-body font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            ×{count}
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="font-body font-bold text-[13px] leading-snug text-[#22364D]">
          {trick.emoji} {trick.name}
        </p>
        <p className="text-[10.5px] font-body text-muted-foreground leading-snug mt-0.5 truncate">
          {trick.tagline}
        </p>
      </div>
    </Link>
  );
}

export default function Journey() {
  const age = wobblesAge();
  const { entries: trainingEntries } = useTrackerEntries("training");
  const [sheetOpen, setSheetOpen] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of TRICKS) map.set(t.id, practiceCount(t, trainingEntries));
    return map;
  }, [trainingEntries]);

  const totalPractices = trainingEntries.length;
  const tricksStarted = TRICKS.filter((t) => (counts.get(t.id) ?? 0) > 0).length;

  // Socialisation window: critical period ends ~16 weeks (2026-10-16 per milestones)
  const socialCloseISO = "2026-10-16";
  const socialDaysLeft = daysUntil(socialCloseISO);
  const homecomingDays = daysUntil(WOBBLES.homecoming);

  const upcoming = MILESTONES.filter((m) => daysUntil(m.date) >= 0);
  const past = MILESTONES.filter((m) => daysUntil(m.date) < 0);

  return (
    <PageShell className="pb-28">
      <PageHeader title="Journey" subtitle="Tricks, training & the road ahead" emoji="🐾" />

      {/* ===== Training summary strip ===== */}
      <section className="px-4 mt-4">
        <div className="keepsake-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#C66A3D]/12 flex items-center justify-center shrink-0">
            <GraduationCap size={20} className="text-[#C66A3D]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-[1.3rem] leading-tight text-[#22364D]">
              {totalPractices === 0
                ? "The journey starts soon"
                : `${totalPractices} training ${totalPractices === 1 ? "session" : "sessions"} logged`}
            </p>
            <p className="text-[11.5px] font-body text-muted-foreground mt-0.5">
              {tricksStarted > 0
                ? `${tricksStarted} of ${TRICKS.length} tricks started`
                : age.born
                  ? "Pick a foundation trick below to begin"
                  : `Training begins when he's home — ${homecomingDays} days`}
            </p>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="text-[11px] font-body font-extrabold text-[#B4512E] press-scale shrink-0"
          >
            Log session
          </button>
        </div>
      </section>

      {/* ===== Trick library ===== */}
      {LEVELS.map((level) => {
        const tricks = TRICKS.filter((t) => t.level === level.id);
        if (tricks.length === 0) return null;
        return (
          <section key={level.id} className="px-4 mt-7">
            <div className="px-1 mb-2.5">
              <Eyebrow>{level.label}</Eyebrow>
              <p className="text-[11.5px] font-body text-muted-foreground mt-1">{level.blurb}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {tricks.map((t) => (
                <TrickCard key={t.id} trick={t} count={counts.get(t.id) ?? 0} />
              ))}
            </div>
          </section>
        );
      })}

      <PawDivider />

      {/* ===== Socialisation sprint ===== */}
      {socialDaysLeft > 0 && (
        <section className="px-4">
          <div className="keepsake-card relative p-5">
            <span className="absolute -top-3 left-4 bg-[#6B7C5A] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
              Socialisation sprint
            </span>
            <div className="flex items-start gap-4 mt-1">
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-[1.35rem] leading-tight text-[#22364D]">
                  {socialDaysLeft} days left in the critical window
                </p>
                <p className="text-[12.5px] font-body text-[#5A6B7E] leading-relaxed mt-1.5">
                  The prime socialisation period closes around 16 weeks ({formatDate(socialCloseISO)}).
                  Every gentle new sight, sound, surface and friendly person banked before then pays
                  off for life.
                </p>
              </div>
              <div className="shrink-0 text-center w-14">
                <p className="font-display font-bold text-[1.9rem] text-[#6B7C5A] leading-none">
                  {socialDaysLeft}
                </p>
                <p className="text-[8px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground mt-1">
                  days
                </p>
              </div>
            </div>
            <Link href="/trackers/social" className="btn-ink mt-4 inline-flex">
              Log a new experience <ChevronRight size={15} />
            </Link>
          </div>
        </section>
      )}

      {/* ===== Milestone road ===== */}
      <section className="px-4 mt-7">
        <Eyebrow className="px-1 mb-2.5">The road ahead</Eyebrow>
        <div className="keepsake-card p-4">
          <ol className="space-y-0">
            {upcoming.map((m, i) => {
              const Icon = MILESTONE_ICONS[m.icon] ?? Sparkles;
              const isNext = i === 0;
              const days = daysUntil(m.date);
              return (
                <li key={m.date + m.label} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < upcoming.length - 1 && (
                    <span
                      className="absolute left-[15px] top-8 bottom-0 w-px bg-[#E5DAC8]"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                      isNext
                        ? "bg-[#C66A3D]/12 border-[#C66A3D] text-[#B4512E]"
                        : "bg-[#FFFDF8] border-[#E5DAC8] text-[#8C9BAA]",
                    )}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline gap-2">
                      <p
                        className={cn(
                          "font-body font-bold text-[13px] leading-snug",
                          isNext ? "text-[#22364D]" : "text-[#4A5B6E]",
                        )}
                      >
                        {m.label}
                      </p>
                      <span className="ml-auto shrink-0 text-[10px] font-body font-extrabold text-[#B4512E]">
                        {days === 0 ? "today" : `in ${days}d`}
                      </span>
                    </div>
                    <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                      {formatDate(m.date)}
                    </p>
                    {isNext && (
                      <p className="text-[11.5px] font-body text-[#5A6B7E] leading-relaxed mt-1">
                        {m.detail}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {past.length > 0 && (
            <p className="mt-4 pt-3 border-t border-dashed border-[#E5DAC8] text-[11px] font-body text-muted-foreground">
              {past.length} milestone{past.length === 1 ? "" : "s"} already behind him — see the
              full story on <Link href="/growth" className="font-extrabold text-[#B4512E]">Growth</Link>.
            </p>
          )}
        </div>
      </section>

      <QuickLogSheet open={sheetOpen} onOpenChange={setSheetOpen} initialTracker="training" />
    </PageShell>
  );
}

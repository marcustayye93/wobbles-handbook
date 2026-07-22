/*
 * Redesign v2.1 — "Keepsake Field Guide" Home, action-first (UX audit):
 * Cover → Wobbles Today (stage intelligence + nudges) → Quick Actions →
 * Today's timeline → Coming up → Start reading. Paper bg, Cormorant serif,
 * ink navy + sienna, restrained keepsake details.
 */
import { useState } from "react";
import { Link } from "wouter";
import { PageShell, Eyebrow } from "@/components/AppShell";
import QuickLogSheet from "@/components/QuickLogSheet";
import TodayTimeline from "@/components/TodayTimeline";
import SearchDialog from "@/components/SearchDialog";
import { wobblesToday, todaysNudges } from "@/lib/wobblesToday";
import { useLogVersion } from "@/components/QuickLogSheet";
import { readDayFeed } from "@/components/TodayTimeline";
import { todayISO } from "@/hooks/useLocalStorage";
import { ASSETS, WOBBLES, MILESTONES, wobblesAge, daysUntil, formatDate } from "@/content/wobbles";
import { SECTIONS } from "@/content/handbookSections";
import { ChevronRight, ArrowRight, PawPrint, CalendarDays, Search } from "lucide-react";

/** Countdown keepsake: picks the most relevant upcoming date */
function nextCountdown(): { days: number; label: string } | null {
  const toHome = daysUntil(WOBBLES.homecoming);
  if (toHome > 0) return { days: toHome, label: "days until homecoming" };
  const toSg = daysUntil("2026-09-18");
  if (toSg > 0) return { days: toSg, label: "days until fly-ready" };
  const next = MILESTONES.filter((m) => daysUntil(m.date) > 0)[0];
  if (next) return { days: daysUntil(next.date), label: next.label.toLowerCase() };
  return null;
}

/** Quick-action chips shown on Home (subset of trackers, one-tap logging) */
const QUICK_ACTIONS: { id: string; emoji: string; label: string }[] = [
  { id: "feeding", emoji: "🍽️", label: "Meal" },
  { id: "toilet", emoji: "🚽", label: "Toilet" },
  { id: "grooming", emoji: "✂️", label: "Groom" },
  { id: "training", emoji: "🎓", label: "Train" },
  { id: "social", emoji: "🌏", label: "Social" },
  { id: "weight", emoji: "⚖️", label: "Weigh" },
];

export default function Home() {
  const age = wobblesAge();
  const today = wobblesToday();
  const countdown = nextCountdown();
  const nextMilestones = MILESTONES.filter((m) => daysUntil(m.date) >= 0).slice(0, 3);
  const nudges = todaysNudges();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTracker, setSheetTracker] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const logVersion = useLogVersion();
  const hasFeedToday = readDayFeed(todayISO()).length > 0 || logVersion < 0; // logVersion keeps this reactive

  const quickLog = (id: string | null) => {
    setSheetTracker(id);
    setSheetOpen(true);
  };

  return (
    <PageShell className="pb-28">
      {/* ===== Cover ===== */}
      <section className="relative overflow-hidden">
        <div className="relative px-5 pt-9">
          {/* Wordmark + search */}
          <div className="flex items-center gap-2 fade-up">
            <span className="w-7 h-7 rounded-md border-[1.5px] border-[#C66A3D] text-[#C66A3D] font-display font-bold text-sm flex items-center justify-center">
              W
            </span>
            <Eyebrow>Wobbles' Handbook</Eyebrow>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search the handbook"
              className="ml-auto w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#E5DAC8] flex items-center justify-center text-[#22364D] press-scale shadow-sm"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Title + taped countdown */}
          <div className="relative mt-3">
            <h1
              className="relative z-10 font-display font-semibold text-[3.1rem] leading-[0.98] text-[#22364D] fade-up"
              style={{ animationDelay: "40ms", letterSpacing: "-0.01em" }}
            >
              Wobbles’
              <br />
              Handbook
            </h1>
            <p
              className="relative z-10 mt-3 text-[11px] font-body font-extrabold uppercase tracking-[0.2em] text-[#C66A3D] leading-relaxed fade-up"
              style={{ animationDelay: "80ms" }}
            >
              A guide. A journey.
              <br />
              A lifetime together.
            </p>

            {/* Taped countdown keepsake card */}
            {countdown && (
              <div
                className="absolute -top-2 right-0 z-20 rotate-[3deg] fade-up"
                style={{ animationDelay: "120ms" }}
              >
                <div className="relative keepsake-card w-[124px] px-3 pt-4 pb-3 text-center">
                  <span className="tape" aria-hidden />
                  <CalendarDays size={15} className="mx-auto text-[#C66A3D]" />
                  <p className="font-display font-bold text-[2.1rem] leading-none text-[#B4512E] mt-1.5">
                    {countdown.days}
                  </p>
                  <p className="text-[8px] font-body font-extrabold uppercase tracking-[0.14em] text-[#22364D] mt-1 leading-snug">
                    {countdown.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full-bleed hero illustration */}
        <div className="relative mt-4 fade-up" style={{ animationDelay: "150ms" }}>
          <img
            src={ASSETS.v2Hero}
            alt="Gouache illustration of Wobbles the red-parti Cavoodle puppy on a navy blanket"
            className="w-full aspect-[4/5] object-cover"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-16"
            style={{ background: "linear-gradient(to bottom, transparent, #F8F3EB)" }}
            aria-hidden
          />
          <span className="absolute top-3 right-4 bg-[#FFFDF8]/90 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-body font-extrabold text-[#22364D] border border-[#E5DAC8] shadow-sm">
            <PawPrint size={11} className="inline -mt-0.5 mr-1 text-[#C66A3D]" />
            {age.born ? `${age.weeks}w ${age.remDays}d old` : "coming soon"}
          </span>
        </div>
      </section>

      {/* ===== Wobbles Today card (overlapping hero) ===== */}
      <section className="relative z-10 px-4 -mt-10">
        <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "180ms" }}>
          <span className="absolute -top-3 left-4 bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
            Wobbles today
          </span>
          <div className="flex items-start gap-3 mt-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.14em] text-[#7B8C6A]">
                {today.stage}
              </p>
              <h2 className="font-display font-semibold text-[1.65rem] leading-tight text-[#22364D] mt-0.5">
                {today.title}
              </h2>
              <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed mt-1.5">{today.text}</p>
            </div>
            <img src={ASSETS.v2SpotBed} alt="" className="w-20 h-20 object-contain shrink-0 mt-1" aria-hidden />
          </div>

          {/* stage details */}
          <dl className="mt-3.5 space-y-2 border-t border-dashed border-[#E5DAC8] pt-3.5">
            {[
              ["Today's focus", today.focus],
              ["Expect", today.expect],
              ["Training", today.training],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2.5 items-baseline">
                <dt className="shrink-0 w-[86px] text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#C66A3D]">
                  {k}
                </dt>
                <dd className="text-[12.5px] font-body text-[#33475C] leading-snug">{v}</dd>
              </div>
            ))}
          </dl>

          <Link href={today.link} className="btn-ink mt-4 inline-flex">
            {today.linkLabel} <ArrowRight size={15} />
          </Link>
        </div>

        {/* Nudges */}
        {nudges.length > 0 && (
          <div className="mt-2.5 space-y-2">
            {nudges.map((n) => (
              <Link
                key={n.id}
                href={n.link}
                className="sticker-card px-4 py-2.5 flex items-center gap-3 press-scale"
              >
                <span className="text-[16px] shrink-0">{n.emoji}</span>
                <span className="min-w-0 flex-1 text-[12.5px] font-body font-bold text-[#22364D] leading-snug">
                  {n.text}
                </span>
                <ChevronRight size={15} className="text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== Quick actions ===== */}
      <section className="px-5 mt-7">
        <Eyebrow className="mb-2.5">Quick log</Eyebrow>
        <div className="grid grid-cols-6 gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => quickLog(a.id)}
              className="flex flex-col items-center gap-1 py-2.5 rounded-2xl bg-[#FFFDF8] border border-[#E5DAC8] press-scale"
            >
              <span className="text-[17px]">{a.emoji}</span>
              <span className="text-[8.5px] font-body font-extrabold uppercase tracking-wide text-[#22364D]">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== Today's timeline ===== */}
      {hasFeedToday && (
        <section className="px-4 mt-7">
          <div className="flex items-baseline justify-between px-1 mb-2.5">
            <Eyebrow>Today so far</Eyebrow>
            <Link href="/trackers" className="text-[11px] font-body font-extrabold text-[#B4512E]">
              All trackers →
            </Link>
          </div>
          <TodayTimeline dateISO={todayISO()} />
        </section>
      )}

      {/* ===== Coming up ===== */}
      {nextMilestones.length > 0 && (
        <section className="px-5 mt-8">
          <Eyebrow className="mb-2.5">Coming up</Eyebrow>
          <div className="space-y-2.5">
            {nextMilestones.map((m) => (
              <div key={m.date} className="sticker-card px-4 py-3 flex items-center gap-3.5">
                <div className="shrink-0 text-center w-12">
                  <p className="font-display font-bold text-[1.35rem] text-[#B4512E] leading-none">
                    {daysUntil(m.date)}
                  </p>
                  <p className="text-[8px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">
                    days
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-body font-bold text-[13px] leading-snug text-[#22364D]">{m.label}</p>
                  <p className="text-[11px] font-body text-muted-foreground">{formatDate(m.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Start reading ===== */}
      <section className="px-5 mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <Eyebrow>Start reading</Eyebrow>
          <Link href="/handbook" className="text-[11px] font-body font-extrabold text-[#B4512E]">
            All chapters →
          </Link>
        </div>
        <div className="space-y-2.5">
          {SECTIONS.slice(0, 4).map((s, i) => (
            <Link
              key={s.slug}
              href={`/handbook/${s.slug}`}
              className="sticker-card px-4 py-3.5 flex items-center gap-3 press-scale"
            >
              <span className="w-8 h-8 rounded-full bg-[#22364D]/6 flex items-center justify-center font-display font-bold text-sm text-[#C66A3D]">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-body font-bold text-[14px] leading-snug text-[#22364D]">
                  {s.title}
                </span>
                <span className="block text-[11px] font-body text-muted-foreground truncate">{s.tagline}</span>
              </span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="px-5 mt-9 text-center text-[11px] font-body text-muted-foreground leading-relaxed">
        Made with love for {WOBBLES.name} ({WOBBLES.pedigreeName}), born {formatDate(WOBBLES.dob)}.
      </p>

      {/* Quick-log sheet + search */}
      <QuickLogSheet open={sheetOpen} onOpenChange={setSheetOpen} initialTracker={sheetTracker} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </PageShell>
  );
}

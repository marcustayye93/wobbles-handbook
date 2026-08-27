/*
 * Home — date-switched on WOBBLES.homecoming (landing 24 Sep 2026).
 * Pre-homecoming (until 23 Sep): compact hero, countdown + irreversible admin,
 * logging demoted. Empty logs are the truth. Not a 7am logger.
 * Week-1 (from 24 Sep): decompression days 1–3, three logs only (weight /
 * toilet / sleep), book SingVet, carry-socialise, park after ≥16-week core.
 */
import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { PageShell, Eyebrow } from "@/components/AppShell";
import SyncIndicator from "@/components/SyncIndicator";
import QuickLogSheet from "@/components/QuickLogSheet";
import TodayTimeline, { useDayFeed } from "@/components/TodayTimeline";
import CareRow, { WEEK1_CARE_ACTIONS } from "@/components/CareRow";
import SearchDialog from "@/components/SearchDialog";
import { wobblesToday, todaysNudges, todaysBrief } from "@/lib/wobblesToday";
import HouseholdSettingsSheet from "@/components/HouseholdSettingsSheet";
import { SETTINGS_KEY, defaultSettings, normalizeSettings, allRemindersDone } from "@/lib/householdSettings";
import type { HouseholdSettings } from "@/lib/householdSettings";
import ReminderCelebration from "@/components/ReminderCelebration";
import { todayISO } from "@/lib/dates";
import { useTrackerFeed, useSharedState, rowToEntry } from "@/hooks/useSyncedData";
import {
  ASSETS,
  WOBBLES,
  MILESTONES,
  wobblesAge,
  daysUntil,
  formatDate,
  isPreHomecoming,
  daysHome,
} from "@/content/wobbles";
import { ChevronRight, ArrowRight, PawPrint, Search, SlidersHorizontal, Check, Sparkles, Scale, HeartPulse, Footprints } from "lucide-react";

const ADMIN_ITEMS = [
  {
    emoji: "🪪",
    title: "PALS before the import licence",
    detail: "Get his Singapore dog licence number first — AVS will not issue the import permit without it.",
  },
  {
    emoji: "🛂",
    title: "Import licence is valid 90 days",
    detail: "Not 30. Time the AVS application against the 24 Sep landing with that 90-day window.",
  },
  {
    emoji: "💉",
    title: "C3 dose 3 — 8 Sep",
    detail: "Third Protech C3 at the farm. That shot is not the 16-week core.",
  },
  {
    emoji: "🚫",
    title: "Not fully vaccinated",
    detail: "Dose 3 on 8 Sep does not make him fully protected. The ≥16-week core is ~15 Oct.",
  },
  {
    emoji: "🌳",
    title: "Not park-cleared",
    detail: "No ground time in public parks until the 16-week core plus a Singapore vet nod.",
  },
] as const;

function HisRecordRow() {
  const items = [
    { href: "/growth", label: "Growth", Icon: Scale },
    { href: "/health", label: "Health", Icon: HeartPulse },
    { href: "/journey", label: "Journey", Icon: Footprints },
  ] as const;
  return (
    <section className="px-4 mt-6">
      <Eyebrow className="px-1 mb-2.5">His record</Eyebrow>
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="sticker-card px-2 py-3 flex flex-col items-center gap-1.5 press-scale min-h-[44px]"
          >
            <Icon size={16} className="text-[#C66A3D]" />
            <span className="text-[12px] font-body font-extrabold text-[#22364D]">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const age = wobblesAge();
  const today = wobblesToday();
  const preHome = isPreHomecoming();
  const homeDays = daysHome();
  const toHome = daysUntil(WOBBLES.homecoming);
  const decompressing = !preHome && homeDays >= 0 && homeDays <= 3;
  const nextMilestones = MILESTONES.filter((m) => daysUntil(m.date) >= 0).slice(0, 3);

  const { rows } = useTrackerFeed();
  const [readProgress] = useSharedState<Record<string, number>>("readProgress", {});
  const [shoppingTicks] = useSharedState<Record<string, boolean>>("shopping", {});
  const [rawSettings, setRawSettings] = useSharedState<HouseholdSettings>(
    SETTINGS_KEY,
    defaultSettings(),
  );
  const settings = useMemo(() => normalizeSettings(rawSettings), [rawSettings]);
  const brief = useMemo(() => todaysBrief(new Date(), settings), [settings]);
  const entriesFor = useMemo(
    () => (id: string) => rows.filter((r) => r.trackerId === id).map(rowToEntry),
    [rows],
  );
  const nudges = useMemo(
    () => todaysNudges(entriesFor, readProgress, new Date(), settings, shoppingTicks),
    [entriesFor, readProgress, settings, shoppingTicks],
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTracker, setSheetTracker] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { feed: todayFeed } = useDayFeed(todayISO());
  const hasFeedToday = todayFeed.length > 0;

  const [celebrate, setCelebrate] = useState(false);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleReminder = (id: string) => {
    const r = settings.reminders[id];
    if (!r) return;
    const next: HouseholdSettings = {
      ...settings,
      reminders: { ...settings.reminders, [id]: { ...r, done: !r.done } },
    };
    const wasAllDone = allRemindersDone(new Date(), settings);
    setRawSettings(next);
    if (!wasAllDone && !r.done && allRemindersDone(new Date(), next)) {
      setCelebrate(true);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      celebrateTimer.current = setTimeout(() => setCelebrate(false), 2600);
    }
  };
  const allDoneToday = brief.reminders.length > 0 && brief.reminders.every((r) => r.done);

  const quickLog = (id: string | null) => {
    setSheetTracker(id);
    setSheetOpen(true);
  };

  return (
    <PageShell hideFab>
      {/* ===== Compact cover — next action stays one-handed ===== */}
      <section className="relative overflow-hidden">
        <div className="relative px-5 pt-7">
          <div className="flex items-center gap-2 fade-up">
            <span className="w-7 h-7 rounded-md border-[1.5px] border-[#C66A3D] text-[#C66A3D] font-display font-bold text-sm flex items-center justify-center">
              P
            </span>
            <Eyebrow>Paddington's Handbook</Eyebrow>
            <SyncIndicator className="ml-auto" />
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Household settings — schedule and reminders"
              className="w-11 h-11 rounded-full bg-[#FFFDF8] border border-[#E5DAC8] flex items-center justify-center text-[#22364D] press-scale shadow-sm"
            >
              <SlidersHorizontal size={16} />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search the handbook"
              className="w-11 h-11 rounded-full bg-[#FFFDF8] border border-[#E5DAC8] flex items-center justify-center text-[#22364D] press-scale shadow-sm"
            >
              <Search size={16} />
            </button>
            <Link
              href="/ask"
              aria-label="Ask Paddington — the family AI assistant"
              className="w-11 h-11 rounded-full bg-[#22364D] flex items-center justify-center text-[#E8935C] press-scale shadow-sm"
            >
              <Sparkles size={16} />
            </Link>
          </div>

          <div className="mt-3 fade-up" style={{ animationDelay: "40ms" }}>
            <h1 className="font-display font-semibold text-[2.15rem] leading-[1.02] text-[#22364D]">
              {preHome ? "Still in Queensland" : decompressing ? "Quiet days home" : "Welcome home"}
            </h1>
            <p className="mt-1.5 text-[12.5px] font-body text-[#5A6B7E] leading-snug">
              {preHome
                ? "Paddy stays at The Doghouse QLD until he lands 24 Sep. Empty logs are the truth — this is not a 7am logger."
                : decompressing
                  ? "Days 1–3: quiet flat, his toilet spot, crate as a den, no visitors."
                  : "Carry-socialise. Book SingVet. Grass waits for the 16-week core and a vet nod."}
            </p>
          </div>
        </div>

        <div className="relative mt-3 fade-up" style={{ animationDelay: "80ms" }}>
          <img
            src={ASSETS.v2Hero}
            alt="Gouache illustration of Paddington the red-parti Cavoodle puppy on a navy blanket"
            className="w-full aspect-[2/1] max-h-[168px] object-cover object-top"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-10"
            style={{ background: "linear-gradient(to bottom, transparent, #F8F3EB)" }}
            aria-hidden
          />
          <span className="absolute top-2.5 right-3 bg-[#FFFDF8]/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-body font-extrabold text-[#22364D] border border-[#E5DAC8] shadow-sm">
            <PawPrint size={11} className="inline -mt-0.5 mr-1 text-[#C66A3D]" />
            {age.born ? `${age.weeks}w ${age.remDays}d old` : "coming soon"}
          </span>
        </div>
      </section>

      {preHome ? (
        <>
          {/* Countdown — the lead, not a taped corner card */}
          <section className="relative z-10 px-4 -mt-6">
            <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "120ms" }}>
              <span className="absolute -top-3 left-4 bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
                Until he lands
              </span>
              <div className="flex items-end gap-3 mt-1">
                <p className="font-display font-bold text-[3.1rem] leading-none text-[#B4512E]">{Math.max(0, toHome)}</p>
                <div className="pb-1">
                  <p className="text-[11px] font-body font-extrabold uppercase tracking-[0.14em] text-[#22364D]">
                    days to 24 Sep
                  </p>
                  <p className="text-[12.5px] font-body text-[#5A6B7E] leading-snug mt-0.5">
                    Jet Pets flies 23 Sep · he lands the 24th · still in QLD until then.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Next irreversible admin */}
          <section className="px-4 mt-3">
            <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "160ms" }}>
              <span className="absolute -top-3 left-4 bg-[#22364D] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
                Next irreversible admin
              </span>
              <ul className="mt-1 space-y-3">
                {ADMIN_ITEMS.map((item) => (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <span className="text-[15px] shrink-0 leading-snug">{item.emoji}</span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-body font-bold text-[#22364D] leading-snug">
                        {item.title}
                      </span>
                      <span className="block text-[11.5px] font-body text-[#5A6B7E] leading-snug mt-0.5">
                        {item.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/singapore" className="btn-ink inline-flex justify-center">
                  Road to Singapore <ArrowRight size={15} />
                </Link>
                <Link
                  href="/handbook/shopping"
                  className="text-center text-[12px] font-body font-extrabold text-[#B4512E] py-2"
                >
                  This week's shopping countdown →
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Week-1 lead: decompression or carry-socialise */}
          <section className="relative z-10 px-4 -mt-6">
            <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "120ms" }}>
              <span className="absolute -top-3 left-4 bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
                {decompressing ? `Day ${homeDays + 1} · decompression` : "Week one at home"}
              </span>
              {decompressing ? (
                <ul className="mt-1 space-y-2 text-[13px] font-body text-[#33475C] leading-snug">
                  <li>Quiet flat — no visitors.</li>
                  <li>Show him his toilet spot (pad + downstairs grass, carried).</li>
                  <li>Crate is a den, not a timeout.</li>
                </ul>
              ) : (
                <div className="mt-1 space-y-2 text-[13px] font-body text-[#33475C] leading-snug">
                  <p>Carry-socialise: arms, not paws, until the 16-week core (~15 Oct) and a SingVet nod.</p>
                  <p>Ground and park wait. Book SingVet if you have not already.</p>
                </div>
              )}
              <Link href="/handbook/first-day" className="btn-ink mt-4 inline-flex">
                First-day guide <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* Three logs only — after the lead, never empty theatre */}
          <section className="px-4 mt-3">
            <div className="keepsake-card relative p-3.5 fade-up" style={{ animationDelay: "170ms" }}>
              <span className="absolute -top-3 left-4 bg-[#22364D] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
                Week-1 logs
              </span>
              <p className="mt-1 mb-2 text-[11px] font-body text-muted-foreground text-center">
                Weight, toilet, sleep. Toilet asks what happened — it will not invent “wee on pad”.
              </p>
              <CareRow onDetails={(id) => quickLog(id)} actions={WEEK1_CARE_ACTIONS} />
            </div>
          </section>

          <section className="px-4 mt-3">
            <Link href="/health" className="block sticker-card px-4 py-3.5 press-scale">
              <div className="flex items-center gap-3">
                <span className="shrink-0 w-10 h-10 rounded-full bg-[#22364D]/8 flex items-center justify-center text-[17px]">
                  🩺
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body font-bold text-[14px] leading-snug text-[#22364D]">
                    Book SingVet
                  </span>
                  <span className="block text-[11px] font-body text-muted-foreground leading-snug mt-0.5">
                    First Singapore vet visit — records, parasite plan, and when grass is actually allowed.
                  </span>
                </span>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </div>
            </Link>
          </section>
        </>
      )}

      {/* ===== Due today — admin/rota, not a fake care logger ===== */}
      <section className="relative z-10 px-4 mt-3">
        <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "200ms" }}>
          <span className="absolute -top-3 left-4 bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
            Due today · {brief.plan.label}
          </span>
          <p className="mt-1 text-[10px] font-body font-extrabold uppercase tracking-[0.14em] text-[#6B7C5A]">
            {brief.whoHome}
            {brief.parkNight && " · 🏞️ park night 7pm"}
          </p>
          <p className="text-[12.5px] font-body text-[#5A6B7E] leading-relaxed mt-1">{brief.plan.note}</p>

          {brief.reminders.length > 0 && (
            <div className="relative mt-3 space-y-1 border-t border-dashed border-[#E5DAC8] pt-3">
              {celebrate && <ReminderCelebration />}
              {brief.reminders.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="checkbox"
                  aria-checked={r.done === true}
                  onClick={() => toggleReminder(r.id)}
                  className="w-full flex items-start gap-2.5 py-1 text-left press-scale rounded-md min-h-[44px]"
                >
                  <span
                    aria-hidden
                    className={`mt-[1px] w-[18px] h-[18px] shrink-0 rounded-[5px] border-[1.5px] flex items-center justify-center transition-colors duration-150 ${
                      r.done
                        ? "bg-[#B4512E] border-[#B4512E] text-[#FFFDF8]"
                        : "bg-[#FFFDF8] border-[#C9BBA4] text-transparent"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span
                    className={`min-w-0 text-[12.5px] font-body font-bold leading-snug transition-colors duration-150 ${
                      r.done ? "text-muted-foreground line-through decoration-[#C9BBA4]" : "text-[#22364D]"
                    }`}
                  >
                    {r.person && (
                      <span
                        className={`mr-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] ${
                          r.done ? "text-muted-foreground" : "text-[#B4512E]"
                        }`}
                      >
                        {r.person === "marcus" ? "Marcus" : "Chesa"}
                      </span>
                    )}
                    {r.text}
                  </span>
                </button>
              ))}
              {allDoneToday && (
                <p className="pt-1 text-[11px] font-body font-extrabold text-[#6B7C5A]">
                  🎉 All of today's reminders done — good humans.
                </p>
              )}
            </div>
          )}

          {brief.care.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-dashed border-[#E5DAC8] pt-3">
              {brief.care.map((c) => (
                <Link key={c.id} href={c.link} className="flex items-start gap-2.5 press-scale">
                  <span className="text-[15px] shrink-0 leading-snug">{c.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-body font-bold text-[#22364D] leading-snug">
                      {c.label}
                      {c.owner !== "both" && (
                        <span className="ml-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#B4512E]">
                          {c.owner === "marcus" ? "Marcus" : "Chesa"}
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] font-body text-muted-foreground leading-snug">{c.detail}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {nudges.length > 0 && (
          <div className="mt-2.5 space-y-2">
            {nudges.map((n) => {
              const inner = (
                <>
                  <span className="text-[16px] shrink-0">{n.emoji}</span>
                  <span className="min-w-0 flex-1 text-[12.5px] font-body font-bold text-[#22364D] leading-snug">
                    {n.person && (
                      <span className="mr-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#B4512E] align-middle">
                        {n.person}
                      </span>
                    )}
                    {n.text}
                  </span>
                  {n.link && <ChevronRight size={15} className="text-muted-foreground shrink-0" />}
                </>
              );
              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  className="sticker-card px-4 py-2.5 flex items-center gap-3 press-scale"
                >
                  {inner}
                </Link>
              ) : (
                <div key={n.id} className="sticker-card px-4 py-2.5 flex items-center gap-3">
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== Paddington Today ===== */}
      <section className="relative z-10 px-4 mt-6">
        <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "230ms" }}>
          <span className="absolute -top-3 left-4 bg-[#22364D] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
            Paddington today
          </span>
          <div className="flex items-start gap-3 mt-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.14em] text-[#6B7C5A]">
                {today.stage}
              </p>
              <h2 className="font-display font-semibold text-[1.65rem] leading-tight text-[#22364D] mt-0.5">
                {today.title}
              </h2>
              <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed mt-1.5">{today.text}</p>
            </div>
            <img src={ASSETS.v2SpotBed} alt="" className="w-20 h-20 object-contain shrink-0 mt-1" aria-hidden />
          </div>

          <dl className="mt-3.5 space-y-2 border-t border-dashed border-[#E5DAC8] pt-3.5">
            {[
              ["Today's focus", today.focus],
              ["Expect", today.expect],
              ["Training", today.training],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2.5 items-baseline">
                <dt className="shrink-0 w-[86px] text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E]">
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
      </section>

      <HisRecordRow />

      {/* ===== Ask Paddington ===== */}
      <section className="px-4 mt-6">
        <Link href="/ask" className="block sticker-card px-4 py-3.5 press-scale">
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-10 h-10 rounded-full bg-[#22364D] flex items-center justify-center">
              <Sparkles size={17} className="text-[#E8935C]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-body font-bold text-[14px] leading-snug text-[#22364D]">
                Ask Paddington anything
              </span>
              <span className="block text-[11px] font-body text-muted-foreground leading-snug mt-0.5">
                An assistant that knows his age and stage — and remembers what you tell it.
              </span>
            </span>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </div>
        </Link>
      </section>

      {/* Timeline only when there is a real log — empty is the truth */}
      {hasFeedToday && (
        <section className="px-4 mt-7">
          <div className="flex items-baseline justify-between px-1 mb-2.5">
            <Eyebrow>Today so far</Eyebrow>
            <Link href="/trackers" className="text-[11px] font-body font-extrabold text-[#B4512E]">
              All logs →
            </Link>
          </div>
          <TodayTimeline dateISO={todayISO()} />
        </section>
      )}

      {preHome && (
        <section className="px-4 mt-6">
          <p className="text-center text-[11.5px] font-body text-muted-foreground leading-relaxed px-2">
            Logging waits until he is home. Empty logs are the truth.
          </p>
        </section>
      )}

      {nextMilestones.length > 0 && (
        <section className="px-5 mt-8">
          <Eyebrow className="mb-2.5">Coming up</Eyebrow>
          <div className="space-y-2.5">
            {nextMilestones.map((m) => (
              <div key={`${m.date}-${m.label}`} className="sticker-card px-4 py-3 flex items-center gap-3.5">
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

      <section className="px-4 mt-8">
        <Link href="/handbook" className="block sticker-card px-4 py-3.5 press-scale">
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-10 h-10 rounded-full bg-[#22364D]/6 flex items-center justify-center text-[17px]">
              📖
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-body font-bold text-[14px] leading-snug text-[#22364D]">
                The handbook — all chapters
              </span>
              <span className="block text-[11px] font-body text-muted-foreground leading-snug mt-0.5">
                First Day, this week's admin, and the rest of the guides.
              </span>
            </span>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </div>
        </Link>
      </section>

      <p className="px-5 mt-9 text-center text-[11px] font-body text-muted-foreground leading-relaxed">
        Made with love for {WOBBLES.name} ({WOBBLES.pedigreeName}), born {formatDate(WOBBLES.dob)}.
      </p>

      <QuickLogSheet open={sheetOpen} onOpenChange={setSheetOpen} initialTracker={sheetTracker} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <HouseholdSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </PageShell>
  );
}

/*
 * Health tab — Wobbles' complete medical picture in one place.
 * Due today (full care rota) → Due this week (7-day rota preview) →
 * Vaccine schedule (milestone dates vs today + logged doses) →
 * Parasite preventive (next 24th) → Vet visit log (vaccines tracker) →
 * Weight verdict summary (links to Growth) → Recent poo quality.
 * Home keeps only the short strip; this page is the full record.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { PageShell, PageHeader, Eyebrow } from "@/components/AppShell";
import QuickLogSheet from "@/components/QuickLogSheet";
import { useTrackerEntries } from "@/hooks/useSyncedData";
import { careTasksFor, type CareTask } from "@/content/household";
import { WOBBLES, MILESTONES, wobblesAge, daysUntil, formatDate } from "@/content/wobbles";
import { growthVerdict } from "@/lib/growthBand";
import { cn } from "@/lib/utils";
import {
  Syringe,
  Shield,
  Stethoscope,
  Scale,
  ChevronRight,
  Plus,
  CalendarDays,
  Check,
} from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Local yyyy-mm-dd for a Date (avoids UTC drift) */
function isoOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next monthly parasite dose — the 24th of this month, or next month if passed. */
export function nextParasiteDose(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), 24);
  if (now.getDate() > 24) return new Date(now.getFullYear(), now.getMonth() + 1, 24);
  return d;
}

/** The health-relevant milestone schedule (vaccines, vet, parasite, sterilisation). */
const HEALTH_ICONS = ["syringe", "shield", "stethoscope", "scissors", "cake"];
function healthMilestones() {
  return MILESTONES.filter((m) => HEALTH_ICONS.includes(m.icon));
}

function CareTaskRow({ task }: { task: CareTask }) {
  return (
    <Link href={task.link} className="flex items-start gap-2.5 press-scale">
      <span className="text-[15px] shrink-0 leading-snug">{task.emoji}</span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-body font-bold text-[#22364D] leading-snug">
          {task.label}
          {task.owner !== "both" && (
            <span className="ml-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#B4512E]">
              {task.owner === "marcus" ? "Marcus" : "Chesa"}
            </span>
          )}
        </span>
        <span className="block text-[11px] font-body text-muted-foreground leading-snug">
          {task.detail}
        </span>
      </span>
    </Link>
  );
}

export default function Health() {
  const [now] = useState(() => new Date());
  const age = wobblesAge(now);
  const homecomingFuture = daysUntil(WOBBLES.homecoming, now) > 0;

  const { entries: vaccineEntries, isLoading: vacLoading } = useTrackerEntries("vaccines");
  const { entries: stoolEntries } = useTrackerEntries("stool");
  const { entries: weightEntries } = useTrackerEntries("weight");

  const verdict = useMemo(() => growthVerdict(weightEntries), [weightEntries]);

  const dueToday = useMemo(() => careTasksFor(now), [now]);
  // Next 6 days after today, grouped by day (rota preview)
  const week = useMemo(() => {
    const days: { date: Date; iso: string; label: string; tasks: CareTask[] }[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const tasks = careTasksFor(d);
      if (tasks.length > 0)
        days.push({
          date: d,
          iso: isoOf(d),
          label: `${DAY_NAMES[d.getDay()]} · ${formatDate(isoOf(d))}`,
          tasks,
        });
    }
    return days;
  }, [now]);

  const schedule = useMemo(() => healthMilestones(), []);
  const parasiteNext = useMemo(() => nextParasiteDose(now), [now]);
  const parasiteLogged = useMemo(
    () =>
      vaccineEntries.filter(
        (e) => e.option === "Flea / tick / heartworm dose" || e.option === "Worming dose",
      )[0],
    [vaccineEntries],
  );
  const recentStool = useMemo(
    () =>
      [...stoolEntries]
        .sort((a, b) => (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? "")))
        .slice(0, 5),
    [stoolEntries],
  );
  const vetLog = useMemo(
    () =>
      [...vaccineEntries].sort((a, b) =>
        (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? "")),
      ),
    [vaccineEntries],
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  const todayISOstr = isoOf(now);

  return (
    <PageShell className="pb-28">
      <PageHeader
        emoji="🩺"
        title="Health"
        subtitle={
          age.born
            ? `The full medical record — ${age.weeks}w ${age.remDays}d old`
            : "The full medical record, ready for his arrival"
        }
      />

      {/* ===== Due today ===== */}
      <section className="px-4 mt-2">
        <div className="keepsake-card relative p-5 fade-up">
          <span className="absolute -top-3 left-4 bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
            Due today
          </span>
          {dueToday.length > 0 ? (
            <div className="mt-1 space-y-2.5">
              {dueToday.map((t) => (
                <CareTaskRow key={t.id} task={t} />
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[12.5px] font-body text-[#5A6B7E] leading-relaxed">
              Nothing on the care rota today — just the usual meals, walks and love. 🐾
            </p>
          )}
        </div>
      </section>

      {/* ===== Due this week ===== */}
      <section className="px-4 mt-6">
        <Eyebrow className="mb-2.5 px-1">Due this week</Eyebrow>
        {week.length > 0 ? (
          <div className="space-y-2.5">
            {week.map((d) => (
              <div key={d.iso} className="sticker-card px-4 py-3">
                <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-[#6B7C5A]">
                  {d.label}
                </p>
                <div className="mt-2 space-y-2">
                  {d.tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-[14px] shrink-0">{t.emoji}</span>
                      <span className="min-w-0 text-[12px] font-body font-bold text-[#22364D] leading-snug">
                        {t.label}
                        {t.owner !== "both" && (
                          <span className="ml-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#B4512E]">
                            {t.owner === "marcus" ? "Marcus" : "Chesa"}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-1 text-[12px] font-body text-muted-foreground">
            A quiet week on the rota.
          </p>
        )}
      </section>

      {/* ===== Parasite preventive ===== */}
      <section className="px-4 mt-6">
        <div className="sticker-card px-4 py-3.5 flex items-center gap-3.5">
          <span className="shrink-0 w-10 h-10 rounded-full bg-[#6B7C5A]/12 flex items-center justify-center">
            <Shield size={17} className="text-[#6B7C5A]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body font-bold text-[13.5px] leading-snug text-[#22364D]">
              Next parasite dose · {formatDate(isoOf(parasiteNext))}
            </p>
            <p className="text-[11px] font-body text-muted-foreground leading-snug mt-0.5">
              {parasiteLogged
                ? `Last dose logged ${formatDate(parasiteLogged.date)} (${parasiteLogged.option}).`
                : homecomingFuture
                  ? "Starts at the first Singapore vet visit — then the 24th of every month, forever."
                  : "No dose logged yet — the rota expects one every 24th of the month."}
            </p>
          </div>
          <p className="shrink-0 text-center">
            <span className="block font-display font-bold text-[1.35rem] text-[#B4512E] leading-none">
              {Math.max(0, daysUntil(isoOf(parasiteNext), now))}
            </span>
            <span className="block text-[8px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">
              days
            </span>
          </p>
        </div>
      </section>

      {/* ===== Vaccine & vet schedule ===== */}
      <section className="px-4 mt-7">
        <Eyebrow className="mb-2.5 px-1">Vaccine & vet schedule</Eyebrow>
        <div className="keepsake-card p-4">
          <ol className="space-y-0">
            {schedule.map((m, i) => {
              const past = m.date <= todayISOstr;
              const isNext = !past && schedule.findIndex((x) => x.date > todayISOstr) === i;
              const Icon =
                m.icon === "syringe" ? Syringe : m.icon === "shield" ? Shield : Stethoscope;
              return (
                <li key={`${m.date}-${m.label}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < schedule.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-7 bottom-0 w-px border-l border-dashed border-[#D8CBB2]"
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 w-[27px] h-[27px] shrink-0 rounded-full border-[1.5px] flex items-center justify-center",
                      past
                        ? "bg-[#6B7C5A] border-[#6B7C5A] text-[#FFFDF8]"
                        : isNext
                          ? "bg-[#FFFDF8] border-[#C66A3D] text-[#C66A3D]"
                          : "bg-[#FFFDF8] border-[#D8CBB2] text-[#A99B82]",
                    )}
                  >
                    {past ? <Check size={13} strokeWidth={3} /> : <Icon size={13} />}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={cn(
                        "text-[9px] font-body font-extrabold uppercase tracking-[0.12em]",
                        past ? "text-[#6B7C5A]" : isNext ? "text-[#C66A3D]" : "text-muted-foreground",
                      )}
                    >
                      {formatDate(m.date)}
                      {isNext && " · next up"}
                      {!past && !isNext && ` · in ${daysUntil(m.date, now)} days`}
                    </p>
                    <p className="font-body font-bold text-[13px] leading-snug text-[#22364D] mt-0.5">
                      {m.label}
                    </p>
                    <p className="text-[11px] font-body text-muted-foreground leading-snug mt-0.5">
                      {m.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ===== Vet visit & dose log ===== */}
      <section className="px-4 mt-7">
        <div className="flex items-baseline justify-between px-1 mb-2.5">
          <Eyebrow>Vet visits & doses</Eyebrow>
          <Link href="/trackers/vaccines" className="text-[11px] font-body font-extrabold text-[#B4512E]">
            Full tracker →
          </Link>
        </div>
        {vacLoading ? (
          <p className="px-1 text-[12px] font-body text-muted-foreground">Loading the record…</p>
        ) : vetLog.length > 0 ? (
          <div className="space-y-2">
            {vetLog.slice(0, 8).map((e) => (
              <div key={e.id} className="sticker-card px-4 py-2.5 flex items-center gap-3">
                <span className="text-[15px] shrink-0">💉</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-body font-bold text-[#22364D] leading-snug">
                    {e.option ?? "Health event"}
                  </span>
                  <span className="block text-[10.5px] font-body text-muted-foreground leading-snug">
                    {formatDate(e.date)}
                    {e.note ? ` · ${e.note}` : ""}
                    {e.createdByName ? ` · logged by ${e.createdByName}` : ""}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="sticker-card px-4 py-4 text-center">
            <p className="text-[12.5px] font-body text-[#5A6B7E] leading-relaxed">
              No vet events logged yet. Every shot, worming dose and check-up goes here — AVS wants
              the full history for the Singapore paperwork.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="btn-ink mt-3 inline-flex items-center gap-1.5"
        >
          <Plus size={15} /> Log a vet event
        </button>
      </section>

      {/* ===== Weight verdict summary ===== */}
      <section className="px-4 mt-7">
        <Link href="/growth" className="block sticker-card px-4 py-3.5 press-scale">
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-10 h-10 rounded-full bg-[#3E6B9E]/12 flex items-center justify-center">
              <Scale size={17} className="text-[#3E6B9E]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-body font-bold text-[14px] leading-snug text-[#22364D]">
                {verdict
                  ? `${verdict.kg.toFixed(1)} kg — ${
                      verdict.status === "on-track"
                        ? "on track"
                        : verdict.status === "above"
                          ? "above the curve"
                          : "below the curve"
                    }`
                  : "Growth curve — no weigh-ins yet"}
              </span>
              <span className="block text-[11px] font-body text-muted-foreground leading-snug mt-0.5">
                {verdict
                  ? verdict.text
                  : "The blue expected curve is waiting for his first weigh-in."}
              </span>
            </span>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </div>
        </Link>
      </section>

      {/* ===== Recent poo quality ===== */}
      <section className="px-4 mt-7">
        <div className="flex items-baseline justify-between px-1 mb-2.5">
          <Eyebrow>Recent poo quality</Eyebrow>
          <Link href="/trackers/stool" className="text-[11px] font-body font-extrabold text-[#B4512E]">
            Full journal →
          </Link>
        </div>
        {recentStool.length > 0 ? (
          <div className="sticker-card px-4 py-3 space-y-2">
            {recentStool.map((e) => {
              const score = typeof e.value === "number" ? e.value : null;
              const good = score != null && score >= 2 && score <= 3;
              return (
                <div key={e.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[15px]",
                      good ? "bg-[#6B7C5A]/12 text-[#6B7C5A]" : "bg-[#B4512E]/10 text-[#B4512E]",
                    )}
                  >
                    {score ?? "–"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-body font-bold text-[#22364D] leading-snug">
                      Score {score ?? "?"}/7 {good ? "· ideal range" : score != null ? "· watch it" : ""}
                    </span>
                    <span className="block text-[10.5px] font-body text-muted-foreground leading-snug">
                      {formatDate(e.date)}
                      {e.time ? ` · ${e.time}` : ""}
                      {e.note ? ` · ${e.note}` : ""}
                    </span>
                  </span>
                </div>
              );
            })}
            <p className="pt-1 text-[10px] font-body text-muted-foreground border-t border-dashed border-[#E5DAC8]">
              2–3 is the ideal range. Persistent 6–7s for more than a day → call the vet.
            </p>
          </div>
        ) : (
          <div className="sticker-card px-4 py-4 text-center">
            <p className="text-[12.5px] font-body text-[#5A6B7E] leading-relaxed">
              No poo scores yet — log daily in the first month home and trends will show here.
            </p>
          </div>
        )}
      </section>

      {/* Footer note */}
      <p className="px-5 mt-9 text-center text-[11px] font-body text-muted-foreground leading-relaxed flex items-center justify-center gap-1.5">
        <CalendarDays size={12} className="inline" />
        Rota: baths every other Monday, nails & ears Mondays, teeth Tue/Thu/Sat, parasite dose the 24th.
      </p>

      <QuickLogSheet open={sheetOpen} onOpenChange={setSheetOpen} initialTracker="vaccines" />
    </PageShell>
  );
}

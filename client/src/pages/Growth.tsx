/*
 * Growth tab — Wobbles' growth yardstick and life timeline.
 * Top: full-life weight chart (8w → 60w). BLUE line = expected weight for a
 * toy Cavoodle peaking at ≈6 kg (with a soft expected band). ORANGE line =
 * Wobbles' actual weigh-ins snapped onto the same axis. With no weigh-ins yet,
 * only the blue yardstick shows.
 * Below: on-track verdict card, quick "log a weigh-in" access, current age
 * card, and the age/milestone timeline (past + upcoming).
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from "recharts";
import { PageShell, PageHeader, Eyebrow } from "@/components/AppShell";
import QuickLogSheet from "@/components/QuickLogSheet";
import { useTrackerEntries, useTrackerFeed } from "@/hooks/useSyncedData";
import { trpc } from "@/lib/trpc";
import { yearsWithData } from "@/lib/yearScale";
import { growthCurveSeries, growthVerdict, ageWeeksOn } from "@/lib/growthBand";
import { WOBBLES, MILESTONES, wobblesAge, daysUntil, formatDate } from "@/content/wobbles";
import { cn } from "@/lib/utils";
import {
  Scale,
  ChevronRight,
  Star,
  Hand,
  Syringe,
  BadgeCheck,
  Shield,
  Stethoscope,
  Home as HomeIcon,
  Plane,
  Footprints,
  Sparkles,
} from "lucide-react";

const INK = "#22364D";
const SIENNA = "#C66A3D";
const BLUE = "#3E6B9E"; // expected-curve blue
const ORANGE = "#E07A3F"; // actual-line orange

const MILESTONE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  star: Star,
  hand: Hand,
  syringe: Syringe,
  "badge-check": BadgeCheck,
  shield: Shield,
  stethoscope: Stethoscope,
  home: HomeIcon,
  plane: Plane,
  footprints: Footprints,
};

export default function Growth() {
  const { entries: weighIns } = useTrackerEntries("weight");
  const { rows: allRows } = useTrackerFeed();
  const { data: photos } = trpc.photos.list.useQuery(undefined, { staleTime: 5 * 60_000 });
  const [sheetOpen, setSheetOpen] = useState(false);

  // U4 — years that have any logged data drive the Year-in-review cards
  const years = useMemo(
    () =>
      yearsWithData(
        allRows,
        (photos ?? []).map((p) => ({ id: p.id, date: p.date, url: p.url, caption: p.caption })),
      ),
    [allRows, photos],
  );

  const curve = useMemo(
    () => growthCurveSeries(weighIns.map((e) => ({ date: e.date, value: e.value }))),
    [weighIns],
  );
  const verdict = useMemo(
    () => growthVerdict(weighIns.map((e) => ({ date: e.date, value: e.value }))),
    [weighIns],
  );

  const age = wobblesAge();
  const ageWeeksNow = ageWeeksOn(new Date().toISOString().slice(0, 10));
  const hasWeighIns = weighIns.some((e) => typeof e.value === "number" && e.value > 0);
  const latest = [...weighIns]
    .filter((e) => typeof e.value === "number" && e.value > 0)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  // Timeline: split into past and upcoming relative to today
  const sorted = [...MILESTONES].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((m) => daysUntil(m.date) >= 0);
  const past = sorted.filter((m) => daysUntil(m.date) < 0);

  return (
    <PageShell className="pb-28">
      <PageHeader title="Growth" subtitle="His yardstick to ≈6 kg" emoji="📈" />

      {/* ===== Age card ===== */}
      <section className="px-4 mt-4">
        <div className="keepsake-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#3E6B9E]/10 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-[#3E6B9E]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-[1.3rem] leading-tight text-[#22364D]">
              {age.born ? `${age.weeks} weeks ${age.remDays} days old` : "Not born yet"}
            </p>
            <p className="text-[11.5px] font-body text-muted-foreground mt-0.5">
              Born {formatDate(WOBBLES.dob)} · expected adult weight {WOBBLES.expectedAdultWeight}
            </p>
          </div>
          {latest && (
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-[1.35rem] text-[#B4512E] leading-none">
                {latest.value} kg
              </p>
              <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground mt-1">
                last weigh-in
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===== Growth chart ===== */}
      <section className="px-4 mt-4">
        <div className="keepsake-card p-4">
          <div className="flex items-baseline justify-between">
            <Eyebrow>Weight vs expected</Eyebrow>
            <button
              onClick={() => setSheetOpen(true)}
              className="text-[11px] font-body font-extrabold text-[#B4512E] press-scale inline-flex items-center gap-1"
            >
              <Scale size={12} /> Log weigh-in
            </button>
          </div>
          <div className="h-52 -ml-3 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(34,54,77,0.1)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9.5, fontFamily: "Nunito Sans" }}
                  stroke="rgba(34,54,77,0.45)"
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "Nunito Sans" }}
                  stroke="rgba(34,54,77,0.45)"
                  width={34}
                  domain={[0, 7]}
                  tickFormatter={(v) => `${v}`}
                />
                <ChartTooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid rgba(34,54,77,0.15)",
                    background: "#FFFDF8",
                    fontSize: 12,
                    fontFamily: "Nunito Sans",
                  }}
                  formatter={(v: number | string, name: string) => {
                    if (name === "expected") return [`${v} kg`, "Expected"];
                    if (name === "actual") return [`${v} kg`, "Wobbles"];
                    if (name === "bandMax") return [`${v} kg`, "Band high"];
                    if (name === "bandMin") return [`${v} kg`, "Band low"];
                    return [`${v} kg`, name];
                  }}
                />
                {/* soft expected corridor */}
                <Area type="monotone" dataKey="bandMax" stroke="none" fill="rgba(62,107,158,0.10)" fillOpacity={1} activeDot={false} />
                <Area type="monotone" dataKey="bandMin" stroke="none" fill="#FFFDF8" fillOpacity={1} activeDot={false} />
                {/* blue expected midline */}
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke={BLUE}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={false}
                />
                {/* orange actual line — mounted only once weigh-ins exist */}
                {hasWeighIns && (
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke={ORANGE}
                    strokeWidth={2.5}
                    connectNulls
                    dot={{ r: 4, fill: ORANGE }}
                    activeDot={{ r: 5.5 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* legend */}
          <div className="flex items-center gap-4 mt-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-body font-extrabold text-[#3E6B9E]">
              <span className="w-4 h-0.5 rounded-full" style={{ background: BLUE }} /> Expected (≈6 kg adult)
            </span>
            {hasWeighIns && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-body font-extrabold" style={{ color: ORANGE }}>
                <span className="w-4 h-0.5 rounded-full" style={{ background: ORANGE }} /> Wobbles
              </span>
            )}
          </div>

          {!hasWeighIns && (
            <p className="mt-2 text-[11px] font-body text-muted-foreground leading-relaxed">
              No weigh-ins yet — the blue line is his yardstick. Log the first weigh-in and the
              orange line starts tracking him against it.
            </p>
          )}
        </div>

        {/* verdict card */}
        {verdict && (
          <div
            className={cn(
              "sticker-card px-4 py-3 mt-2.5 flex items-start gap-3",
              verdict.status === "on-track" ? "border-[#6B7C5A]/40" : "border-[#B4512E]/40",
            )}
          >
            <span className="text-[18px] shrink-0 mt-0.5">
              {verdict.status === "on-track" ? "✅" : verdict.status === "below" ? "📉" : "📈"}
            </span>
            <div className="min-w-0">
              <p className="font-body font-bold text-[13px] leading-snug text-[#22364D]">
                {verdict.status === "on-track"
                  ? "On track"
                  : verdict.status === "below"
                    ? "Running light"
                    : "Running heavy"}
                {" · "}
                {verdict.kg} kg (expected {verdict.band.min}–{verdict.band.max} kg)
              </p>
              <p className="text-[11.5px] font-body text-muted-foreground leading-relaxed mt-0.5">
                {verdict.text}
              </p>
            </div>
          </div>
        )}

        {/* link to full weight log */}
        <Link
          href="/trackers/weight"
          className="sticker-card px-4 py-3 mt-2.5 flex items-center gap-3 press-scale"
        >
          <span className="text-[16px] shrink-0">⚖️</span>
          <span className="min-w-0 flex-1 text-[12.5px] font-body font-bold text-[#22364D]">
            Full weigh-in log & history
          </span>
          <ChevronRight size={15} className="text-muted-foreground shrink-0" />
        </Link>
      </section>

      {/* ===== Milestone timeline ===== */}
      <section className="px-4 mt-7">
        <Eyebrow className="px-1 mb-3">His journey so far & ahead</Eyebrow>

        <div className="relative pl-5">
          {/* spine */}
          <span
            className="absolute left-[7px] top-1 bottom-1 w-[2px] rounded-full bg-[#22364D]/12"
            aria-hidden
          />
          <div className="space-y-3">
            {sorted.map((m) => {
              const days = daysUntil(m.date);
              const isPast = days < 0;
              const isNext = upcoming[0]?.date === m.date && upcoming[0]?.label === m.label;
              const Icon = MILESTONE_ICONS[m.icon] ?? Star;
              return (
                <div key={`${m.date}-${m.label}`} className="relative">
                  {/* node */}
                  <span
                    className={cn(
                      "absolute -left-5 top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      isPast
                        ? "bg-[#6B7C5A] border-[#6B7C5A]"
                        : isNext
                          ? "bg-[#C66A3D] border-[#C66A3D]"
                          : "bg-[#FFFDF8] border-[#22364D]/25",
                    )}
                    style={{ transform: "translateX(-1px)" }}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      "keepsake-card px-4 py-3",
                      isNext && "ring-1 ring-[#C66A3D]/40",
                      isPast && "opacity-75",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={isPast ? "text-[#6B7C5A]" : "text-[#C66A3D]"} />
                      <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                        {formatDate(m.date)}
                        {days > 0 && (
                          <span className="text-[#B4512E]"> · in {days} day{days === 1 ? "" : "s"}</span>
                        )}
                        {days === 0 && <span className="text-[#B4512E]"> · today</span>}
                        {isPast && <span className="text-[#6B7C5A]"> · done</span>}
                      </p>
                    </div>
                    <p className="font-body font-bold text-[13.5px] leading-snug text-[#22364D] mt-1">
                      {m.label}
                    </p>
                    <p className="text-[11.5px] font-body text-muted-foreground leading-relaxed mt-1">
                      {m.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-center text-[10.5px] font-body text-muted-foreground">
          {past.length} done · {upcoming.length} ahead · {age.born ? `week ${Math.floor(ageWeeksNow)}` : "counting down"}
        </p>
      </section>

      {/* ===== Year in review (U4) ===== */}
      {years.length > 0 && (
        <section className="px-4 mt-7">
          <Eyebrow className="px-1 mb-2.5">Year in review</Eyebrow>
          <div className="space-y-2.5">
            {years.map((y) => (
              <Link
                key={y}
                href={`/growth/year/${y}`}
                className="sticker-card px-4 py-3.5 flex items-center gap-3.5 press-scale"
              >
                <span className="w-10 h-10 rounded-2xl bg-[#22364D]/6 flex items-center justify-center font-display font-bold text-[15px] text-[#C66A3D] shrink-0">
                  {String(y).slice(2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body font-bold text-[14px] leading-snug text-[#22364D]">
                    {y} — the story of the year
                  </span>
                  <span className="block text-[11px] font-body text-muted-foreground mt-0.5">
                    Weight journey, totals, milestones & photos
                  </span>
                </span>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <QuickLogSheet open={sheetOpen} onOpenChange={setSheetOpen} initialTracker="weight" />
    </PageShell>
  );
}

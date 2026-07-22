/*
 * Redesign v2 — "Keepsake Field Guide" Home cover, matching the approved mockup:
 * Paper bg, W badge + eyebrow wordmark, huge Cormorant serif title, sienna caps
 * tagline, taped countdown keepsake card, full-bleed gouache hero of Wobbles,
 * "Right Now" ivory card with spot illustration + navy CTA pill.
 */
import { Link } from "wouter";
import { PageShell, Eyebrow } from "@/components/AppShell";
import { ASSETS, WOBBLES, MILESTONES, wobblesAge, daysUntil, formatDate } from "@/content/wobbles";
import { SECTIONS } from "@/content/handbookSections";
import { ChevronRight, ArrowRight, PawPrint, CalendarDays } from "lucide-react";

/** Age-driven "right now" guidance */
function currentGuidance(): { title: string; text: string; link: string; linkLabel: string } {
  const age = wobblesAge();
  const toHome = daysUntil(WOBBLES.homecoming);
  if (!age.born)
    return {
      title: "Counting Down to Wobbles",
      text: "He hasn't been born yet — use this time to read the handbook and prepare the house.",
      link: "/handbook/checklists",
      linkLabel: "Arrival checklist",
    };
  if (toHome > 0)
    return {
      title: "Settle In, Little One",
      text: `Wobbles is ${age.weeks} weeks old, growing up with his litter at The Doghouse QLD. Perfect time to puppy-proof, shop the kit list and read the first-day guide.`,
      link: "/handbook/first-day",
      linkLabel: "See guidance",
    };
  if (age.weeks < 16)
    return {
      title: "The Window Is Open",
      text: `At ${age.weeks} weeks, every calm new sight, sound and surface is building his adult brain. One tiny new experience a day.`,
      link: "/trackers/social",
      linkLabel: "Log an experience",
    };
  if (age.months < 6)
    return {
      title: "Adolescent Brain, Baby Coat",
      text: `${age.months} months old — keep training sessions short and keep brushing daily so the brush stays a friend before the coat change hits.`,
      link: "/handbook/grooming-psychology",
      linkLabel: "See guidance",
    };
  if (age.months < 12)
    return {
      title: "Coat Change Season",
      text: "Between 6–12 months the adult fleece coat comes in and matting peaks. Daily line brushing, shorter cuts, and patience.",
      link: "/handbook/coat-science",
      linkLabel: "See guidance",
    };
  return {
    title: "All Grown Up (Mostly)",
    text: "Keep the routines: brush most days, groom every 4–6 weeks, and log health notes in the trackers.",
    link: "/trackers",
    linkLabel: "Open trackers",
  };
}

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

export default function Home() {
  const age = wobblesAge();
  const guide = currentGuidance();
  const countdown = nextCountdown();
  const nextMilestones = MILESTONES.filter((m) => daysUntil(m.date) >= 0).slice(0, 3);

  return (
    <PageShell className="pb-28">
      {/* ===== Cover ===== */}
      <section className="relative overflow-hidden">
        <div className="relative px-5 pt-9">
          {/* Wordmark */}
          <div className="flex items-center gap-2 fade-up">
            <span className="w-7 h-7 rounded-md border-[1.5px] border-[#C66A3D] text-[#C66A3D] font-display font-bold text-sm flex items-center justify-center">
              W
            </span>
            <Eyebrow>Wobbles' Handbook</Eyebrow>
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
          {/* soft fade into paper at the bottom */}
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

      {/* ===== Right Now card (overlapping hero) ===== */}
      <section className="relative z-10 px-4 -mt-10">
        <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "180ms" }}>
          <span className="tape" aria-hidden />
          <span className="absolute -top-3 left-4 bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
            Right now
          </span>
          <div className="flex items-start gap-3 mt-1">
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-semibold text-[1.65rem] leading-tight text-[#22364D]">
                {guide.title}
              </h2>
              <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed mt-1.5">{guide.text}</p>
              <Link href={guide.link} className="btn-ink mt-4 inline-flex">
                {guide.linkLabel} <ArrowRight size={15} />
              </Link>
            </div>
            <img
              src={ASSETS.v2SpotBed}
              alt=""
              className="w-20 h-20 object-contain shrink-0 mt-1"
              aria-hidden
            />
          </div>
        </div>
      </section>

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
    </PageShell>
  );
}

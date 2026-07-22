/*
 * Training tab — priority-ordered puppy curriculum for Wobbles.
 * Keepsake field-guide style: numbered syllabus index (jump chips), golden
 * rules, then one illustrated step-by-step card per skill with an age-aware
 * status badge (Start now / Soon / Later) and a link into the Training Log.
 */
import { useState } from "react";
import { Link } from "wouter";
import { PageShell, PageHeader, PawDivider, Eyebrow } from "@/components/AppShell";
import { TRAINING_SKILLS, TRAINING_RULES, skillStatus } from "@/content/training";
import { wobblesAge } from "@/content/wobbles";
import { PawPrint, ChevronDown, ChevronRight, Lightbulb, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  now: { label: "Start now", cls: "bg-[#6B7C5A] text-[#F8F3EB]" },
  soon: { label: "Soon", cls: "bg-[#C66A3D] text-[#F8F3EB]" },
  later: { label: "Later", cls: "bg-[#22364D]/10 text-[#22364D]" },
};

export default function Training() {
  const age = wobblesAge();
  const ageWeeks = age.born ? age.weeks + age.remDays / 7 : 0;
  const [open, setOpen] = useState<string | null>(TRAINING_SKILLS[0].slug);

  const jump = (slug: string) => {
    setOpen(slug);
    // wait a tick so the card expands before scrolling
    requestAnimationFrame(() => {
      document.getElementById(`skill-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <PageShell>
      <PageHeader title="Training School" subtitle="The curriculum, in priority order" emoji="🎓" back="/handbook" />

      {/* intro */}
      <div className="px-5 pt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Eleven skills, taught in this order. Numbers 1–4 start the day Wobbles comes home; everything
          else layers on top. Every skill below opens into a step-by-step guide —{" "}
          <strong className="text-foreground">3–5 minute sessions, always ending on a win</strong>.
        </p>
        {age.born && (
          <p className="mt-2 text-[12px] font-body font-bold text-[#B4512E]">
            <PawPrint size={12} className="inline -mt-0.5 mr-1" />
            Wobbles is {age.weeks}w {age.remDays}d old — badges below update with his age.
          </p>
        )}
      </div>

      {/* syllabus index */}
      <div className="px-5 mt-5">
        <Eyebrow className="mb-2.5">The syllabus</Eyebrow>
        <div className="keepsake-card p-2.5">
          {TRAINING_SKILLS.map((s) => {
            const st = STATUS_STYLE[skillStatus(s, ageWeeks)];
            return (
              <button
                key={s.slug}
                onClick={() => jump(s.slug)}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl press-scale text-left hover:bg-[#22364D]/4"
              >
                <span className="w-6 h-6 shrink-0 rounded-full bg-[#22364D]/8 flex items-center justify-center font-display font-bold text-[12px] text-[#C66A3D]">
                  {s.priority}
                </span>
                <span className="min-w-0 flex-1 font-body font-bold text-[13px] text-[#22364D] truncate">
                  {s.emoji} {s.title}
                </span>
                <span className={cn("shrink-0 text-[8px] font-body font-extrabold uppercase tracking-[0.1em] px-2 py-1 rounded-full", st.cls)}>
                  {st.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* golden rules */}
      <div className="px-5 mt-6">
        <Eyebrow className="mb-2.5">Golden rules (read first)</Eyebrow>
        <div className="sticker-card px-4 py-3.5">
          <ul className="space-y-2">
            {TRAINING_RULES.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-foreground/85">
                <PawPrint size={13} className="text-[#C66A3D]/70 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-5">
        <PawDivider />
      </div>

      {/* skill cards */}
      <div className="px-4 space-y-3.5 pb-4">
        {TRAINING_SKILLS.map((s) => {
          const st = STATUS_STYLE[skillStatus(s, ageWeeks)];
          const isOpen = open === s.slug;
          return (
            <div key={s.slug} id={`skill-${s.slug}`} className="keepsake-card overflow-hidden scroll-mt-20">
              {/* card header */}
              <button
                onClick={() => setOpen(isOpen ? null : s.slug)}
                className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                aria-expanded={isOpen}
              >
                <span className="w-9 h-9 shrink-0 rounded-full bg-[#22364D]/8 flex items-center justify-center font-display font-bold text-[15px] text-[#C66A3D]">
                  {s.priority}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-body font-bold text-[14.5px] leading-snug text-[#22364D]">
                      {s.emoji} {s.title}
                    </span>
                    <span className={cn("text-[8px] font-body font-extrabold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0", st.cls)}>
                      {st.label}
                    </span>
                  </span>
                  <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">{s.short}</span>
                </span>
                <ChevronDown
                  size={17}
                  className={cn("shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>

              {/* expanded body */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-dashed border-[#E5DAC8]">
                  {s.img && (
                    <img
                      src={s.img}
                      alt={s.imgAlt ?? s.title}
                      className="w-full aspect-[16/10] object-cover rounded-2xl mt-3.5"
                      loading="lazy"
                    />
                  )}

                  <dl className="mt-3.5 space-y-1.5">
                    <div className="flex gap-2.5 items-baseline">
                      <dt className="shrink-0 w-[72px] text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#C66A3D]">
                        Start
                      </dt>
                      <dd className="text-[12.5px] font-body font-bold text-[#33475C]">{s.startWhen}</dd>
                    </div>
                    <div className="flex gap-2.5 items-baseline">
                      <dt className="shrink-0 w-[72px] text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#C66A3D]">
                        Goal
                      </dt>
                      <dd className="text-[12.5px] font-body text-[#33475C] leading-snug">{s.goal}</dd>
                    </div>
                  </dl>

                  {/* steps */}
                  <div className="relative pl-5 mt-4 space-y-3">
                    <span className="absolute left-[7px] top-2 bottom-2 border-l-2 border-dashed border-[#22364D]/20" aria-hidden />
                    {s.steps.map((step, i) => (
                      <div key={i} className="relative sticker-card px-3.5 py-3">
                        <span className="absolute -left-5 top-3.5 w-4 h-4 rounded-full bg-background border-2 border-[#C66A3D] flex items-center justify-center text-[8px] font-extrabold text-[#B4512E]" aria-hidden>
                          {i + 1}
                        </span>
                        <p className="font-bold text-[13px] leading-snug text-[#22364D]">{step.title}</p>
                        <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Wobbles-specific note */}
                  <div className="mt-3.5 rounded-2xl bg-[#22364D]/5 px-4 py-3">
                    <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-[#22364D]/70 flex items-center gap-1.5">
                      <MapPin size={11} /> For Wobbles, specifically
                    </p>
                    <p className="text-[12.5px] text-[#33475C] leading-relaxed mt-1.5">{s.wobbles}</p>
                  </div>

                  {/* pro tip */}
                  <div className="mt-2.5 rounded-2xl bg-[#C66A3D]/8 px-4 py-3 flex gap-2.5">
                    <Lightbulb size={15} className="text-[#B4512E] shrink-0 mt-0.5" />
                    <p className="text-[12.5px] text-[#33475C] leading-relaxed">{s.proTip}</p>
                  </div>

                  {/* tracker CTA */}
                  <Link href="/trackers/training" className="btn-ink mt-4 inline-flex">
                    Log a session <ChevronRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* footer link */}
      <p className="px-5 pb-4 text-center text-[11px] font-body text-muted-foreground leading-relaxed">
        Want the theory behind the methods? Read the{" "}
        <Link href="/handbook/training-programme" className="font-bold text-[#B4512E]">
          Training Programme chapter →
        </Link>
      </p>
    </PageShell>
  );
}

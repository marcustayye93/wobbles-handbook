/*
 * First-timer instruction card for today's socialisation mission.
 */
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import type { SocialMission } from "@/content/socialMissions";

export default function SocialMissionCard({ mission }: { mission: SocialMission }) {
  return (
    <section className="relative z-10 px-4 mt-3">
      <div className="keepsake-card relative p-5 fade-up" style={{ animationDelay: "210ms" }}>
        <span className="absolute -top-3 left-4 bg-[#6B7C5A] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
          Today's mission · {mission.minutes} min
        </span>
        <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.14em] text-[#6B7C5A] mt-1">
          {mission.emoji} {mission.category}
        </p>
        <h2 className="font-display font-semibold text-[1.45rem] leading-tight text-[#22364D] mt-0.5">
          {mission.title}
        </h2>
        <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed mt-1.5">{mission.why}</p>

        <p className="mt-3 text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E]">
          What to bring
        </p>
        <ul className="mt-1 space-y-1">
          {mission.bring.map((b) => (
            <li key={b} className="text-[12.5px] font-body text-[#33475C] leading-snug">
              {b}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E]">
          Step by step
        </p>
        <ol className="mt-1 space-y-1.5 list-decimal pl-4">
          {mission.steps.map((s) => (
            <li key={s} className="text-[12.5px] font-body text-[#33475C] leading-snug">
              {s}
            </li>
          ))}
        </ol>

        <dl className="mt-3 space-y-2 border-t border-dashed border-[#E5DAC8] pt-3">
          <div>
            <dt className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E]">
              What good looks like
            </dt>
            <dd className="text-[12.5px] font-body text-[#33475C] leading-snug mt-0.5">{mission.goodLooksLike}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E]">
              If he is scared
            </dt>
            <dd className="text-[12.5px] font-body text-[#33475C] leading-snug mt-0.5">{mission.ifScared}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E]">
              When to stop
            </dt>
            <dd className="text-[12.5px] font-body text-[#33475C] leading-snug mt-0.5">{mission.whenToStop}</dd>
          </div>
        </dl>

        <p className="mt-3 text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#B4512E]">
          Safety (read this)
        </p>
        <ul className="mt-1 space-y-1.5">
          {mission.safety.map((s) => (
            <li key={s.slice(0, 40)} className="text-[12px] font-body text-[#33475C] leading-snug">
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-2">
          <Link href="/trackers/social?add=1" className="btn-ink inline-flex justify-center">
            Log as {mission.logCategory} <ChevronRight size={15} />
          </Link>
          <Link
            href={mission.handbookHref}
            className="text-center text-[12px] font-body font-extrabold text-[#B4512E] py-1"
          >
            {mission.logPrompt} Guide →
          </Link>
        </div>
      </div>
    </section>
  );
}

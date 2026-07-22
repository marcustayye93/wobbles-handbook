/*
 * Grooming tab — start-to-finish home groom walkthrough for Wobbles.
 * Keepsake field-guide style: stage index chips, kit checklist, frequency
 * cheatsheet, then the 10-stage illustrated walkthrough in strict order.
 */
import { useState } from "react";
import { Link } from "wouter";
import { PageShell, PageHeader, PawDivider, Eyebrow } from "@/components/AppShell";
import { GROOM_STEPS, GROOM_KIT, GROOM_FREQUENCY } from "@/content/grooming";
import { PawPrint, ChevronDown, ChevronRight, AlertTriangle, Baby, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Grooming() {
  const [open, setOpen] = useState<string | null>(GROOM_STEPS[0].slug);
  const [showKit, setShowKit] = useState(false);

  const jump = (slug: string) => {
    setOpen(slug);
    requestAnimationFrame(() => {
      document.getElementById(`groom-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <PageShell>
      <PageHeader title="Grooming Salon" subtitle="The full home groom, start to finish" emoji="✂️" />

      {/* intro */}
      <div className="px-5 pt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          A Cavoodle's fleece coat doesn't shed — it <strong className="text-foreground">mats</strong>. This
          is the whole fortnightly groom in the exact order that keeps his teddy coat plush:{" "}
          <strong className="text-foreground">brush before water, dry completely, tools last</strong>. Follow
          the stages top to bottom.
        </p>
      </div>

      {/* stage index */}
      <div className="px-5 mt-5">
        <Eyebrow className="mb-2.5">The routine, in order</Eyebrow>
        <div className="keepsake-card p-2.5">
          {GROOM_STEPS.map((g) => (
            <button
              key={g.slug}
              onClick={() => jump(g.slug)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl press-scale text-left hover:bg-[#22364D]/4"
            >
              <span className="w-6 h-6 shrink-0 rounded-full bg-[#22364D]/8 flex items-center justify-center font-display font-bold text-[12px] text-[#C66A3D]">
                {g.order + 1}
              </span>
              <span className="min-w-0 flex-1 font-body font-bold text-[13px] text-[#22364D] truncate">
                {g.emoji} {g.title}
              </span>
              <span className="shrink-0 text-[9px] font-body font-extrabold text-muted-foreground flex items-center gap-1">
                <Clock size={10} /> {g.time}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* kit checklist (collapsible) */}
      <div className="px-5 mt-4">
        <div className="sticker-card overflow-hidden">
          <button
            onClick={() => setShowKit(!showKit)}
            className="w-full px-4 py-3 flex items-center gap-2.5 text-left"
            aria-expanded={showKit}
          >
            <span className="text-[16px]">🧰</span>
            <span className="flex-1 font-body font-bold text-[13.5px] text-[#22364D]">
              The grooming kit ({GROOM_KIT.length} items)
            </span>
            <ChevronDown size={16} className={cn("text-muted-foreground transition-transform duration-200", showKit && "rotate-180")} />
          </button>
          {showKit && (
            <ul className="px-4 pb-3.5 space-y-2 border-t border-dashed border-[#E5DAC8] pt-3">
              {GROOM_KIT.map((k, i) => (
                <li key={i} className="flex gap-2.5 items-baseline">
                  <PawPrint size={11} className="text-[#C66A3D]/70 shrink-0 translate-y-0.5" />
                  <span className="text-[12.5px] leading-snug">
                    <strong className="text-[#22364D]">{k.item}</strong>
                    <span className="text-muted-foreground"> — {k.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="px-5">
        <PawDivider />
      </div>

      {/* walkthrough */}
      <div className="px-4 space-y-3.5">
        {GROOM_STEPS.map((g) => {
          const isOpen = open === g.slug;
          return (
            <div key={g.slug} id={`groom-${g.slug}`} className="keepsake-card overflow-hidden scroll-mt-20">
              <button
                onClick={() => setOpen(isOpen ? null : g.slug)}
                className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                aria-expanded={isOpen}
              >
                <span className="w-9 h-9 shrink-0 rounded-full bg-[#22364D]/8 flex items-center justify-center font-display font-bold text-[15px] text-[#C66A3D]">
                  {g.order + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-body font-bold text-[14.5px] leading-snug text-[#22364D]">
                      {g.emoji} {g.title}
                    </span>
                    <span className="shrink-0 text-[9px] font-body font-extrabold text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {g.time}
                    </span>
                  </span>
                  <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">{g.short}</span>
                </span>
                <ChevronDown
                  size={17}
                  className={cn("shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-dashed border-[#E5DAC8]">
                  {g.img && (
                    <img
                      src={g.img}
                      alt={g.imgAlt ?? g.title}
                      className="w-full aspect-[16/10] object-cover rounded-2xl mt-3.5"
                      loading="lazy"
                    />
                  )}

                  <div className="relative pl-5 mt-4 space-y-3">
                    <span className="absolute left-[7px] top-2 bottom-2 border-l-2 border-dashed border-[#22364D]/20" aria-hidden />
                    {g.steps.map((step, i) => (
                      <div key={i} className="relative sticker-card px-3.5 py-3">
                        <span className="absolute -left-5 top-3.5 w-4 h-4 rounded-full bg-background border-2 border-[#C66A3D] flex items-center justify-center text-[8px] font-extrabold text-[#B4512E]" aria-hidden>
                          {i + 1}
                        </span>
                        <p className="font-bold text-[13px] leading-snug text-[#22364D]">{step.title}</p>
                        <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* watch out */}
                  <div className="mt-3.5 rounded-2xl bg-[#B4512E]/8 px-4 py-3 flex gap-2.5">
                    <AlertTriangle size={15} className="text-[#B4512E] shrink-0 mt-0.5" />
                    <p className="text-[12.5px] text-[#33475C] leading-relaxed">
                      <strong className="text-[#B4512E]">Watch out: </strong>
                      {g.watchOut}
                    </p>
                  </div>

                  {/* puppy note */}
                  <div className="mt-2.5 rounded-2xl bg-[#6B7C5A]/10 px-4 py-3 flex gap-2.5">
                    <Baby size={15} className="text-[#6B7C5A] shrink-0 mt-0.5" />
                    <p className="text-[12.5px] text-[#33475C] leading-relaxed">
                      <strong className="text-[#5A6B4A]">Puppy mode: </strong>
                      {g.puppyNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5">
        <PawDivider />
      </div>

      {/* frequency cheatsheet */}
      <div className="px-5 pb-2">
        <h2 className="font-display font-semibold text-[1.45rem] text-[#22364D] mb-1">How often?</h2>
        <p className="text-xs text-muted-foreground mb-3">Aligned with the family care rota — Mondays are maintenance day.</p>
        <div className="keepsake-card overflow-hidden">
          {GROOM_FREQUENCY.map((f, i) => (
            <div
              key={i}
              className={cn("px-4 py-2.5 flex items-baseline gap-3", i > 0 && "border-t border-dashed border-[#E5DAC8]")}
            >
              <p className="w-[104px] shrink-0 font-body font-bold text-[12px] text-[#22364D] leading-snug">{f.task}</p>
              <div className="min-w-0">
                <p className="text-[12px] text-[#33475C] leading-snug">{f.cadence}</p>
                <p className="text-[10px] font-bold text-[#B4512E] uppercase tracking-wide mt-0.5">{f.rota}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* footer links */}
      <p className="px-5 pt-3 pb-4 text-center text-[11px] font-body text-muted-foreground leading-relaxed">
        Log every session in the{" "}
        <Link href="/trackers/grooming" className="font-bold text-[#B4512E]">
          Grooming tracker →
        </Link>{" "}
        or read the{" "}
        <Link href="/handbook/grooming-masterclass" className="font-bold text-[#B4512E]">
          Grooming Masterclass chapter →
        </Link>
      </p>
    </PageShell>
  );
}

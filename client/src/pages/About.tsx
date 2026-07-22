/*
 * Redesign v2 — "Keepsake Field Guide" All About Wobbles.
 * Taped keepsake photos, ink navy headings, sienna accents, moss done-dots.
 * Baby-book page: photos, verified profile facts, mum & dad, breeder story,
 * milestone timeline, and the AI rendering of adult Wobbles.
 */
import { PageShell, PageHeader, PawDivider } from "@/components/AppShell";
import { ASSETS, WOBBLES, MILESTONES, wobblesAge, formatDate, daysUntil } from "@/content/wobbles";
import { Star, Hand, Syringe, Home, Plane, Users, Scissors, Cake, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MICONS: Record<string, LucideIcon> = {
  star: Star, hand: Hand, syringe: Syringe, home: Home, plane: Plane,
  users: Users, scissors: Scissors, cake: Cake,
};

const FACTS: { label: string; value: string }[] = [
  { label: "Pedigree name", value: WOBBLES.pedigreeName },
  { label: "Litter", value: WOBBLES.litterId },
  { label: "Born", value: formatDate(WOBBLES.dob) },
  { label: "Sex", value: WOBBLES.sex },
  { label: "Size", value: `${WOBBLES.size} (${WOBBLES.expectedAdultWeight} adult)` },
  { label: "Coat", value: WOBBLES.coat },
  { label: "Colour", value: WOBBLES.colour },
  { label: "Homecoming", value: formatDate(WOBBLES.homecoming) },
];

export default function About() {
  const age = wobblesAge();

  return (
    <PageShell>
      <PageHeader title="All About Wobbles" subtitle="The star of this handbook" emoji="🐶" />

      {/* photos */}
      <div className="px-5 pt-5">
        <div className="relative -rotate-[0.5deg]">
          <span className="tape" aria-hidden />
          <img
            src={ASSETS.photoFace}
            alt="Cartoon sketch of Wobbles as a young puppy"
            className="relative w-full aspect-[4/3] object-cover rounded-[1.6rem] border-4 border-[#FFFDF8] shadow-[0_12px_32px_rgba(34,54,77,0.12)]"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <img
              src={ASSETS.photoNewborn}
              alt="Cartoon sketch of Wobbles as a newborn"
              className="w-full aspect-square object-cover rounded-3xl border-2 border-card shadow-sm rotate-[0.8deg]"
            />
            <span className="absolute bottom-2 left-2 bg-card/92 px-2 py-1 rounded-full text-[10px] font-extrabold border border-border">
              Newborn
            </span>
          </div>
          <div className="relative flex-1">
            <img
              src={ASSETS.adultRendering}
              alt="AI rendering of Wobbles as an adult Cavoodle"
              className="w-full aspect-square object-cover rounded-3xl border-2 border-card shadow-sm -rotate-[0.8deg]"
            />
            <span className="absolute bottom-2 left-2 bg-card/92 px-2 py-1 rounded-full text-[10px] font-extrabold border border-border">
              Adult (AI guess)
            </span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2 italic">
          Sketches of Wobbles for now — real photos coming once he's home. Right: an AI-imagined grown-up Wobbles.
        </p>
      </div>

      {/* profile card */}
      <div className="px-5 mt-6">
        <div className="keepsake-card p-4">
          <h2 className="font-display font-semibold text-[1.3rem] text-[#22364D] flex items-center gap-2">
            <Heart size={17} className="text-[#C66A3D]" /> Puppy passport
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {WOBBLES.breed} · {age.born ? `${age.weeks} weeks ${age.remDays} days old` : "arriving soon"}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4">
            {FACTS.map((f) => (
              <div key={f.label}>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">{f.label}</p>
                <p className="text-[13px] font-bold leading-snug mt-0.5 text-[#22364D]">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* family */}
      <div className="px-5 mt-5">
        <h2 className="font-display font-semibold text-[1.45rem] text-[#22364D] mb-3">Mum & Dad</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="sticker-card px-3.5 py-3.5 -rotate-[0.4deg]">
            <p className="text-2xl">🐩</p>
            <p className="font-body font-extrabold text-[15px] mt-1 text-[#22364D]">{WOBBLES.mum.name}</p>
            <p className="text-[11px] text-muted-foreground leading-snug mt-1">{WOBBLES.mum.desc}</p>
          </div>
          <div className="sticker-card px-3.5 py-3.5 rotate-[0.4deg]">
            <p className="text-2xl">🐕</p>
            <p className="font-body font-extrabold text-[15px] mt-1 text-[#22364D]">{WOBBLES.dad.name}</p>
            <p className="text-[11px] text-muted-foreground leading-snug mt-1">{WOBBLES.dad.desc}</p>
          </div>
        </div>
        <div className="sticker-card px-4 py-3.5 mt-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Bred by</p>
          <p className="font-bold text-[14px] mt-0.5">
            {WOBBLES.breeder.name} — {WOBBLES.breeder.person}
          </p>
          <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
            {WOBBLES.breeder.location}. {WOBBLES.breeder.program}.
          </p>
          <a
            href={WOBBLES.breeder.listingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-extrabold text-[#B4512E] mt-2"
          >
            View the RightPaw listing →
          </a>
        </div>
      </div>

      <div className="px-5">
        <PawDivider />
      </div>

      {/* milestones */}
      <div className="px-5 pb-4">
        <h2 className="font-display font-semibold text-[1.45rem] text-[#22364D] mb-1">Wobbles' first year</h2>
        <p className="text-xs text-muted-foreground mb-4">Every date that matters, from birth to first birthday.</p>
        <div className="relative pl-6 space-y-4">
          <span className="absolute left-[9px] top-1 bottom-1 border-l-2 border-dashed border-[#22364D]/20" aria-hidden />
          {MILESTONES.map((m) => {
            const Icon = MICONS[m.icon] ?? Star;
            const past = daysUntil(m.date) < 0;
            return (
              <div key={m.date + m.label} className="relative">
                <span
                  className={cn(
                    "absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    past ? "bg-[#7B8C6A] border-[#7B8C6A] text-white" : "bg-background border-[#C66A3D]/60 text-[#C66A3D]",
                  )}
                >
                  <Icon size={10} />
                </span>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#B4512E]">
                  {formatDate(m.date)}
                  {!past && daysUntil(m.date) <= 90 && (
                    <span className="ml-1.5 text-muted-foreground normal-case tracking-normal font-bold">
                      · in {daysUntil(m.date)} days
                    </span>
                  )}
                </p>
                <p className="font-bold text-[14px] mt-0.5 text-[#22364D]">{m.label}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">{m.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

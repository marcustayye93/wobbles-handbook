/*
 * Redesign v2 — "Keepsake Field Guide" Road to Singapore.
 * v2 gouache cover, ink navy headings, sienna phase labels.
 * Hero, key-facts cards, phase-grouped step timeline, tropical life tips.
 */
import { PageShell, PageHeader, PawDivider, Eyebrow } from "@/components/AppShell";
import { CHAPTER_COVERS } from "@/content/wobbles";
import { SG_FACTS, SG_STEPS, SG_TIPS } from "@/content/singapore";
import { daysUntil } from "@/content/wobbles";
import {
  Phone, Syringe, FileText, StampIcon, Plane, MapPin, Sun, PawPrint, BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  syringe: Syringe,
  file: FileText,
  stamp: StampIcon,
  plane: Plane,
  map: MapPin,
  sun: Sun,
  badge: BadgeCheck,
};

export default function Singapore() {
  const toFlyReady = daysUntil("2026-09-18");

  // group steps by phase, preserving order
  const phases: { phase: string; steps: typeof SG_STEPS }[] = [];
  for (const s of SG_STEPS) {
    const last = phases[phases.length - 1];
    if (last && last.phase === s.phase) last.steps.push(s);
    else phases.push({ phase: s.phase, steps: [s] });
  }

  return (
    <PageShell>
      <PageHeader title="Road to Singapore" subtitle="BNE → SIN, zero quarantine" emoji="✈️" />

      {/* hero */}
      <div className="px-5 pt-4">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src={CHAPTER_COVERS.singapore}
            alt="Wobbles the Cavoodle in front of the Singapore skyline"
            className="w-full aspect-[16/10] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#22364D]/70 via-transparent to-transparent" aria-hidden />
          {toFlyReady > 0 && (
            <span className="absolute bottom-3 left-3 bg-[#FFFDF8]/92 backdrop-blur px-3 py-1.5 rounded-full text-xs font-extrabold text-[#22364D]">
              ✈️ Fly-ready in {toFlyReady} days (18 Sep 2026)
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          The family moves to Singapore in <strong className="text-foreground">September 2026</strong>, with
          Wobbles flying via <strong className="text-foreground">Jetpets</strong>. Great news: because
          Australia is rabies-free, this is one of the easiest international pet moves in the world —
          <strong className="text-foreground"> no rabies shots, no quarantine</strong>, roughly 2–3 weeks of
          paperwork done right.
        </p>
      </div>

      {/* key facts */}
      <div className="px-5 mt-5">
        <h2 className="font-display font-semibold text-[1.45rem] text-[#22364D] mb-3">The facts that matter</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {SG_FACTS.map((f, i) => (
            <div key={i} className="sticker-card px-3.5 py-3" style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">{f.label}</p>
              <p className="font-body font-bold text-[14px] text-[#22364D] leading-snug mt-1">{f.value}</p>
              <p className="text-[11px] text-muted-foreground leading-snug mt-1">{f.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5">
        <PawDivider />
      </div>

      {/* steps */}
      <div className="px-5">
        <h2 className="font-display font-semibold text-[1.45rem] text-[#22364D] mb-1">The plan, step by step</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Jetpets handles most of this — but here's the whole journey so nothing surprises you.
        </p>
        <div className="space-y-5 pb-2">
          {phases.map((ph, pi) => (
            <div key={pi}>
              <Eyebrow className="mb-2.5 flex items-center gap-1.5">
                <PawPrint size={12} /> {ph.phase}
              </Eyebrow>
              <div className="relative pl-5 space-y-3">
                <span className="absolute left-[7px] top-2 bottom-2 border-l-2 border-dashed border-[#22364D]/20" aria-hidden />
                {ph.steps.map((s, i) => {
                  const Icon = ICONS[s.icon] ?? FileText;
                  return (
                    <div key={i} className="relative sticker-card px-4 py-3.5">
                      <span className="absolute -left-5 top-4 w-4 h-4 rounded-full bg-background border-2 border-[#C66A3D]" aria-hidden />
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-7 h-7 rounded-xl bg-[#22364D]/8 text-[#22364D] flex items-center justify-center shrink-0">
                          <Icon size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-[14px] leading-snug text-[#22364D]">{s.title}</p>
                          <p className="text-[10px] font-bold text-[#B4512E] uppercase tracking-wide">{s.timing}</p>
                        </div>
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{s.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5">
        <PawDivider />
      </div>

      {/* tips */}
      <div className="px-5 pb-4">
        <h2 className="font-display font-semibold text-[1.45rem] text-[#22364D] mb-3">Tropical dog life 🌴</h2>
        <ul className="space-y-2.5">
          {SG_TIPS.map((t, i) => (
            <li key={i} className="sticker-card px-4 py-3 flex gap-2.5 text-[13px] leading-relaxed text-foreground/85">
              <PawPrint size={14} className="text-[#C66A3D]/70 shrink-0 mt-1" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}

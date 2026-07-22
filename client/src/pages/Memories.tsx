/*
 * Redesign v2 — "Keepsake Field Guide" Memories page.
 * Full-bleed gouache cover, serif title, milestone timeline from MILESTONES,
 * and a taped placeholder card for the future photo journal.
 */
import { PageShell, Eyebrow, PawDivider } from "@/components/AppShell";
import { ASSETS, MILESTONES, WOBBLES, daysUntil, formatDate, wobblesAge } from "@/content/wobbles";
import { cn } from "@/lib/utils";
import {
  Star, Hand, Syringe, Home as HomeIcon, Plane, Users, Scissors, Cake, Camera, PawPrint,
} from "lucide-react";

const INK = "#22364D";
const SIENNA = "#C66A3D";
const MOSS = "#7B8C6A";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  star: Star,
  hand: Hand,
  syringe: Syringe,
  home: HomeIcon,
  plane: Plane,
  users: Users,
  scissors: Scissors,
  cake: Cake,
};

export default function Memories() {
  const age = wobblesAge();

  return (
    <PageShell>
      {/* cover */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={ASSETS.v2ChMemories}
          alt="Wobbles memories illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#22364D]/85 via-[#22364D]/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 px-5 pb-5">
          <Eyebrow className="!text-[#E8935C]">Keepsakes</Eyebrow>
          <h1 className="font-display font-semibold text-[2.6rem] leading-[1] text-[#FFFDF8] mt-1">
            Memories
          </h1>
          <p className="text-[12.5px] font-body text-[#FFFDF8]/85 mt-1.5">
            {age.born
              ? `Wobbles is ${age.weeks} weeks and ${age.remDays} days old`
              : "The story starts soon"}
          </p>
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* photo journal placeholder */}
        <div className="keepsake-card relative p-5 text-center">
          <span className="tape" aria-hidden />
          <Camera size={26} className="mx-auto" style={{ color: `${SIENNA}99` }} />
          <p className="font-display font-semibold text-[1.25rem] mt-2" style={{ color: INK }}>
            The photo journal
          </p>
          <p className="text-[13px] font-body text-muted-foreground leading-relaxed mt-1.5 max-w-[280px] mx-auto">
            This page is waiting for the real thing. Once Wobbles is home on{" "}
            <strong className="text-foreground">{formatDate(WOBBLES.homecoming)}</strong>, swap the
            sketches for photos — first nap, first walk, first questionable haircut.
          </p>
          <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.14em] text-muted-foreground/70 mt-3">
            Photos coming soon
          </p>
        </div>

        <PawDivider />

        {/* milestone timeline */}
        <Eyebrow>The story so far — and next</Eyebrow>
        <ol className="mt-3 relative pb-2">
          {/* spine */}
          <span
            aria-hidden
            className="absolute left-[17px] top-2 bottom-2 border-l-2 border-dashed"
            style={{ borderColor: "rgba(34,54,77,0.18)" }}
          />
          {MILESTONES.map((m) => {
            const Icon = ICONS[m.icon] ?? PawPrint;
            const dUntil = daysUntil(m.date);
            const past = dUntil < 0;
            const today = dUntil === 0;
            const when = today
              ? "Today"
              : past
                ? `${Math.abs(dUntil)} days ago`
                : `in ${dUntil} days`;
            return (
              <li key={m.date} className="relative pl-12 pb-5 last:pb-0">
                <span
                  className={cn(
                    "absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center border-2",
                  )}
                  style={{
                    backgroundColor: past || today ? MOSS : "#FFFDF8",
                    borderColor: past || today ? MOSS : "rgba(34,54,77,0.2)",
                    color: past || today ? "#FFFDF8" : "rgba(34,54,77,0.55)",
                  }}
                >
                  <Icon size={15} />
                </span>
                <div className="sticker-card px-4 py-3">
                  <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.12em]" style={{ color: SIENNA }}>
                    {formatDate(m.date)} · {when}
                  </p>
                  <p className="font-body font-bold text-[14px] mt-0.5" style={{ color: INK }}>
                    {m.label}
                  </p>
                  <p className="text-[12px] font-body text-muted-foreground leading-relaxed mt-1">
                    {m.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="text-[11px] font-body text-muted-foreground text-center pt-4 pb-4 leading-relaxed">
          More memories get added as Wobbles grows — this is only chapter one.
        </p>
      </div>
    </PageShell>
  );
}

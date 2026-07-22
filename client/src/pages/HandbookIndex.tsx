/*
 * Storybook Picture-Book theme — Handbook chapter index.
 * Chapters as tilted sticker cards with emoji, tagline and read time,
 * plus the two special pages (100 Things, Checklists).
 */
import { Link } from "wouter";
import { PageShell, PageHeader, PawDivider } from "@/components/AppShell";
import { SECTIONS } from "@/content/handbookSections";
import { HUNDRED_TOTAL } from "@/content/hundredThings";
import { CHECKLISTS } from "@/content/checklists";
import { ChevronRight, Clock, Printer, ListChecks } from "lucide-react";

export default function HandbookIndex() {
  return (
    <PageShell>
      <PageHeader title="The Handbook" subtitle="Expert care, written for Wobbles" emoji="📖" />

      <div className="px-5 pt-5">
        {/* Special: 100 things */}
        <Link
          href="/handbook/100-things"
          className="block sticker-card p-4 press-scale bg-gradient-to-br from-card to-accent/40 border-primary/20 rotate-[-0.5deg]"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-3xl">💯</span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-[16px] leading-snug">
                {HUNDRED_TOTAL} Things Owners Learn Too Late
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The collected wisdom nobody tells first-time Cavoodle parents
              </p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </div>
        </Link>

        {/* Special: checklists */}
        <Link
          href="/handbook/checklists"
          className="mt-3 block sticker-card p-4 press-scale rotate-[0.4deg]"
        >
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-2xl bg-[oklch(0.9_0.05_140)]/60 flex items-center justify-center">
              <ListChecks size={22} className="text-[oklch(0.45_0.09_140)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-[16px] leading-snug">Printable Checklists</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                {CHECKLISTS.length} lists · tick on screen or <Printer size={11} /> print
              </p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </div>
        </Link>

        <PawDivider />

        <h2 className="font-display font-bold text-lg mb-3">Chapters</h2>
        <div className="space-y-3 pb-4">
          {SECTIONS.map((s, i) => (
            <Link
              key={s.slug}
              href={`/handbook/${s.slug}`}
              className="block sticker-card p-4 press-scale"
              style={{ transform: `rotate(${i % 2 ? 0.35 : -0.35}deg)` }}
            >
              <div className="flex items-start gap-3.5">
                <span className="text-2xl mt-0.5">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
                    Chapter {i + 1}
                  </p>
                  <p className="font-display font-bold text-[16px] leading-snug mt-0.5">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.tagline}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                    <Clock size={11} /> {s.readMins} min read
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

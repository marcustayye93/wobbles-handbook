/*
 * Redesign v2 — "Keepsake Field Guide" chapter index.
 * Collectible illustrated chapter covers (gouache art per chapter), eyebrow
 * chapter numbers, serif titles, reading-progress rings, plus special pages
 * (100 Things, Checklists, Singapore) as keepsake rows.
 */
import { Link } from "wouter";
import { PageShell, Eyebrow, PawDivider, ProgressRing } from "@/components/AppShell";
import { SECTIONS } from "@/content/handbookSections";
import { HUNDRED_TOTAL } from "@/content/hundredThings";
import { CHECKLISTS } from "@/content/checklists";
import { CHAPTER_COVERS } from "@/content/wobbles";
import { ChevronRight, Clock, Printer, ListChecks, Plane, Award, Search, GraduationCap, Scissors, ShoppingCart } from "lucide-react";
import { useSharedState } from "@/hooks/useSyncedData";
import { useState } from "react";
import SearchDialog from "@/components/SearchDialog";

/** Reading progress map: slug -> 0..1, synced for the family (written by SectionReader) */
export function useReadProgress() {
  return useSharedState<Record<string, number>>("readProgress", {});
}

export default function HandbookIndex() {
  const [progress] = useReadProgress();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <PageShell>
      <header className="px-5 pt-9 pb-1">
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow>The Handbook</Eyebrow>
            <h1 className="font-display font-semibold text-[2.4rem] leading-[1.02] mt-1.5">
              Chapters
            </h1>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search the handbook"
            className="mt-1 w-9 h-9 rounded-full bg-[#FFFDF8] border border-[#E5DAC8] flex items-center justify-center text-[#22364D] press-scale shadow-sm"
          >
            <Search size={16} />
          </button>
        </div>
        <p className="text-[13px] font-body text-muted-foreground mt-2 leading-relaxed">
          Expert care, written for one very good Cavoodle.
        </p>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="px-4 pt-4">
        {/* Chapter covers */}
        <div className="space-y-4 pb-2">
          {SECTIONS.map((s, i) => {
            const cover = CHAPTER_COVERS[s.slug];
            const pct = progress[s.slug] ?? 0;
            return (
              <Link
                key={s.slug}
                href={`/handbook/${s.slug}`}
                className="block press-scale fade-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                <div className="relative rounded-[28px] overflow-hidden shadow-[0_12px_32px_rgba(34,54,77,0.14)]">
                  {cover ? (
                    <img
                      src={cover}
                      alt={`Illustrated cover for ${s.title}`}
                      className="w-full aspect-[16/10] object-cover"
                      loading={i > 2 ? "lazy" : undefined}
                    />
                  ) : (
                    <div className="w-full aspect-[16/10] bg-[#22364D]" />
                  )}
                  {/* Legibility gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(20,32,48,0.82) 0%, rgba(20,32,48,0.35) 38%, rgba(20,32,48,0.05) 62%, transparent 100%)",
                    }}
                    aria-hidden
                  />
                  {/* Progress ring */}
                  {pct > 0 && (
                    <div className="absolute top-3.5 right-3.5">
                      <ProgressRing
                        value={pct}
                        size={46}
                        stroke={3.5}
                        trackColor="rgba(255,253,248,0.35)"
                        color="#E8935C"
                      >
                        <span className="font-body font-extrabold text-[9px] text-white leading-none">
                          {Math.round(pct * 100)}%
                        </span>
                      </ProgressRing>
                    </div>
                  )}
                  {/* Text overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4.5 pb-4">
                    <p className="text-[9.5px] font-body font-extrabold uppercase tracking-[0.2em] text-[#E8935C]">
                      Chapter {i + 1}
                    </p>
                    <h2 className="font-display font-semibold text-[1.6rem] leading-[1.05] text-[#FFFDF8] mt-1">
                      {s.title}
                    </h2>
                    <p className="text-[11px] font-body font-semibold text-[#D8DEE7] mt-1.5 flex items-center gap-1.5">
                      <Clock size={11} /> {s.readMins} min read
                      <span className="opacity-60">·</span>
                      <span className="truncate">{s.tagline}</span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <PawDivider />

        {/* Guides */}
        <Eyebrow className="mb-2.5 px-1">Guides</Eyebrow>
        <div className="space-y-2.5 pb-5">
          <Link href="/training" className="block sticker-card p-4 press-scale">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-[#22364D]/8 flex items-center justify-center">
                <GraduationCap size={21} className="text-[#22364D]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-[14px] leading-snug text-[#22364D]">
                  Training School
                </p>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                  The 11-skill curriculum, in priority order
                </p>
              </div>
              <ChevronRight size={17} className="text-muted-foreground shrink-0" />
            </div>
          </Link>

          <Link href="/grooming" className="block sticker-card p-4 press-scale">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-[#7B8C6A]/15 flex items-center justify-center">
                <Scissors size={21} className="text-[#5D7048]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-[14px] leading-snug text-[#22364D]">
                  Grooming Salon
                </p>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                  The full home groom, start to finish
                </p>
              </div>
              <ChevronRight size={17} className="text-muted-foreground shrink-0" />
            </div>
          </Link>

          <Link href="/handbook/100-things" className="block sticker-card p-4 press-scale">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-[#C66A3D]/12 flex items-center justify-center">
                <Award size={21} className="text-[#B4512E]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-[14px] leading-snug text-[#22364D]">
                  {HUNDRED_TOTAL} Things Owners Learn Too Late
                </p>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                  The collected wisdom nobody tells first-time Cavoodle parents
                </p>
              </div>
              <ChevronRight size={17} className="text-muted-foreground shrink-0" />
            </div>
          </Link>
        </div>

        {/* Special pages */}
        <Eyebrow className="mb-2.5 px-1">Also in the handbook</Eyebrow>
        <div className="space-y-2.5 pb-4">
          <Link href="/handbook/checklists" className="block sticker-card p-4 press-scale">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-[#7B8C6A]/15 flex items-center justify-center">
                <ListChecks size={21} className="text-[#5D7048]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-[14px] leading-snug text-[#22364D]">
                  Printable Checklists
                </p>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5 flex items-center gap-1">
                  {CHECKLISTS.length} lists · tick on screen or <Printer size={11} /> print
                </p>
              </div>
              <ChevronRight size={17} className="text-muted-foreground shrink-0" />
            </div>
          </Link>

          <Link href="/handbook/shopping" className="block sticker-card p-4 press-scale">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-[#C66A3D]/12 flex items-center justify-center">
                <ShoppingCart size={21} className="text-[#B4512E]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-[14px] leading-snug text-[#22364D]">
                  Shopping Countdown
                </p>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                  Week-by-week buying plan to homecoming — big things first
                </p>
              </div>
              <ChevronRight size={17} className="text-muted-foreground shrink-0" />
            </div>
          </Link>

          <Link href="/singapore" className="block sticker-card p-4 press-scale">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-[#22364D]/8 flex items-center justify-center">
                <Plane size={21} className="text-[#22364D]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-[14px] leading-snug text-[#22364D]">
                  The Road to Singapore
                </p>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                  Relocation guide, timeline and fly-ready countdown
                </p>
              </div>
              <ChevronRight size={17} className="text-muted-foreground shrink-0" />
            </div>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

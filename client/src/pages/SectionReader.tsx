/*
 * Redesign v2 — "Keepsake Field Guide" immersive chapter reader.
 * Full-bleed illustrated cover (gouache art, navy gradient, serif title,
 * completion ring), scroll-down affordance, StoryBlocks reading view,
 * scroll progress saved to the shared readProgress map, prev/next footer.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { PageShell, PawDivider, ProgressRing } from "@/components/AppShell";
import { StoryBlocks } from "@/components/StoryBlocks";
import { SECTIONS } from "@/content/handbookSections";
import { CHAPTER_COVERS } from "@/content/wobbles";
import { useReadProgress } from "@/pages/HandbookIndex";
import { ChevronLeft, ChevronRight, Clock, ArrowDown } from "lucide-react";
import NotFound from "@/pages/NotFound";

export default function SectionReader() {
  const { slug } = useParams<{ slug: string }>();
  const idx = SECTIONS.findIndex((s) => s.slug === slug);
  const section = idx >= 0 ? SECTIONS[idx] : undefined;
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useReadProgress();
  const savedRef = useRef(saved);
  savedRef.current = saved;
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    let maxSeen = savedRef.current[slug] ?? 0;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
        setProgress(p);
        // Persist the furthest point reached (rounded to 5%)
        const rounded = Math.round(p * 20) / 20;
        if (rounded > maxSeen) {
          maxSeen = rounded;
          setSaved({ ...savedRef.current, [slug]: rounded });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!section) return <NotFound />;

  const prev = idx > 0 ? SECTIONS[idx - 1] : undefined;
  const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : undefined;
  const cover = CHAPTER_COVERS[section.slug];
  const savedPct = saved[section.slug] ?? 0;

  const scrollToContent = () => {
    articleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageShell>
      {/* Thin reading progress bar pinned to top */}
      <div className="fixed top-0 inset-x-0 z-50 h-[3px] pointer-events-none max-w-md mx-auto">
        <div
          className="h-full rounded-r-full transition-[width] duration-150"
          style={{ width: `${progress * 100}%`, background: "#C66A3D" }}
        />
      </div>

      {/* ===== Immersive cover ===== */}
      <section className="relative">
        {cover ? (
          <img
            src={cover}
            alt={`Illustrated cover for ${section.title}`}
            className="w-full aspect-[3/4] object-cover"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-[#22364D]" />
        )}
        {/* Gradients for legibility top + bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(20,32,48,0.55) 0%, rgba(20,32,48,0.08) 22%, transparent 45%, rgba(20,32,48,0.10) 68%, rgba(20,32,48,0.78) 100%)",
          }}
          aria-hidden
        />

        {/* Floating back button */}
        <Link
          href="/handbook"
          aria-label="Back to chapters"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#FFFDF8]/85 backdrop-blur flex items-center justify-center shadow-md press-scale"
        >
          <ChevronLeft size={20} className="text-[#22364D]" />
        </Link>

        {/* Completion ring */}
        {savedPct > 0 && (
          <div className="absolute top-4 right-4">
            <ProgressRing
              value={savedPct}
              size={54}
              stroke={4}
              trackColor="rgba(255,253,248,0.4)"
              color="#E8935C"
            >
              <span className="font-body font-extrabold text-[10px] text-white leading-none">
                {Math.round(savedPct * 100)}%
              </span>
            </ProgressRing>
          </div>
        )}

        {/* Title block over the cover */}
        <div className="absolute inset-x-0 top-16 px-6">
          <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.22em] text-[#E8935C] drop-shadow">
            Chapter {idx + 1}
          </p>
          <h1 className="font-display font-semibold text-[2.5rem] leading-[1.02] text-[#FFFDF8] mt-1.5 drop-shadow-md">
            {section.title}
          </h1>
          <p className="text-[12px] font-body font-bold text-[#E5DAC8] mt-2.5 flex items-center gap-1.5 drop-shadow">
            <Clock size={12} /> {section.readMins} min read
          </p>
        </div>

        {/* Scroll-down affordance */}
        <button
          onClick={scrollToContent}
          aria-label="Start reading"
          className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#C66A3D] text-[#FFFDF8] flex items-center justify-center shadow-lg press-scale"
        >
          <ArrowDown size={20} />
        </button>
        <p className="absolute bottom-7 left-6 max-w-[220px] font-display italic text-[15px] text-[#F3EBDD] leading-snug drop-shadow">
          {section.tagline}
        </p>
      </section>

      {/* ===== Reading view ===== */}
      <article ref={articleRef} className="px-5 pt-6 scroll-mt-2">
        <StoryBlocks blocks={section.blocks} />

        <PawDivider />

        {/* prev / next */}
        <div className="grid grid-cols-2 gap-2.5 pb-4">
          {prev ? (
            <Link href={`/handbook/${prev.slug}`} className="sticker-card px-3.5 py-3 press-scale">
              <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1">
                <ChevronLeft size={11} /> Previous
              </p>
              <p className="font-body font-bold text-[13px] leading-snug mt-1 text-[#22364D]">{prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/handbook/${next.slug}`} className="sticker-card px-3.5 py-3 press-scale text-right">
              <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1 justify-end">
                Next <ChevronRight size={11} />
              </p>
              <p className="font-body font-bold text-[13px] leading-snug mt-1 text-[#22364D]">{next.title}</p>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </article>
    </PageShell>
  );
}

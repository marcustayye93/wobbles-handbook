/*
 * Storybook Picture-Book theme — chapter reader.
 * Full-screen readable page: sticky header w/ back, scroll progress thread,
 * hero image, StoryBlocks content, prev/next chapter footer.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { PageShell, PageHeader, PawDivider } from "@/components/AppShell";
import { StoryBlocks } from "@/components/StoryBlocks";
import { SECTIONS } from "@/content/handbookSections";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import NotFound from "@/pages/NotFound";

export default function SectionReader() {
  const { slug } = useParams<{ slug: string }>();
  const idx = SECTIONS.findIndex((s) => s.slug === slug);
  const section = idx >= 0 ? SECTIONS[idx] : undefined;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  if (!section) return <NotFound />;

  const prev = idx > 0 ? SECTIONS[idx - 1] : undefined;
  const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : undefined;

  return (
    <PageShell>
      <PageHeader title={section.title} subtitle={`Chapter ${idx + 1} of ${SECTIONS.length}`} back="/handbook" emoji={section.emoji} />
      {/* reading progress bar */}
      <div className="sticky top-[61px] z-40 h-1 bg-transparent">
        <div className="h-full bg-primary/70 rounded-r-full transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <article className="px-5 pt-4">
        <p className="text-sm text-muted-foreground leading-relaxed italic">{section.tagline}</p>
        <p className="text-[11px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
          <Clock size={11} /> {section.readMins} min read
        </p>

        {section.hero && (
          <div className="relative mt-4 mb-2">
            <div className="absolute -inset-1.5 bg-primary/10 rounded-[1.8rem] rotate-1" aria-hidden />
            <img
              src={section.hero}
              alt={section.title}
              className="relative w-full aspect-[16/10] object-cover rounded-3xl border border-border"
            />
          </div>
        )}

        <StoryBlocks blocks={section.blocks} />

        <PawDivider />

        {/* prev / next */}
        <div className="grid grid-cols-2 gap-2.5 pb-4">
          {prev ? (
            <Link href={`/handbook/${prev.slug}`} className="sticker-card px-3.5 py-3 press-scale">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <ChevronLeft size={11} /> Previous
              </p>
              <p className="font-bold text-[13px] leading-snug mt-1">
                {prev.emoji} {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/handbook/${next.slug}`} className="sticker-card px-3.5 py-3 press-scale text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1 justify-end">
                Next <ChevronRight size={11} />
              </p>
              <p className="font-bold text-[13px] leading-snug mt-1">
                {next.emoji} {next.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </article>
    </PageShell>
  );
}

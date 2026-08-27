/*
 * Storybook Picture-Book theme — long-form content block renderer.
 * Renders the Block union from content/types.ts with keepsake styling:
 * tips as honey sticker cards, warnings blush, bars in warm chart palette,
 * timelines with a stitched thread, tables as rounded cards.
 *
 * ENS % bars are not rendered as science — listed as reported claims only.
 */
import type { Block } from "@/content/types";
import { PawPrint, Lightbulb, AlertTriangle } from "lucide-react";
import { fixProductCopy } from "@/lib/productCopy";

function Bold({ text }: { text: string }) {
  const parts = fixProductCopy(text).split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-foreground">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function StoryBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "h":
      return (
        <h2 className="font-display font-bold text-xl mt-8 mb-3 text-foreground leading-snug">
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p className="text-[15px] leading-[1.7] text-foreground/85 mb-4">
          <Bold text={block.text} />
        </p>
      );
    case "tip":
      return (
        <div className="rounded-2xl border border-[oklch(0.82_0.08_85)] bg-[oklch(0.96_0.045_90)] px-4 py-3.5 mb-4">
          <p className="flex items-center gap-1.5 font-extrabold text-[13px] text-[oklch(0.45_0.09_75)] mb-1">
            <Lightbulb size={15} /> {block.title}
          </p>
          <p className="text-sm leading-relaxed text-[oklch(0.38_0.06_65)]">
            <Bold text={block.text} />
          </p>
        </div>
      );
    case "warn":
      return (
        <div className="rounded-2xl border border-[oklch(0.82_0.07_25)] bg-[oklch(0.95_0.035_25)] px-4 py-3.5 mb-4">
          <p className="flex items-center gap-1.5 font-extrabold text-[13px] text-[oklch(0.45_0.13_28)] mb-1">
            <AlertTriangle size={15} /> {block.title}
          </p>
          <p className="text-sm leading-relaxed text-[oklch(0.38_0.08_30)]">
            <Bold text={block.text} />
          </p>
        </div>
      );
    case "list":
      return (
        <ul className="mb-4 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-foreground/85">
              <PawPrint size={14} className="text-primary/60 shrink-0 mt-1.5" />
              <span>
                <Bold text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="mb-5 space-y-3">
          {block.items.map((s, i) => (
            <li key={i} className="sticker-card px-4 py-3 flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-[14px] leading-snug">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                  <Bold text={s.text} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="mb-5 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-[13px]" style={{ minWidth: block.headers.length > 3 ? "30rem" : undefined }}>
            <thead>
              <tr className="bg-secondary">
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left font-extrabold px-3 py-2.5 text-secondary-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-muted/50" : "bg-card"}>
                  {r.map((c, j) => (
                    <td key={j} className="px-3 py-2.5 align-top leading-snug text-foreground/85" style={{ minWidth: "5.5rem" }}>
                      <Bold text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "img":
      return (
        <figure className="mb-5">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-primary/8 rounded-[1.6rem] rotate-1" aria-hidden />
            <img
              src={block.src}
              alt={block.alt}
              loading="lazy"
              className="relative w-full rounded-3xl border border-border object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="text-center text-xs text-muted-foreground mt-2.5 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="mb-5 pl-4 border-l-4 border-primary/40">
          <p className="font-display italic text-[16px] leading-relaxed text-foreground/80">
            “{block.text}”
          </p>
          {block.source && (
            <cite className="block text-xs text-muted-foreground mt-1.5 not-italic">— {block.source}</cite>
          )}
        </blockquote>
      );
    case "bars": {
      return (
        <div className="sticker-card px-4 py-4 mb-5">
          <p className="font-extrabold text-[13px] mb-2">{block.title}</p>
          <ul className="space-y-1.5">
            {block.items.map((b, i) => (
              <li key={i} className="text-sm text-foreground/80 leading-snug">
                {b.label}
                {b.note ? ` — ${b.note}` : ""}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            Reported claims, not percentages we treat as science. Independent evidence is limited;
            ENS is not a substitute for real socialisation.
          </p>
        </div>
      );
    }
    case "timeline":
      return (
        <div className="mb-5 relative pl-6">
          <span className="absolute left-[7px] top-1 bottom-1 border-l-2 border-dashed border-primary/35" aria-hidden />
          <div className="space-y-4">
            {block.items.map((t, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center" />
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-primary">{t.when}</p>
                <p className="font-bold text-[14px] mt-0.5">{t.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                  <Bold text={t.text} />
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function StoryBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <StoryBlock key={i} block={b} />
      ))}
    </>
  );
}

/*
 * Storybook Picture-Book theme — 100 Things Owners Learn Too Late.
 * Numbered wisdom cards grouped by category; tap to mark "learned it",
 * progress saved on device.
 */
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/AppShell";
import { HUNDRED, HUNDRED_TOTAL } from "@/content/hundredThings";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { PawPrint, ChevronDown } from "lucide-react";

export default function HundredThings() {
  const [learned, setLearned] = useLocalStorage<Record<string, boolean>>("hundred", {});
  const [open, setOpen] = useState<string | null>(HUNDRED[0]?.id ?? null);

  const learnedCount = Object.values(learned).filter(Boolean).length;

  // global numbering across categories
  let counter = 0;
  const numbered = HUNDRED.map((cat) => ({
    ...cat,
    numberedItems: cat.items.map((text) => ({ n: ++counter, text })),
  }));

  return (
    <PageShell>
      <PageHeader
        title={`${HUNDRED_TOTAL} Things Owners Learn Too Late`}
        subtitle="Tap one when it clicks — future you says thanks"
        back="/handbook"
        emoji="💯"
      />

      {/* progress */}
      <div className="px-5 pt-4">
        <div className="sticker-card px-4 py-3">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span>Wisdom absorbed</span>
            <span className="text-primary">
              {learnedCount} / {HUNDRED_TOTAL}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${(learnedCount / HUNDRED_TOTAL) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-4 space-y-3">
        {numbered.map((cat) => {
          const isOpen = open === cat.id;
          const catLearned = cat.numberedItems.filter((it) => learned[`${cat.id}:${it.n}`]).length;
          return (
            <div key={cat.id} className="sticker-card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 press-scale text-left"
                onClick={() => setOpen(isOpen ? null : cat.id)}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-bold text-[15px]">{cat.title}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {catLearned}/{cat.numberedItems.length} absorbed
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>
              {isOpen && (
                <ul className="px-3 pb-3 space-y-1.5">
                  {cat.numberedItems.map((it) => {
                    const key = `${cat.id}:${it.n}`;
                    const done = !!learned[key];
                    return (
                      <li key={it.n}>
                        <button
                          className={cn(
                            "w-full flex gap-2.5 items-start text-left rounded-2xl px-3 py-2.5 press-scale transition-colors",
                            done ? "bg-[oklch(0.94_0.04_140)]/70" : "bg-muted/40",
                          )}
                          onClick={() => setLearned((p) => ({ ...p, [key]: !p[key] }))}
                        >
                          <span
                            className={cn(
                              "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5",
                              done
                                ? "bg-[oklch(0.55_0.1_140)] text-white"
                                : "bg-card border border-border text-muted-foreground",
                            )}
                          >
                            {done ? <PawPrint size={12} /> : it.n}
                          </span>
                          <span
                            className={cn(
                              "text-[13px] leading-relaxed",
                              done ? "text-foreground/60" : "text-foreground/90",
                            )}
                          >
                            {it.text}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

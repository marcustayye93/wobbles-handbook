/*
 * Redesign v2 — "Keepsake Field Guide" 100 Things page, gamified.
 * Big ProgressRing "N OF 100", horizontal category filter chips,
 * milestone celebrations at 25/50/75/100 (high-five spot art),
 * and a "Surprise Me" button that highlights a random unlearned item.
 */
import { useMemo, useRef, useState } from "react";
import { PageShell, PageHeader, ProgressRing, Eyebrow } from "@/components/AppShell";
import SyncIndicator from "@/components/SyncIndicator";
import { HUNDRED, HUNDRED_TOTAL } from "@/content/hundredThings";
import { ASSETS } from "@/content/wobbles";
import { useSharedState } from "@/hooks/useSyncedData";
import { cn } from "@/lib/utils";
import { PawPrint, Sparkles } from "lucide-react";
import { toast } from "sonner";

const INK = "#22364D";
const SIENNA = "#C66A3D";
const MOSS = "#7B8C6A";
const MILESTONE_COUNTS = [25, 50, 75, 100];

interface FlatItem {
  key: string; // "catId:n"
  n: number;
  text: string;
  catId: string;
  catTitle: string;
  catEmoji: string;
}

export default function HundredThings() {
  const [learned, setLearned] = useSharedState<Record<string, boolean>>("hundred", {});
  const [filter, setFilter] = useState<string>("all");
  const [highlight, setHighlight] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // Flatten with global numbering
  const flat = useMemo<FlatItem[]>(() => {
    let counter = 0;
    return HUNDRED.flatMap((cat) =>
      cat.items.map((text) => {
        counter += 1;
        return {
          key: `${cat.id}:${counter}`,
          n: counter,
          text,
          catId: cat.id,
          catTitle: cat.title,
          catEmoji: cat.emoji,
        };
      }),
    );
  }, []);

  const learnedCount = flat.filter((it) => learned[it.key]).length;
  const visible = filter === "all" ? flat : flat.filter((it) => it.catId === filter);

  const toggle = (key: string) => {
    const willBe = !learned[key];
    const nextCount = learnedCount + (willBe ? 1 : -1);
    setLearned((p) => ({ ...p, [key]: !p[key] }));
    if (willBe && MILESTONE_COUNTS.includes(nextCount)) {
      toast(
        <div className="flex items-center gap-3">
          <img src={ASSETS.v2SpotHighfive} alt="" className="w-14 h-14 object-contain shrink-0" />
          <div>
            <p className="font-bold text-[14px]" style={{ color: INK }}>
              {nextCount === 100 ? "All 100! Wobbles is proud." : `${nextCount} down — high five!`}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {nextCount === 100
                ? "You officially learned everything the hard way, the easy way."
                : `${100 - nextCount} more to go. Future you says thanks.`}
            </p>
          </div>
        </div>,
        { duration: 4500 },
      );
    }
  };

  const surpriseMe = () => {
    const pool = flat.filter((it) => !learned[it.key]);
    if (pool.length === 0) {
      toast.success("Nothing left — you've learned all 100! 🐾");
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setFilter("all");
    setHighlight(pick.key);
    // Wait a tick for the full list to render, then scroll
    setTimeout(() => {
      itemRefs.current[pick.key]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    setTimeout(() => setHighlight(null), 3600);
  };

  return (
    <PageShell>
      <PageHeader
        title="100 Things Owners Learn Too Late"
        subtitle="Tap one when it clicks"
        back="/handbook"
        emoji="💯"
      />

      {/* progress ring hero */}
      <div className="px-5 pt-5">
        <div className="keepsake-card px-5 py-5 flex items-center gap-5">
          <ProgressRing
            value={learnedCount / HUNDRED_TOTAL}
            size={92}
            stroke={7}
            trackColor="rgba(34,54,77,0.1)"
            color={SIENNA}
          >
            <span className="flex flex-col items-center leading-none">
              <span className="font-display font-semibold text-[1.6rem]" style={{ color: INK }}>
                {learnedCount}
              </span>
              <span className="text-[8px] font-body font-extrabold uppercase tracking-[0.14em] text-muted-foreground mt-0.5">
                of 100
              </span>
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <Eyebrow>Wisdom absorbed</Eyebrow>
              <SyncIndicator />
            </div>
            <p className="text-[13px] font-body text-muted-foreground leading-relaxed mt-1.5">
              {learnedCount === 0
                ? "Every one of these was learned the hard way by someone. Learn them the easy way."
                : learnedCount < 100
                  ? `Nice — ${100 - learnedCount} lessons left before you're officially a doodle veteran.`
                  : "Doodle veteran status: achieved."}
            </p>
            <button
              onClick={surpriseMe}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-body font-extrabold uppercase tracking-wide text-[#FFFDF8] press-scale"
              style={{ backgroundColor: SIENNA }}
            >
              <Sparkles size={13} /> Surprise me
            </button>
          </div>
        </div>
      </div>

      {/* category filter chips */}
      <div className="overflow-x-auto scrollbar-none mt-4 -mx-0 px-5">
        <div className="flex gap-1.5 w-max pb-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3.5 py-2 rounded-full text-[11px] font-body font-extrabold uppercase tracking-wide border press-scale whitespace-nowrap transition-colors",
              filter === "all" ? "text-[#FFFDF8] border-transparent" : "bg-card border-border text-foreground/60",
            )}
            style={filter === "all" ? { backgroundColor: INK } : undefined}
          >
            All 100
          </button>
          {HUNDRED.map((cat) => {
            const done = flat.filter((it) => it.catId === cat.id && learned[it.key]).length;
            const total = cat.items.length;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "px-3.5 py-2 rounded-full text-[11px] font-body font-extrabold uppercase tracking-wide border press-scale whitespace-nowrap transition-colors",
                  filter === cat.id ? "text-[#FFFDF8] border-transparent" : "bg-card border-border text-foreground/60",
                )}
                style={filter === cat.id ? { backgroundColor: INK } : undefined}
              >
                {cat.emoji} {cat.title} · {done}/{total}
              </button>
            );
          })}
        </div>
      </div>

      {/* items */}
      <ul className="px-5 pt-3 pb-4 space-y-1.5">
        {visible.map((it) => {
          const done = !!learned[it.key];
          const isHighlit = highlight === it.key;
          return (
            <li
              key={it.key}
              ref={(el) => {
                itemRefs.current[it.key] = el;
              }}
            >
              <button
                className={cn(
                  "w-full flex gap-2.5 items-start text-left rounded-2xl px-3.5 py-3 press-scale transition-all duration-300 border",
                  done ? "border-transparent" : "bg-card border-border/60",
                  isHighlit && "ring-2 ring-offset-2 ring-offset-background",
                )}
                style={{
                  ...(done ? { backgroundColor: "rgba(123,140,106,0.16)" } : {}),
                  ...(isHighlit ? ({ "--tw-ring-color": SIENNA } as React.CSSProperties) : {}),
                }}
                onClick={() => toggle(it.key)}
              >
                <span
                  className={cn(
                    "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-body font-black mt-0.5 transition-colors",
                    done ? "text-white" : "bg-background border border-border text-muted-foreground",
                  )}
                  style={done ? { backgroundColor: MOSS } : undefined}
                >
                  {done ? <PawPrint size={12} /> : it.n}
                </span>
                <span className="min-w-0 flex-1">
                  {filter === "all" && (
                    <span className="block text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground/70 mb-0.5">
                      {it.catEmoji} {it.catTitle}
                    </span>
                  )}
                  <span
                    className={cn(
                      "block text-[13px] font-body leading-relaxed",
                      done ? "text-foreground/55" : "text-foreground/90",
                    )}
                  >
                    {it.text}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}

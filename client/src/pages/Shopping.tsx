/*
 * Redesign v2 — "Keepsake Field Guide" Shopping Countdown page.
 * Week-by-week purchase plan to homecoming (18 Sep 2026): countdown hero with
 * ProgressRing, "this week" spotlight card, catch-up (overdue) section, and a
 * dashed-spine timeline of all weeks. Ticks live in the family-shared
 * "shopping" map so both phones stay in sync.
 */
import { useEffect, useRef, useState } from "react";
import { PageShell, PageHeader, ProgressRing, Eyebrow } from "@/components/AppShell";
import SyncIndicator from "@/components/SyncIndicator";
import {
  SHOPPING_WEEKS,
  SHOPPING_TOTAL,
  weekStatus,
  currentWeek,
  weekRangeLabel,
  overdueItems,
  type ShoppingWeek,
  type ShoppingItem,
} from "@/content/shoppingPlan";
import { WOBBLES, daysUntil, formatDate } from "@/content/wobbles";
import { useSharedState } from "@/hooks/useSyncedData";
import { cn } from "@/lib/utils";
import { PawPrint, AlertTriangle, ChevronDown, PartyPopper } from "lucide-react";
import { toast } from "sonner";

const INK = "#22364D";
const SIENNA = "#C66A3D";
const RUST = "#B4512E";
const MOSS = "#7B8C6A";

function ItemRow({
  item,
  done,
  onToggle,
}: {
  item: ShoppingItem;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-start gap-3 text-left rounded-xl px-2 py-2.5 press-scale transition-colors",
        done ? "" : "hover:bg-muted/50",
      )}
    >
      <span
        className={cn(
          "shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-colors",
          done ? "text-white border-transparent" : "border-border bg-background",
        )}
        style={done ? { backgroundColor: MOSS } : undefined}
      >
        {done && <PawPrint size={13} />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[13.5px] font-body leading-snug",
            done ? "line-through text-muted-foreground" : "text-foreground/90 font-medium",
          )}
        >
          {item.emoji} {item.label}
        </span>
        {item.why && !done && (
          <span className="block text-[11px] font-body text-muted-foreground leading-relaxed mt-0.5">
            {item.why}
          </span>
        )}
      </span>
    </button>
  );
}

function WeekCard({
  week,
  ticks,
  toggle,
  defaultOpen,
  innerRef,
}: {
  week: ShoppingWeek;
  ticks: Record<string, boolean>;
  toggle: (id: string) => void;
  defaultOpen: boolean;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  const status = weekStatus(week);
  const done = week.items.filter((it) => ticks[it.id]).length;
  const complete = done === week.items.length;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div ref={innerRef} className="relative pl-9">
      {/* timeline node */}
      <span
        className={cn(
          "absolute left-0 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-body font-black transition-colors",
        )}
        style={
          complete
            ? { backgroundColor: MOSS, borderColor: MOSS, color: "#fff" }
            : status === "current"
              ? { backgroundColor: SIENNA, borderColor: SIENNA, color: "#fff" }
              : { backgroundColor: "#FFFDF8", borderColor: "#E5DAC8", color: "rgba(34,54,77,0.5)" }
        }
      >
        {complete ? <PawPrint size={11} /> : week.id.slice(1)}
      </span>

      <div
        className={cn(
          "keepsake-card overflow-hidden transition-opacity",
          status === "past" && !complete ? "" : "",
          status === "future" && "opacity-80",
        )}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left press-scale"
        >
          <span className="text-[18px] shrink-0">{week.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="font-body font-bold text-[13.5px] leading-snug" style={{ color: INK }}>
                {week.title}
              </span>
              {status === "current" && (
                <span
                  className="shrink-0 text-[8px] font-body font-extrabold uppercase tracking-[0.12em] text-[#FFFDF8] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: RUST }}
                >
                  This week
                </span>
              )}
            </span>
            <span className="block text-[10.5px] font-body text-muted-foreground mt-0.5">
              {weekRangeLabel(week)} · {done}/{week.items.length} done
            </span>
          </span>
          <ChevronDown
            size={16}
            className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>

        {open && (
          <div className="px-2.5 pb-2.5 border-t border-dashed border-[#E5DAC8]">
            <p className="text-[11px] font-body text-muted-foreground leading-relaxed px-2 pt-2.5">
              {week.theme}
            </p>
            <ul className="mt-1">
              {week.items.map((it) => (
                <li key={it.id}>
                  <ItemRow item={it} done={!!ticks[it.id]} onToggle={() => toggle(it.id)} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Shopping() {
  const [ticks, setTicks] = useSharedState<Record<string, boolean>>("shopping", {});
  const currentRef = useRef<HTMLDivElement | null>(null);
  const didScroll = useRef(false);

  const doneCount = SHOPPING_WEEKS.flatMap((w) => w.items).filter((it) => ticks[it.id]).length;
  const days = daysUntil(WOBBLES.homecoming);
  const cw = currentWeek();
  const overdue = overdueItems(ticks);
  const allDone = doneCount === SHOPPING_TOTAL;

  const toggle = (id: string) => {
    const willBe = !ticks[id];
    const nextCount = doneCount + (willBe ? 1 : -1);
    setTicks((p) => ({ ...p, [id]: !p[id] }));
    if (willBe && nextCount === SHOPPING_TOTAL) {
      toast(
        <div className="flex items-center gap-3">
          <PartyPopper size={28} style={{ color: SIENNA }} className="shrink-0" />
          <div>
            <p className="font-bold text-[14px]" style={{ color: INK }}>
              Everything's ready for Wobbles!
            </p>
            <p className="text-[12px] text-muted-foreground">
              The den is stocked. Now you just wait for {formatDate(WOBBLES.homecoming)}.
            </p>
          </div>
        </div>,
        { duration: 5000 },
      );
    }
  };

  // Auto-scroll once to the current week (only if past weeks exist above it)
  useEffect(() => {
    if (didScroll.current) return;
    const hasPastAbove = SHOPPING_WEEKS.some((w) => weekStatus(w) === "past");
    if (hasPastAbove && currentRef.current) {
      didScroll.current = true;
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    }
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Shopping Countdown"
        subtitle="Everything bought in the right order"
        back="/handbook"
        emoji="🛒"
      />

      {/* countdown + progress hero */}
      <div className="px-5 pt-5">
        <div className="keepsake-card px-5 py-5 flex items-center gap-5">
          <ProgressRing
            value={doneCount / SHOPPING_TOTAL}
            size={92}
            stroke={7}
            trackColor="rgba(34,54,77,0.1)"
            color={SIENNA}
          >
            <span className="flex flex-col items-center leading-none">
              <span className="font-display font-semibold text-[1.6rem]" style={{ color: INK }}>
                {doneCount}
              </span>
              <span className="text-[8px] font-body font-extrabold uppercase tracking-[0.14em] text-muted-foreground mt-0.5">
                of {SHOPPING_TOTAL}
              </span>
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <Eyebrow>Den in progress</Eyebrow>
              <SyncIndicator />
            </div>
            <p className="text-[13px] font-body text-muted-foreground leading-relaxed mt-1.5">
              {days > 0 ? (
                <>
                  <span className="font-bold" style={{ color: RUST }}>
                    {days} days
                  </span>{" "}
                  until homecoming ({formatDate(WOBBLES.homecoming)}). Big things first, fresh things
                  last — the plan below spreads it out so nothing is a scramble.
                </>
              ) : (
                <>Wobbles is home! Anything left below doubles as the settling-in shopping list.</>
              )}
            </p>
            {allDone && (
              <p className="text-[12px] font-body font-bold mt-2" style={{ color: MOSS }}>
                All {SHOPPING_TOTAL} items done — the den is ready. 🐾
              </p>
            )}
          </div>
        </div>
      </div>

      {/* catch-up section */}
      {overdue.length > 0 && (
        <div className="px-5 pt-4">
          <div
            className="keepsake-card p-4 border-l-4"
            style={{ borderLeftColor: RUST }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} style={{ color: RUST }} />
              <Eyebrow>Catch-up — from earlier weeks</Eyebrow>
            </div>
            <ul className="mt-1.5">
              {overdue.map(({ item }) => (
                <li key={item.id}>
                  <ItemRow item={item} done={false} onToggle={() => toggle(item.id)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* timeline of weeks */}
      <div className="px-5 pt-6 pb-6">
        <Eyebrow className="mb-3">The plan, week by week</Eyebrow>
        <div className="relative">
          {/* dashed spine */}
          <span
            className="absolute left-[11px] top-4 bottom-4 border-l-2 border-dashed border-[#E5DAC8]"
            aria-hidden
          />
          <div className="space-y-3">
            {SHOPPING_WEEKS.map((w) => (
              <WeekCard
                key={w.id}
                week={w}
                ticks={ticks}
                toggle={toggle}
                defaultOpen={w.id === cw.id || weekStatus(w) === "current"}
                innerRef={w.id === cw.id ? (el) => (currentRef.current = el) : undefined}
              />
            ))}
          </div>
        </div>
        <p className="text-[11px] font-body text-muted-foreground text-center mt-5 leading-relaxed">
          Ticks sync for the whole family — buy it, tick it, and it's off everyone's list.
          <br />
          The Puppy Arrival checklist covers the same ground as a final-day sweep.
        </p>
      </div>
    </PageShell>
  );
}

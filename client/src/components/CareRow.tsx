/*
 * CareRow — ChatGPT-inspired one-tap care row for the top of Home.
 * Walk · Meal · Toilet · Sleep · Shower: a single tap logs the entry
 * instantly (smart default option by time of day, current time) with an
 * Undo toast; a long-press (or the ⋯ affordance) opens the QuickLogSheet
 * mini-form for details. Below each chip, today's count for that tracker.
 *
 * Toilet never silently invents "Wee on pad" — no default option; tap
 * opens the picker. Week-1 home (from landing) only shows weight / toilet / sleep.
 */
import { useRef } from "react";
import { useAddTrackerEntry, useRemoveTrackerEntry, useTrackerFeed } from "@/hooks/useSyncedData";
import { todayISO, nowHM } from "@/lib/dates";
import { getTracker } from "@/lib/trackers";
import { toast } from "sonner";

export interface CareAction {
  trackerId: string;
  label: string;
  emoji: string;
  /** pick the default option for a one-tap log, given the current hour */
  defaultOption?: (hour: number) => string;
  /** If true (or if the tracker has options/value and no default), tap opens the sheet instead of logging. */
  requireChoice?: boolean;
}

export const CARE_ACTIONS: CareAction[] = [
  {
    trackerId: "walk",
    label: "Walk",
    emoji: "🐾",
    defaultOption: (h) => (h < 12 ? "Morning walk" : "Evening walk"),
  },
  {
    trackerId: "feeding",
    label: "Meal",
    emoji: "🍽️",
    defaultOption: (h) => (h < 11 ? "Breakfast" : h < 16 ? "Lunch" : "Dinner"),
  },
  {
    trackerId: "toilet",
    label: "Toilet",
    emoji: "🚽",
    // No default — a one-tap must never invent "Wee on pad ✅".
    requireChoice: true,
  },
  {
    trackerId: "sleep",
    label: "Sleep",
    emoji: "😴",
    defaultOption: (h) => (h >= 20 || h < 6 ? "Night — slept through" : "Nap (crate)"),
  },
  {
    trackerId: "shower",
    label: "Shower",
    emoji: "🛁",
    defaultOption: () => "Quick rinse (water only)",
  },
];

/** Week-1 home: only weight, toilet, sleep. Weight and toilet always open the sheet. */
export const WEEK1_CARE_ACTIONS: CareAction[] = [
  {
    trackerId: "weight",
    label: "Weight",
    emoji: "⚖️",
    requireChoice: true,
  },
  {
    trackerId: "toilet",
    label: "Toilet",
    emoji: "🚽",
    requireChoice: true,
  },
  {
    trackerId: "sleep",
    label: "Sleep",
    emoji: "😴",
    defaultOption: (h) => (h >= 20 || h < 6 ? "Night — slept through" : "Nap (crate)"),
  },
];

/** Default option for a one-tap log right now (exported for tests). */
export function defaultOptionFor(trackerId: string, hour: number): string | undefined {
  const a = CARE_ACTIONS.find((x) => x.trackerId === trackerId);
  return a?.defaultOption?.(hour);
}

const LONG_PRESS_MS = 450;

export default function CareRow({
  onDetails,
  actions = CARE_ACTIONS,
}: {
  onDetails: (trackerId: string) => void;
  actions?: CareAction[];
}) {
  const addMutation = useAddTrackerEntry();
  const removeMutation = useRemoveTrackerEntry();
  const { rows } = useTrackerFeed();
  const today = todayISO();

  const countToday = (trackerId: string) =>
    rows.filter((r) => r.trackerId === trackerId && r.date === today).length;

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const startPress = (trackerId: string) => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      if (navigator.vibrate) navigator.vibrate(10);
      onDetails(trackerId);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const oneTap = (a: CareAction) => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    const meta = getTracker(a.trackerId);
    if (!meta) return;
    const hour = new Date().getHours();
    const option = a.defaultOption?.(hour);
    const needsPicker =
      a.requireChoice === true ||
      (Boolean(meta.fields.options) && !option) ||
      (Boolean(meta.fields.value) && a.requireChoice !== false && !option);
    if (needsPicker) {
      onDetails(a.trackerId);
      return;
    }
    addMutation.mutate(
      {
        trackerId: a.trackerId,
        date: todayISO(),
        ...(meta.fields.time ? { time: nowHM() } : {}),
        ...(option && meta.fields.options ? { option } : {}),
      },
      {
        onSuccess: (saved: unknown) => {
          const id = (saved as { id?: number } | undefined)?.id;
          toast.success(`${a.emoji} ${a.label} logged${option ? ` — ${option}` : ""}`, {
            action:
              typeof id === "number" && id > 0
                ? { label: "Undo", onClick: () => removeMutation.mutate({ id }) }
                : undefined,
            duration: 4000,
          });
        },
      },
    );
  };

  const cols = actions.length <= 3 ? "grid-cols-3" : "grid-cols-5";

  return (
    <div className={`grid ${cols} gap-1.5`}>
      {actions.map((a) => {
        const n = countToday(a.trackerId);
        return (
          <button
            key={a.trackerId}
            type="button"
            onClick={() => oneTap(a)}
            onPointerDown={() => startPress(a.trackerId)}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={
              a.requireChoice || !a.defaultOption
                ? `Log ${a.label} (choose details)`
                : `Log ${a.label} now (hold for details)`
            }
            className="relative flex flex-col items-center gap-1 pt-3 pb-2.5 rounded-2xl bg-[#FFFDF8] border border-[#E5DAC8] shadow-sm press-scale select-none touch-manipulation min-h-[44px]"
          >
            {n > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold flex items-center justify-center leading-none">
                {n}
              </span>
            )}
            <span className="text-[19px] leading-none">{a.emoji}</span>
            <span className="text-[11px] font-body font-extrabold uppercase tracking-wide text-[#22364D]">
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

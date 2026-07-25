/*
 * CareRow — ChatGPT-inspired one-tap care row for the top of Home.
 * Walk · Meal · Toilet · Sleep · Shower: a single tap logs the entry
 * instantly (smart default option by time of day, current time) with an
 * Undo toast; a long-press (or the ⋯ affordance) opens the QuickLogSheet
 * mini-form for details. Below each chip, today's count for that tracker.
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
    defaultOption: () => "Wee on pad ✅",
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

/** Default option for a one-tap log right now (exported for tests). */
export function defaultOptionFor(trackerId: string, hour: number): string | undefined {
  const a = CARE_ACTIONS.find((x) => x.trackerId === trackerId);
  return a?.defaultOption?.(hour);
}

const LONG_PRESS_MS = 450;

export default function CareRow({ onDetails }: { onDetails: (trackerId: string) => void }) {
  const addMutation = useAddTrackerEntry();
  const removeMutation = useRemoveTrackerEntry();
  const { rows } = useTrackerFeed();
  const today = todayISO();

  const countToday = (trackerId: string) =>
    rows.filter((r) => r.trackerId === trackerId && r.date === today).length;

  // long-press detection (touch + mouse), suppresses the following click
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
      return; // long-press already opened the detail sheet
    }
    const meta = getTracker(a.trackerId);
    if (!meta) return;
    const hour = new Date().getHours();
    const option = a.defaultOption?.(hour);
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

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {CARE_ACTIONS.map((a) => {
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
            aria-label={`Log ${a.label} now (hold for details)`}
            className="relative flex flex-col items-center gap-1 pt-3 pb-2.5 rounded-2xl bg-[#FFFDF8] border border-[#E5DAC8] shadow-sm press-scale select-none touch-manipulation"
          >
            {n > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold flex items-center justify-center leading-none">
                {n}
              </span>
            )}
            <span className="text-[19px] leading-none">{a.emoji}</span>
            <span className="text-[8.5px] font-body font-extrabold uppercase tracking-wide text-[#22364D]">
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

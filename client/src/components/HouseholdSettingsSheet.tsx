/*
 * Keepsake Field Guide — Household settings sheet.
 * Two jobs, both family-shared via server state (key "householdSettings"):
 *   1. Weekly schedule editor — tap a chip to cycle each person's presence
 *      (home → office → maybe office) for any weekday. The daily plan card
 *      and nudges read from this immediately.
 *   2. One-off reminders — dated notes ("vet reweigh Friday") that surface
 *      on Home on the right day, optionally tagged Marcus or Chesa.
 */
import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useSharedState } from "@/hooks/useSyncedData";
import {
  SETTINGS_KEY,
  defaultSettings,
  normalizeSettings,
  scheduleIsCustom,
  upcomingReminders,
  pastReminders,
  type HouseholdSettings,
  type OneOffReminder,
} from "@/lib/householdSettings";
import { todayISO } from "@/lib/dates";
import { formatDate } from "@/content/wobbles";
import { type Presence } from "@/content/household";
import { cn } from "@/lib/utils";
import { Trash2, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** display order Mon..Sun -> dow index */
const DOW: number[] = [1, 2, 3, 4, 5, 6, 0];

const NEXT: Record<Presence, Presence> = {
  home: "office",
  office: "maybe-office",
  "maybe-office": "home",
};

const PRESENCE_LABEL: Record<Presence, string> = {
  home: "Home",
  office: "Office",
  "maybe-office": "Maybe",
};

const PRESENCE_STYLE: Record<Presence, string> = {
  home: "bg-[#6B7C5A]/15 text-[#4C5C3D] border-[#6B7C5A]/40",
  office: "bg-[#22364D]/8 text-[#22364D] border-[#22364D]/25",
  "maybe-office": "bg-[#C66A3D]/12 text-[#B4512E] border-[#C66A3D]/40",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HouseholdSettingsSheet({ open, onOpenChange }: Props) {
  const [raw, setRaw] = useSharedState<HouseholdSettings>(SETTINGS_KEY, defaultSettings());
  const settings = normalizeSettings(raw);

  // reminder form
  const [remDate, setRemDate] = useState(todayISO());
  const [remText, setRemText] = useState("");
  const [remPerson, setRemPerson] = useState<"both" | "marcus" | "chesa">("both");

  const cycle = (person: "marcus" | "chesa", dow: number) => {
    const week = [...settings.schedule[person]] as Presence[];
    week[dow] = NEXT[week[dow]];
    setRaw({ ...settings, schedule: { ...settings.schedule, [person]: week } });
  };

  const resetSchedule = () => {
    setRaw({ ...settings, schedule: defaultSettings().schedule });
    toast.success("Weekly schedule reset to the usual week");
  };

  const addReminder = () => {
    const text = remText.trim();
    if (!text) {
      toast.error("Write what the reminder is for");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(remDate)) {
      toast.error("Pick a date");
      return;
    }
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const reminder: OneOffReminder = {
      id,
      date: remDate,
      text: text.slice(0, 200),
      ...(remPerson !== "both" ? { person: remPerson } : {}),
    };
    setRaw({ ...settings, reminders: { ...settings.reminders, [id]: reminder } });
    setRemText("");
    setRemPerson("both");
    toast.success("Reminder added — it'll show on Home that day");
  };

  const deleteReminder = (id: string) => {
    const next = { ...settings.reminders };
    delete next[id];
    setRaw({ ...settings, reminders: next });
  };

  const upcoming = upcomingReminders(settings);
  const past = pastReminders(settings);
  const custom = scheduleIsCustom(settings);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#FFFDF8] max-h-[92dvh]">
        <DrawerHeader className="pb-1">
          <DrawerTitle className="font-display text-[1.5rem] text-[#22364D]">
            ⚙️ Household settings
          </DrawerTitle>
          <p className="text-[11.5px] font-body text-muted-foreground text-left leading-snug">
            Shared with the whole family — changes update everyone's daily plan instantly.
          </p>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-10 space-y-6">
          {/* ===== Weekly schedule ===== */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-body font-extrabold uppercase tracking-[0.16em] text-[#B4512E]">
                Who's home each week
              </h3>
              {custom && (
                <button
                  onClick={resetSchedule}
                  className="flex items-center gap-1 text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground press-scale"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>
            <p className="text-[11.5px] font-body text-muted-foreground leading-snug mb-2.5">
              Tap a chip to cycle Home → Office → Maybe. The daily plan and activity ideas follow this.
            </p>
            <div className="rounded-2xl border border-[#E5DAC8] overflow-hidden">
              <div className="grid grid-cols-[44px_1fr_1fr] bg-[#F8F3EB] px-3 py-2 text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#22364D]">
                <span />
                <span className="text-center">Marcus</span>
                <span className="text-center">Chesa</span>
              </div>
              {DOW.map((dow, i) => (
                <div
                  key={dow}
                  className={cn(
                    "grid grid-cols-[44px_1fr_1fr] items-center gap-2 px-3 py-1.5",
                    i % 2 === 1 && "bg-[#F8F3EB]/50",
                  )}
                >
                  <span className="text-[11px] font-body font-extrabold text-[#22364D]">{DAYS[i]}</span>
                  {(["marcus", "chesa"] as const).map((person) => {
                    const p = settings.schedule[person][dow];
                    return (
                      <button
                        key={person}
                        onClick={() => cycle(person, dow)}
                        aria-label={`${person} on ${DAYS[i]}: ${PRESENCE_LABEL[p]} — tap to change`}
                        className={cn(
                          "h-8 rounded-full border text-[10.5px] font-body font-extrabold uppercase tracking-wide press-scale",
                          PRESENCE_STYLE[p],
                        )}
                      >
                        {PRESENCE_LABEL[p]}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* ===== One-off reminders ===== */}
          <section>
            <h3 className="text-[10px] font-body font-extrabold uppercase tracking-[0.16em] text-[#B4512E] mb-2">
              One-off reminders
            </h3>
            <p className="text-[11.5px] font-body text-muted-foreground leading-snug mb-2.5">
              Vet visits, guests, deliveries — anything that should pop up on Home on a particular day.
            </p>

            <div className="rounded-2xl border border-[#E5DAC8] p-3 space-y-2.5">
              <Input
                value={remText}
                onChange={(e) => setRemText(e.target.value)}
                placeholder="e.g. Vet reweigh at Woodlands clinic, 10am"
                maxLength={200}
                className="bg-white"
              />
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={remDate}
                  min={todayISO()}
                  onChange={(e) => setRemDate(e.target.value)}
                  className="bg-white flex-1"
                />
                <div className="flex rounded-full border border-[#E5DAC8] overflow-hidden shrink-0">
                  {(["both", "marcus", "chesa"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setRemPerson(p)}
                      className={cn(
                        "px-2.5 text-[9.5px] font-body font-extrabold uppercase tracking-wide",
                        remPerson === p ? "bg-[#22364D] text-[#FFFDF8]" : "bg-white text-[#22364D]",
                      )}
                    >
                      {p === "both" ? "Both" : p === "marcus" ? "Marcus" : "Chesa"}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addReminder} className="btn-ink w-full justify-center inline-flex">
                <Plus size={15} /> Add reminder
              </button>
            </div>

            {/* Upcoming list */}
            {upcoming.length > 0 && (
              <div className="mt-3 space-y-2">
                {upcoming.map((r) => (
                  <div key={r.id} className="sticker-card px-3.5 py-2.5 flex items-center gap-3">
                    <span className="text-[15px] shrink-0">📌</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-body font-bold text-[#22364D] leading-snug">
                        {r.person && (
                          <span className="mr-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#B4512E]">
                            {r.person === "marcus" ? "Marcus" : "Chesa"}
                          </span>
                        )}
                        {r.text}
                      </span>
                      <span className="block text-[10.5px] font-body text-muted-foreground">
                        {r.date === todayISO() ? "Today" : formatDate(r.date)}
                      </span>
                    </span>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      aria-label="Delete reminder"
                      className="w-8 h-8 rounded-full bg-[#F8F3EB] flex items-center justify-center text-muted-foreground press-scale shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {upcoming.length === 0 && (
              <p className="mt-3 text-[11.5px] font-body text-muted-foreground text-center">
                No upcoming reminders yet.
              </p>
            )}

            {/* Past, quietly */}
            {past.length > 0 && (
              <details className="mt-3">
                <summary className="text-[10.5px] font-body font-extrabold uppercase tracking-wide text-muted-foreground cursor-pointer">
                  Past reminders ({past.length})
                </summary>
                <div className="mt-2 space-y-1.5">
                  {past.map((r) => (
                    <div key={r.id} className="flex items-center gap-2.5 px-1 opacity-70">
                      <span className="min-w-0 flex-1 text-[11.5px] font-body text-[#33475C] leading-snug truncate">
                        {formatDate(r.date)} — {r.text}
                      </span>
                      <button
                        onClick={() => deleteReminder(r.id)}
                        aria-label="Delete past reminder"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground press-scale shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/*
 * Keepsake Field Guide — QuickLogSheet.
 * One bottom sheet for all logging: a tracker grid (step 1) and an inline
 * mini-form (step 2) that saves straight to the family-shared server via
 * tRPC — every phone sees the new entry instantly through the shared cache.
 */
import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TRACKERS, getTracker } from "@/lib/trackers";
import { useAddTrackerEntry } from "@/hooks/useSyncedData";
import { todayISO, nowHM } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const INK = "#22364D";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** jump straight to a tracker's form (from Home quick actions) */
  initialTracker?: string | null;
}

export default function QuickLogSheet({ open, onOpenChange, initialTracker }: Props) {
  const addMutation = useAddTrackerEntry();
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowHM());
  const [value, setValue] = useState("");
  const [option, setOption] = useState("");
  const [note, setNote] = useState("");

  // reset / preselect whenever the sheet opens
  useEffect(() => {
    if (open) {
      const id = initialTracker ?? null;
      setTrackerId(id);
      setDate(todayISO());
      setTime(nowHM());
      setValue("");
      setOption(id ? (getTracker(id)?.fields.options?.choices[0] ?? "") : "");
      setNote("");
    }
  }, [open, initialTracker]);

  const meta = trackerId ? getTracker(trackerId) : undefined;
  const f = meta?.fields;

  const pick = (id: string) => {
    setTrackerId(id);
    setOption(getTracker(id)?.fields.options?.choices[0] ?? "");
    setValue("");
    setNote("");
  };

  const save = () => {
    if (!meta || !f) return;
    if (f.value && value !== "") {
      const n = Number(value);
      if (Number.isNaN(n) || n < f.value.min || n > f.value.max) {
        toast.error(`${f.value.label} must be between ${f.value.min} and ${f.value.max} ${f.value.unit}`);
        return;
      }
    }
    if (f.value && value === "" && !f.options) {
      toast.error(`Enter a ${f.value.label.toLowerCase()}`);
      return;
    }
    addMutation.mutate({
      trackerId: meta.id,
      date,
      ...(f.time ? { time } : {}),
      ...(f.value && value !== "" ? { value: String(Number(value)) } : {}),
      ...(f.options ? { option } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    onOpenChange(false);
    toast.success(`${meta.emoji} ${meta.title} logged`);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#FFFDF8]">
        <DrawerHeader className="pb-1">
          <DrawerTitle className="font-display text-[1.5rem] text-[#22364D] flex items-center gap-2">
            {meta ? (
              <>
                <button
                  onClick={() => setTrackerId(null)}
                  aria-label="Back to tracker list"
                  className="w-8 h-8 -ml-1 rounded-full bg-[#F8F3EB] flex items-center justify-center press-scale"
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  {meta.emoji} {meta.title}
                </span>
              </>
            ) : (
              "What are we logging?"
            )}
          </DrawerTitle>
        </DrawerHeader>

        {!meta ? (
          /* Step 1 — tracker grid */
          <div className="grid grid-cols-4 gap-2.5 px-4 pb-8 pt-2">
            {TRACKERS.map((t) => (
              <button
                key={t.id}
                onClick={() => pick(t.id)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#F8F3EB] border border-border/60 press-scale"
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-[9px] font-body font-extrabold uppercase tracking-wide text-[#22364D] text-center leading-tight px-1">
                  {t.title}
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Step 2 — mini form */
          <div className="px-5 pb-8 pt-1 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground">Date</span>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 rounded-xl bg-background" />
              </label>
              {f?.time && (
                <label className="block">
                  <span className="text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground">Time</span>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 rounded-xl bg-background" />
                </label>
              )}
              {f?.value && (
                <label className="block">
                  <span className="text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground">
                    {f.value.label} ({f.value.unit})
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={f.value.min}
                    max={f.value.max}
                    step={f.value.step}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="mt-1 rounded-xl bg-background"
                    placeholder={`${f.value.min}–${f.value.max}`}
                  />
                </label>
              )}
            </div>

            {f?.options && (
              <div className="mt-3">
                <span className="text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground">
                  {f.options.label}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {f.options.choices.map((c) => (
                    <button
                      key={c}
                      onClick={() => setOption(c)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-body font-bold border press-scale transition-colors",
                        option === c ? "text-[#FFFDF8] border-transparent" : "bg-background border-border text-foreground/70",
                      )}
                      style={option === c ? { backgroundColor: INK } : undefined}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {f?.note && (
              <label className="block mt-3">
                <span className="text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground">
                  Note (optional)
                </span>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 rounded-xl min-h-[56px] bg-background"
                  placeholder="Anything worth remembering…"
                />
              </label>
            )}

            <button
              className="btn-ink w-full h-12 rounded-2xl mt-4 font-body font-extrabold text-[14px] press-scale"
              onClick={save}
            >
              Save
            </button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

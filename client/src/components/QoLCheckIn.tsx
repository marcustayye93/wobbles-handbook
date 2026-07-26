/*
 * QoL check-in card (U7) — the HHHHHMM quality-of-life check-in on Health.
 * Seven 0–5 slider rows, a live total, gentle interpretation bands, and a save
 * that writes a `qol` tracker entry (value = total, note = per-dimension line).
 * Visible at every age — framed as "worth starting early" before the senior years.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Eyebrow } from "@/components/AppShell";
import { useTrackerEntries, useAddTrackerEntry } from "@/hooks/useSyncedData";
import { wobblesAge, formatDate } from "@/content/wobbles";
import {
  QOL_DIMENSIONS,
  QOL_MAX,
  qolBand,
  qolBandCopy,
  qolTotal,
  encodeQolNote,
} from "@/lib/qol";
import { cn } from "@/lib/utils";
import { HeartPulse, ChevronDown, ChevronUp } from "lucide-react";

const BAND_COLORS: Record<string, string> = {
  comfortable: "#6B7C5A",
  watch: "#C08A2D",
  vet: "#B4512E",
};

function localISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function QoLCheckIn() {
  const { entries } = useTrackerEntries("qol");
  const addEntry = useAddTrackerEntry();
  const age = wobblesAge();

  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(() => QOL_DIMENSIONS.map(() => 4));
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => qolTotal(scores), [scores]);
  const band = qolBand(total);
  const bandInfo = qolBandCopy(band);
  const bandColor = BAND_COLORS[band];

  const latest = entries[0];
  const senior = age.born && age.months >= 96;

  const setScore = (i: number, v: number) =>
    setScores((prev) => prev.map((s, idx) => (idx === i ? v : s)));

  const save = async () => {
    setSaving(true);
    try {
      await addEntry.mutateAsync({
        trackerId: "qol",
        date: localISO(new Date()),
        value: String(total),
        note: encodeQolNote(scores),
      });
      toast.success(`Check-in saved — ${total}/${QOL_MAX}, ${bandInfo.label.toLowerCase()}`);
      setOpen(false);
    } catch {
      /* useAddTrackerEntry already toasts on error */
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="px-4 mt-7 scroll-mt-20" id="qol">
      <div className="flex items-baseline justify-between px-1 mb-2.5">
        <Eyebrow>Quality of life</Eyebrow>
        {entries.length > 0 && (
          <Link href="/trackers/qol" className="text-[11px] font-body font-extrabold text-[#B4512E]">
            Trend →
          </Link>
        )}
      </div>

      <div className="keepsake-card p-5">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-10 h-10 rounded-full bg-[#B4512E]/10 flex items-center justify-center">
            <HeartPulse size={18} className="text-[#B4512E]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body font-bold text-[14px] leading-snug text-[#22364D]">
              The HHHHHMM check-in
            </p>
            <p className="text-[11.5px] font-body text-[#5A6B7E] leading-relaxed mt-0.5">
              {senior
                ? "Five quiet minutes a month: seven questions that keep love honest with observation."
                : "Built for his senior years — but worth starting early. Monthly scores build the baseline that makes real change unmissable later."}
            </p>
            {latest && (
              <p className="text-[10.5px] font-body text-muted-foreground mt-1.5">
                Last check-in {formatDate(latest.date)} —{" "}
                <span
                  className="font-extrabold"
                  style={{ color: BAND_COLORS[qolBand(latest.value ?? 0)] }}
                >
                  {latest.value ?? "?"}/{QOL_MAX}
                </span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            // On COLLAPSE, snap back to the section header so the viewport
            // isn't left stranded when the tall form disappears.
            if (open) {
              requestAnimationFrame(() => {
                document.getElementById("qol")?.scrollIntoView({ behavior: "auto", block: "start" });
              });
            }
            setOpen((o) => !o);
          }}
          className="btn-ink mt-4 inline-flex items-center gap-1.5 min-h-[44px]"
          aria-expanded={open}
        >
          {open ? (
            <>
              Close <ChevronUp size={15} />
            </>
          ) : (
            <>
              Start a check-in <ChevronDown size={15} />
            </>
          )}
        </button>

        {open && (
          <div className="mt-5 border-t border-dashed border-[#E5DAC8] pt-4">
            <div className="space-y-4">
              {QOL_DIMENSIONS.map((d, i) => (
                <div key={d.key}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[12.5px] font-body font-bold text-[#22364D]">{d.label}</p>
                    <p className="font-display font-bold text-[1.1rem] leading-none text-[#B4512E]">
                      {scores[i]}
                      <span className="text-[10px] font-body font-extrabold text-muted-foreground">
                        /5
                      </span>
                    </p>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={scores[i]}
                    onChange={(e) => setScore(i, Number(e.target.value))}
                    aria-label={`${d.label} score`}
                    className="w-full h-[44px] accent-[#B4512E]"
                  />
                  <div className="flex justify-between gap-3 -mt-1.5">
                    <span className="text-[9.5px] font-body text-muted-foreground leading-snug max-w-[45%]">
                      0 · {d.low}
                    </span>
                    <span className="text-[9.5px] font-body text-muted-foreground leading-snug max-w-[45%] text-right">
                      5 · {d.high}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live total + band */}
            <div
              className="mt-4 rounded-xl px-4 py-3 border"
              style={{ borderColor: bandColor, background: `${bandColor}14` }}
            >
              <div className="flex items-center gap-3">
                <p className="font-display font-bold text-[1.9rem] leading-none" style={{ color: bandColor }}>
                  {total}
                  <span className="text-[12px] font-body font-extrabold text-muted-foreground">
                    /{QOL_MAX}
                  </span>
                </p>
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-body font-extrabold uppercase tracking-[0.14em]"
                    style={{ color: bandColor }}
                  >
                    {bandInfo.label}
                  </p>
                  <p className="text-[11px] font-body text-[#33475C] leading-snug mt-0.5">
                    {bandInfo.text}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-2.5 text-[9.5px] font-body text-muted-foreground leading-relaxed">
              Above 28 comfortable · 21–28 watch closely · below 21 talk to the vet. Score honestly,
              not hopefully — the trend matters more than any single month.
            </p>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className={cn(
                "btn-ink mt-3.5 w-full justify-center min-h-[44px]",
                saving && "opacity-60 pointer-events-none",
              )}
            >
              {saving ? "Saving…" : `Save check-in — ${total}/${QOL_MAX}`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

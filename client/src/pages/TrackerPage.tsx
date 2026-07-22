/*
 * Storybook Picture-Book theme — universal tracker page.
 * Driven by TrackerMeta: add-entry form (date/time/value/option/note),
 * optional recharts line chart, newest-first entry list with delete, tips.
 */
import { useMemo, useState } from "react";
import { useParams } from "wouter";
import { PageShell, PageHeader, PawDivider } from "@/components/AppShell";
import { getTracker, useTrackerEntries, type TrackerEntry } from "@/lib/trackers";
import { todayISO, nowHM, friendlyDate } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, Trash2, PawPrint, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid,
} from "recharts";
import NotFound from "@/pages/NotFound";

export default function TrackerPage() {
  const { id } = useParams<{ id: string }>();
  const meta = getTracker(id);
  const [entries, setEntries] = useTrackerEntries(id);

  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowHM());
  const [value, setValue] = useState<string>("");
  const [option, setOption] = useState<string>(meta?.fields.options?.choices[0] ?? "");
  const [note, setNote] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const chartData = useMemo(() => {
    if (!meta?.chart) return [];
    return [...entries]
      .filter((e) => typeof e.value === "number")
      .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
      .map((e) => ({ label: e.date.slice(5).split("-").reverse().join("/"), value: e.value }));
  }, [entries, meta]);

  if (!meta) return <NotFound />;
  const f = meta.fields;

  const addEntry = () => {
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
    const entry: TrackerEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      ...(f.time ? { time } : {}),
      ...(f.value && value !== "" ? { value: Number(value) } : {}),
      ...(f.options ? { option } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    };
    setEntries((prev) => [entry, ...prev].sort((a, b) => (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? ""))));
    setValue("");
    setNote("");
    setFormOpen(false);
    toast.success("Logged! 🐾");
  };

  const remove = (eid: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== eid));
    toast("Entry deleted");
  };

  return (
    <PageShell>
      <PageHeader title={meta.title} subtitle="Saved on this device" back="/trackers" emoji={meta.emoji} />

      <div className="px-5 pt-4">
        <p className="text-[13px] text-muted-foreground leading-relaxed">{meta.intro}</p>

        {/* add button / form */}
        {!formOpen ? (
          <Button
            className="w-full mt-4 rounded-2xl h-12 font-extrabold press-scale"
            onClick={() => {
              setDate(todayISO());
              setTime(nowHM());
              setFormOpen(true);
            }}
          >
            <Plus size={17} className="mr-1" /> Add entry
          </Button>
        ) : (
          <div className="sticker-card p-4 mt-4">
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Date</span>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 rounded-xl" />
              </label>
              {f.time && (
                <label className="block">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Time</span>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 rounded-xl" />
                </label>
              )}
              {f.value && (
                <label className="block">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
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
                    className="mt-1 rounded-xl"
                    placeholder={`${f.value.min}–${f.value.max}`}
                  />
                </label>
              )}
            </div>

            {f.options && (
              <div className="mt-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  {f.options.label}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {f.options.choices.map((c) => (
                    <button
                      key={c}
                      onClick={() => setOption(c)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold border press-scale transition-colors",
                        option === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground/70",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {f.note && (
              <label className="block mt-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  Note (optional)
                </span>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 rounded-xl min-h-[60px]"
                  placeholder="Anything worth remembering…"
                />
              </label>
            )}

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 rounded-xl press-scale bg-card" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-xl font-extrabold press-scale" onClick={addEntry}>
                Save
              </Button>
            </div>
          </div>
        )}

        {/* chart */}
        {meta.chart && chartData.length >= 2 && (
          <div className="sticker-card p-4 mt-4">
            <p className="font-display font-bold text-[15px] mb-2">
              {meta.chart.label} over time
            </p>
            <div className="h-44 -ml-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="oklch(0.88 0.02 75)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: "Nunito" }} stroke="oklch(0.55 0.03 60)" />
                  <YAxis tick={{ fontSize: 10, fontFamily: "Nunito" }} stroke="oklch(0.55 0.03 60)" width={34} />
                  <ChartTooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid oklch(0.88 0.02 75)",
                      fontSize: 12,
                      fontFamily: "Nunito",
                    }}
                    formatter={(v: number | string) => [`${v} ${meta.chart!.unit}`, meta.chart!.label]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.52 0.115 45)"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "oklch(0.52 0.115 45)" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* entries */}
        <h2 className="font-display font-bold text-lg mt-6 mb-2.5">
          Log{" "}
          <span className="text-sm font-sans font-bold text-muted-foreground">
            ({entries.length} {entries.length === 1 ? "entry" : "entries"})
          </span>
        </h2>
        {entries.length === 0 ? (
          <div className="sticker-card p-6 text-center">
            <PawPrint size={26} className="mx-auto text-primary/40" />
            <p className="text-sm text-muted-foreground mt-2">Nothing logged yet — tap "Add entry" to start.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li key={e.id} className="sticker-card px-4 py-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
                    {friendlyDate(e.date)}
                    {e.time ? ` · ${e.time}` : ""}
                  </p>
                  <p className="font-bold text-[14px] mt-0.5">
                    {e.option ?? ""}
                    {e.option && typeof e.value === "number" ? " — " : ""}
                    {typeof e.value === "number" ? `${e.value} ${meta.fields.value?.unit ?? ""}` : ""}
                  </p>
                  {e.note && <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{e.note}</p>}
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="shrink-0 w-8 h-8 rounded-full text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center press-scale transition-colors"
                  aria-label="Delete entry"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <PawDivider />

        {/* tips */}
        <div className="pb-4">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary mb-2.5">
            <Lightbulb size={13} /> Good to know
          </p>
          <ul className="space-y-2">
            {meta.tips.map((t, i) => (
              <li key={i} className="text-[13px] text-muted-foreground leading-relaxed flex gap-2">
                <PawPrint size={13} className="text-primary/50 shrink-0 mt-1" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}

/*
 * Coat Length Check — same-pose photo series after every bath + basic trim.
 * Compare any two checks side-by-side (defaults to latest vs previous) and
 * scrub the timeline strip to watch coat length drift over time.
 * Photos live in the shared family album (category = "coat-check"), so they
 * also appear in Memories with a coat-check chip.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell, PageHeader, Eyebrow } from "@/components/AppShell";
import { trpc } from "@/lib/trpc";
import { compressImage } from "@/components/PhotoJournal";
import {
  coatCheckSeries,
  defaultComparePair,
  sinceLastCheckLabel,
  type CoatCheckEntry,
} from "@/lib/coatCheck";
import { WOBBLES, formatDate } from "@/content/wobbles";
import { todayISO } from "@/lib/dates";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, Plus, Ruler, Scissors } from "lucide-react";
import { toast } from "sonner";

const INK = "#22364D";
const SIENNA = "#C66A3D";
const RUST = "#B4512E";

/** One side of the comparison card */
function CompareSide({
  entry,
  label,
  onCycle,
  canCycle,
}: {
  entry: CoatCheckEntry & { url: string };
  label: string;
  onCycle: () => void;
  canCycle: boolean;
}) {
  return (
    <button
      onClick={canCycle ? onCycle : undefined}
      className="min-w-0 flex-1 text-left press-scale"
      aria-label={canCycle ? `Change the ${label.toLowerCase()} photo` : undefined}
    >
      <div className="relative">
        <img
          src={entry.url}
          alt={`Coat check on ${formatDate(entry.date)}`}
          className="w-full aspect-[3/4] object-cover rounded-xl bg-[#22364D]/5"
        />
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[8.5px] font-body font-extrabold uppercase tracking-[0.12em]"
          style={{ backgroundColor: "#FFFDF8E6", color: RUST }}
        >
          {label}
        </span>
      </div>
      <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.1em] mt-1.5" style={{ color: SIENNA }}>
        {formatDate(entry.date)}
      </p>
      <p className="text-[11px] font-body font-bold" style={{ color: INK }}>
        {entry.ageLabel} old
      </p>
    </button>
  );
}

export default function CoatCheck() {
  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.photos.list.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const series = useMemo(
    () => coatCheckSeries(photos ?? [], WOBBLES.dob),
    [photos],
  );

  // Comparison selection — ids so refetches can't shift the pair
  const [leftId, setLeftId] = useState<number | null>(null);
  const [rightId, setRightId] = useState<number | null>(null);
  useEffect(() => {
    // (Re)initialise defaults whenever the series changes and current picks vanish
    const pair = defaultComparePair(series);
    if (!pair) return;
    if (leftId == null || !series.some((s) => s.id === leftId)) setLeftId(pair.left.id);
    if (rightId == null || !series.some((s) => s.id === rightId)) setRightId(pair.right.id);
  }, [series, leftId, rightId]);

  const left = series.find((s) => s.id === leftId) ?? null;
  const right = series.find((s) => s.id === rightId) ?? null;
  const gapDays = left && right ? Math.abs(
    Math.round((new Date(right.date).getTime() - new Date(left.date).getTime()) / 86_400_000),
  ) : null;

  /** Cycle a side backwards through the series (older photos) */
  const cycle = (side: "left" | "right") => {
    const currentId = side === "left" ? leftId : rightId;
    const idx = series.findIndex((s) => s.id === currentId);
    if (idx < 0) return;
    const next = series[(idx - 1 + series.length) % series.length];
    if (side === "left") setLeftId(next.id);
    else setRightId(next.id);
  };

  // ---- capture flow (reuses album upload with category tag) ----
  const uploadMutation = trpc.photos.upload.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      toast.success("📏 Coat check saved");
    },
    onError: (e) =>
      toast.error(e.message.includes("too large") ? "That photo is too large" : "Upload failed — try again"),
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(todayISO());
  const [phase, setPhase] = useState<"idle" | "compressing" | "uploading">("idle");
  const uploading = phase !== "idle";

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && f.type !== "") {
      toast.error("Please choose an image");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      toast.error("That photo is very large — try a smaller one (under ~25MB)");
      return;
    }
    setPending({ file: f, preview: URL.createObjectURL(f) });
    setCaption("");
    setDate(todayISO());
  };

  const doUpload = async () => {
    if (!pending || uploading) return;
    setPhase("compressing");
    try {
      const { dataBase64, mimeType } = await compressImage(pending.file);
      setPhase("uploading");
      const res = await uploadMutation.mutateAsync({
        fileName: pending.file.name || `coat-check-${Date.now()}.jpg`,
        mimeType,
        dataBase64,
        caption: caption.trim() || undefined,
        date,
        category: "coat-check",
      });
      URL.revokeObjectURL(pending.preview);
      setPending(null);
      // Newest photo becomes the right side of the comparison
      setRightId(res.id);
    } catch {
      /* toast handled in onError */
    } finally {
      setPhase("idle");
    }
  };

  const sinceLabel = sinceLastCheckLabel(series, todayISO());

  return (
    <PageShell>
      <PageHeader
        title="Coat length check"
        subtitle={sinceLabel ?? "Same pose, every bath + trim"}
        back="/memories"
        emoji="📏"
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="px-5 pt-4 pb-8">
        {isLoading ? (
          <div className="keepsake-card p-6 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin" style={{ color: SIENNA }} />
          </div>
        ) : series.length === 0 ? (
          /* ---- empty state: the same-pose ritual ---- */
          <div className="keepsake-card relative p-5 text-center">
            <span className="tape" aria-hidden />
            <Ruler size={26} className="mx-auto" style={{ color: `${SIENNA}99` }} />
            <p className="font-display font-semibold text-[1.3rem] mt-2" style={{ color: INK }}>
              Start the coat diary
            </p>
            <p className="text-[13px] font-body text-muted-foreground leading-relaxed mt-1.5 max-w-[290px] mx-auto">
              After every fortnightly bath + basic trim, snap Wobbles in the{" "}
              <strong style={{ color: INK }}>same spot, same angle, same pose</strong>{" "}
              — standing side-on works best. Over time the series shows exactly
              how his coat length drifts between trims, so you know when the
              blade length needs adjusting.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-ink mt-4 inline-flex items-center gap-1.5 text-[13px]"
            >
              <Camera size={15} /> Take the first coat check
            </button>
          </div>
        ) : (
          <>
            {/* ---- side-by-side comparison ---- */}
            <Eyebrow>Compare</Eyebrow>
            <div className="keepsake-card p-3.5 mt-2.5">
              <div className="flex gap-3">
                {left && (
                  <CompareSide
                    entry={left}
                    label="Before"
                    onCycle={() => cycle("left")}
                    canCycle={series.length > 2}
                  />
                )}
                {right && (
                  <CompareSide
                    entry={right}
                    label="Latest"
                    onCycle={() => cycle("right")}
                    canCycle={series.length > 2}
                  />
                )}
              </div>
              {gapDays != null && gapDays > 0 && (
                <p className="text-[11px] font-body font-bold text-center mt-3 pt-2.5 border-t border-dashed border-[#E5DAC8]" style={{ color: INK }}>
                  {gapDays} days between these two photos
                </p>
              )}
              {series.length > 2 && (
                <p className="text-[10px] font-body text-muted-foreground text-center mt-1.5">
                  Tap either photo to cycle through older checks
                </p>
              )}
            </div>

            {/* ---- timeline strip ---- */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <Eyebrow>The series</Eyebrow>
                <span className="text-[10px] font-body font-bold text-muted-foreground">
                  {series.length} check{series.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5">
                {series.map((p) => {
                  const isPicked = p.id === leftId || p.id === rightId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setRightId(p.id)}
                      className="shrink-0 w-[104px] text-left press-scale"
                      aria-label={`Show ${formatDate(p.date)} in the comparison`}
                    >
                      <img
                        src={p.url}
                        alt={`Coat check ${formatDate(p.date)}`}
                        loading="lazy"
                        className="w-full aspect-[3/4] object-cover rounded-xl bg-[#22364D]/5"
                        style={isPicked ? { outline: `2.5px solid ${RUST}`, outlineOffset: 1 } : undefined}
                      />
                      <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.1em] mt-1.5" style={{ color: SIENNA }}>
                        {formatDate(p.date)}
                      </p>
                      <p className="text-[10px] font-body font-bold leading-tight" style={{ color: INK }}>
                        {p.ageLabel}
                        {p.daysSincePrev != null && (
                          <span className="text-muted-foreground font-medium"> · +{p.daysSincePrev}d</span>
                        )}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] font-body text-muted-foreground mt-1">
                Tap a photo to place it on the “Latest” side of the comparison.
              </p>
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              className="mt-5 w-full h-12 rounded-2xl border-2 border-dashed border-[#C66A3D]/40 text-[#B4512E] font-body font-extrabold text-[13px] flex items-center justify-center gap-1.5 press-scale"
            >
              <Plus size={16} /> Add today's coat check
            </button>
          </>
        )}

        {/* ritual reminder card */}
        <div className="sticker-card px-4 py-3.5 mt-5 flex items-start gap-3">
          <Scissors size={16} className="shrink-0 mt-0.5" style={{ color: SIENNA }} />
          <p className="text-[12px] font-body leading-relaxed" style={{ color: INK }}>
            <strong>The ritual:</strong> every fortnightly bath + basic trim ends
            with a coat check photo — same spot, same angle, treat after. If the
            coat looks longer photo-to-photo, drop the comb length a notch at the
            next trim.
          </p>
        </div>
      </div>

      {/* upload dialog */}
      <Dialog open={pending != null} onOpenChange={(o) => !o && !uploading && setPending(null)}>
        <DialogContent className="bg-[#FFFDF8] max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-[1.4rem]" style={{ color: INK }}>
              Save coat check
            </DialogTitle>
          </DialogHeader>
          {pending && (
            <div>
              <img
                src={pending.preview}
                alt="Preview"
                className="w-full max-h-[240px] object-contain rounded-xl bg-[#22364D]/5"
              />
              <label className="block mt-3">
                <span className="text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground">
                  Note (optional)
                </span>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={500}
                  placeholder="13mm comb all over, tidy face…"
                  className="mt-1 rounded-xl bg-background"
                />
              </label>
              <label className="block mt-2.5">
                <span className="text-[10px] font-body font-extrabold uppercase tracking-wide text-muted-foreground">
                  Date
                </span>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 rounded-xl bg-background"
                />
              </label>
              <button
                onClick={doUpload}
                disabled={uploading}
                className="btn-ink w-full h-12 rounded-2xl mt-4 font-body font-extrabold text-[14px] press-scale flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {phase === "compressing" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Compressing…
                  </>
                ) : phase === "uploading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Uploading…
                  </>
                ) : (
                  "Save coat check"
                )}
              </button>
              <p className="text-[10px] font-body text-muted-foreground text-center mt-2">
                Coat checks also appear in the family album on Memories.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

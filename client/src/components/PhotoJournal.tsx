/*
 * Keepsake Field Guide — PhotoJournal (Memories page).
 * Family-shared photo album: pick a photo → client-side compress → upload
 * to the shared server (S3) with an optional caption; shows a keepsake
 * polaroid grid with dates, captions and who added each photo.
 */
import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Eyebrow } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { todayISO } from "@/lib/dates";
import { formatDate } from "@/content/wobbles";
import { Camera, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const INK = "#22364D";
const SIENNA = "#C66A3D";

/** Downscale + JPEG-compress an image file, return base64 (no data: prefix). */
async function compressImage(file: File, maxEdge = 1600, quality = 0.82): Promise<{
  dataBase64: string;
  mimeType: string;
}> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    // Fallback: send original bytes if the browser can't decode (e.g. HEIC)
    const buf = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < buf.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + CHUNK)));
    }
    return { dataBase64: btoa(bin), mimeType: file.type || "image/jpeg" };
  }
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { dataBase64: dataUrl.split(",")[1], mimeType: "image/jpeg" };
}

export default function PhotoJournal() {
  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.photos.list.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const uploadMutation = trpc.photos.upload.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      toast.success("📸 Added to the family album");
    },
    onError: (e) =>
      toast.error(e.message.includes("too large") ? "That photo is too large" : "Upload failed — try again"),
  });
  const removeMutation = trpc.photos.remove.useMutation({
    onMutate: async ({ id }) => {
      await utils.photos.list.cancel();
      const previous = utils.photos.list.getData();
      utils.photos.list.setData(undefined, (old) => (old ?? []).filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_e, _i, ctx) => {
      if (ctx?.previous) utils.photos.list.setData(undefined, ctx.previous);
      toast.error("Couldn't delete — try again");
    },
    onSettled: () => utils.photos.list.invalidate(),
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(todayISO());
  const [phase, setPhase] = useState<"idle" | "compressing" | "uploading">("idle");
  const uploading = phase !== "idle";
  const [viewer, setViewer] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && f.type !== "") {
      toast.error("Please choose an image");
      return;
    }
    // Photos are downscaled before upload, but truly enormous originals
    // (>25MB) can stall older phones during decode — nudge early.
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
      await uploadMutation.mutateAsync({
        fileName: pending.file.name || `photo-${Date.now()}.jpg`,
        mimeType,
        dataBase64,
        caption: caption.trim() || undefined,
        date,
      });
      URL.revokeObjectURL(pending.preview);
      setPending(null);
    } catch {
      /* toast handled in onError */
    } finally {
      setPhase("idle");
    }
  };

  const viewerPhoto = useMemo(
    () => (viewer != null ? (photos ?? []).find((p) => p.id === viewer) : undefined),
    [viewer, photos],
  );

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <Eyebrow>The photo journal</Eyebrow>
        <span className="text-[10px] font-body font-bold text-muted-foreground">
          {(photos ?? []).length > 0 ? `${photos!.length} photo${photos!.length === 1 ? "" : "s"}` : ""}
        </span>
      </div>

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

      {/* empty state / add card */}
      {isLoading ? (
        <div className="keepsake-card mt-3 p-6 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin" style={{ color: SIENNA }} />
        </div>
      ) : (photos ?? []).length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="keepsake-card relative mt-3 p-5 text-center w-full press-scale"
        >
          <span className="tape" aria-hidden />
          <Camera size={26} className="mx-auto" style={{ color: `${SIENNA}99` }} />
          <p className="font-display font-semibold text-[1.25rem] mt-2" style={{ color: INK }}>
            Start the album
          </p>
          <p className="text-[13px] font-body text-muted-foreground leading-relaxed mt-1.5 max-w-[280px] mx-auto">
            Add the first photo — first nap, first walk, first questionable
            haircut. Everyone in the family sees the same album.
          </p>
          <span className="btn-ink mt-3.5 inline-flex items-center gap-1.5 text-[13px]">
            <Plus size={15} /> Add a photo
          </span>
        </button>
      ) : (
        <>
          {/* polaroid grid */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(photos ?? []).map((p, i) => (
              <button
                key={p.id}
                onClick={() => setViewer(p.id)}
                className="keepsake-card p-2 pb-3 text-left press-scale"
                style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1.2}deg)` }}
              >
                <img
                  src={p.url}
                  alt={p.caption ?? "Wobbles photo"}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-[6px] bg-[#22364D]/5"
                />
                <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.1em] mt-2 px-1" style={{ color: SIENNA }}>
                  {formatDate(p.date)}
                </p>
                {p.caption && (
                  <p className="text-[12px] font-body font-bold leading-snug px-1 mt-0.5 line-clamp-2" style={{ color: INK }}>
                    {p.caption}
                  </p>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 w-full h-11 rounded-2xl border-2 border-dashed border-[#C66A3D]/40 text-[#B4512E] font-body font-extrabold text-[13px] flex items-center justify-center gap-1.5 press-scale"
          >
            <Plus size={16} /> Add a photo
          </button>
        </>
      )}

      {/* upload dialog */}
      <Dialog open={pending != null} onOpenChange={(o) => !o && !uploading && setPending(null)}>
        <DialogContent className="bg-[#FFFDF8] max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-[1.4rem]" style={{ color: INK }}>
              Add to the album
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
                  Caption (optional)
                </span>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={500}
                  placeholder="First nap in the new bed…"
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
                  "Save to album"
                )}
              </button>
              <p className="text-[10px] font-body text-muted-foreground text-center mt-2">
                Photos are resized on your phone before upload, so they save data and load fast.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* viewer dialog */}
      <Dialog
        open={viewerPhoto != null}
        onOpenChange={(o) => {
          if (!o) {
            setViewer(null);
            setConfirmDelete(false);
          }
        }}
      >
        <DialogContent className="bg-[#FFFDF8] max-w-[380px] rounded-3xl p-3">
          {viewerPhoto && (
            <div>
              <img
                src={viewerPhoto.url}
                alt={viewerPhoto.caption ?? "Wobbles photo"}
                className="w-full max-h-[60vh] object-contain rounded-xl bg-[#22364D]/5"
              />
              <div className="px-2 pt-3 pb-1">
                <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.1em]" style={{ color: SIENNA }}>
                  {formatDate(viewerPhoto.date)}
                  {viewerPhoto.createdByName ? ` · added by ${viewerPhoto.createdByName}` : ""}
                </p>
                {viewerPhoto.caption && (
                  <p className="font-body font-bold text-[14px] leading-snug mt-1" style={{ color: INK }}>
                    {viewerPhoto.caption}
                  </p>
                )}
                <div className="flex justify-end mt-2">
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-body font-bold" style={{ color: INK }}>
                        Remove from the family album?
                      </span>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="min-h-[44px] flex items-center gap-1 text-[12px] font-body font-extrabold px-3 rounded-xl bg-[#22364D]/8 press-scale"
                        style={{ color: INK }}
                      >
                        <X size={14} /> Keep
                      </button>
                      <button
                        onClick={() => {
                          const id = viewerPhoto.id;
                          setConfirmDelete(false);
                          setViewer(null);
                          removeMutation.mutate({ id });
                        }}
                        className="min-h-[44px] flex items-center gap-1.5 text-[12px] font-body font-extrabold text-[#FFFDF8] px-3 rounded-xl bg-[#B4512E] press-scale"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="min-h-[44px] flex items-center gap-1.5 text-[12px] font-body font-extrabold text-[#B4512E] px-3 rounded-xl bg-[#C66A3D]/10 press-scale"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

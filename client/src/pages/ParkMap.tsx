/*
 * Wobbles' Map — interactive map of parks around Woodlands & Admiralty.
 * Custom emoji pins on Google Maps; tap a pin (or list chip) to open a
 * keepsake bottom sheet with visit log, tagged photos, and journal entries.
 * All data is family-shared: visits/journal live in sharedState ("placeLog"),
 * photos are rows in the photos table tagged with placeId.
 */
import { useMemo, useRef, useState } from "react";
import { MapView } from "@/components/Map";
import { PageShell, PageHeader, Eyebrow } from "@/components/AppShell";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useSharedState } from "@/hooks/useSyncedData";
import { useAuth } from "@/_core/hooks/useAuth";
import { compressImage } from "@/components/PhotoJournal";
import PhotoLightbox from "@/components/PhotoLightbox";
import { PLACES, MAP_CENTER, MAP_ZOOM, getPlace, type Place } from "@/content/places";
import {
  normalizePlaceLog, entriesForPlace, visitCount, lastVisit, hasVisited,
  makeEntry, type PlaceLogMap,
} from "@/lib/placeLog";
import { todayISO } from "@/lib/dates";
import { formatDate } from "@/content/wobbles";
import { Camera, Loader2, MapPin, NotebookPen, PawPrint, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const INK = "#22364D";
const SIENNA = "#C66A3D";
const MOSS = "#7B8C6A";

/* ------------------------------------------------------------------ */
/* Pin factory — emoji badge, moss ring once visited                    */
/* ------------------------------------------------------------------ */

function makePinElement(place: Place, visited: boolean): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
  const ring = visited ? MOSS : "#E5DAC8";
  el.innerHTML = `
    <div style="
      width:40px;height:40px;border-radius:9999px;
      background:#FFFDF8;border:2.5px solid ${ring};
      box-shadow:0 3px 10px rgba(34,54,77,0.28);
      display:flex;align-items:center;justify-content:center;
      font-size:19px;line-height:1;">${place.emoji}</div>
    <div style="
      margin-top:3px;padding:2px 7px;border-radius:9999px;
      background:${place.isHome ? INK : "#FFFDF8"};color:${place.isHome ? "#F8F3EB" : INK};
      border:1px solid #E5DAC8;font:800 9px/1.2 'Nunito',sans-serif;
      letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;
      box-shadow:0 2px 6px rgba(34,54,77,0.18);">
      ${place.name.replace("Home — ", "")}${visited ? " ✓" : ""}</div>`;
  return el;
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function ParkMap() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  /* ---- shared place log (visits + journal) ---- */
  const [rawLog, setLog, { isLoading: logLoading }] = useSharedState<Record<string, unknown>>(
    "placeLog",
    {},
  );
  const log: PlaceLogMap = useMemo(() => normalizePlaceLog(rawLog), [rawLog]);

  /* ---- photos (place-tagged subset) ---- */
  const { data: photos } = trpc.photos.list.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  /* ---- map + markers ---- */
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  // Keep latest log visible to the marker-refresh effect without re-creating the map
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? getPlace(selectedId) : undefined;

  const buildMarkers = (map: google.maps.Map) => {
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current.clear();
    for (const p of PLACES) {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: p.lat, lng: p.lng },
        content: makePinElement(p, hasVisited(log, p.id)),
        title: p.name,
        zIndex: p.isHome ? 10 : 5,
      });
      marker.addListener("click", () => setSelectedId(p.id));
      markersRef.current.set(p.id, marker);
    }
  };

  // Refresh pin visited-rings when the log changes (map already live)
  const logRef = useRef(log);
  if (logRef.current !== log && mapRef.current) {
    logRef.current = log;
    for (const p of PLACES) {
      const m = markersRef.current.get(p.id);
      if (m) m.content = makePinElement(p, hasVisited(log, p.id));
    }
  }

  const focusPlace = (p: Place) => {
    setSelectedId(p.id);
    mapRef.current?.panTo({ lat: p.lat, lng: p.lng });
  };

  const visitedCount = PLACES.filter((p) => !p.isHome && hasVisited(log, p.id)).length;

  return (
    <PageShell className="pb-28">
      <PageHeader
        title="Wobbles' Map"
        subtitle="Parks & adventures around Woodlands"
        emoji="🗺️"
      />

      {/* ===== Map ===== */}
      <section className="px-4 mt-3">
        <div className="keepsake-card relative p-1.5 overflow-hidden">
          <MapView
            className="h-[340px] rounded-[14px] overflow-hidden"
            initialCenter={MAP_CENTER}
            initialZoom={MAP_ZOOM}
            onMapReady={(map) => {
              mapRef.current = map;
              map.setOptions({
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                clickableIcons: false,
              });
              buildMarkers(map);
            }}
          />
          <span className="absolute top-3 right-3 z-10 bg-[#FFFDF8]/92 backdrop-blur px-2.5 py-1.5 rounded-full text-[10px] font-body font-extrabold text-[#22364D] border border-[#E5DAC8] shadow-sm">
            <PawPrint size={10} className="inline -mt-0.5 mr-1" style={{ color: SIENNA }} />
            {visitedCount}/{PLACES.length - 1} explored
          </span>
        </div>
        <p className="px-1 mt-2 text-[11px] font-body text-muted-foreground leading-relaxed">
          Tap a pin to see visits, photos and journal entries for that spot.
        </p>
      </section>

      {/* ===== Place list ===== */}
      <section className="px-5 mt-5">
        <Eyebrow className="mb-2.5">The neighbourhood spots</Eyebrow>
        <div className="space-y-2.5">
          {PLACES.map((p) => {
            const visited = hasVisited(log, p.id);
            const count = visitCount(log, p.id);
            const last = lastVisit(log, p.id);
            const photoCount = (photos ?? []).filter((ph) => ph.placeId === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => focusPlace(p)}
                className="sticker-card w-full px-4 py-3 flex items-center gap-3 text-left press-scale"
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[19px] shrink-0 border-2"
                  style={{
                    borderColor: visited ? MOSS : "#E5DAC8",
                    background: "#FFFDF8",
                  }}
                >
                  {p.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body font-bold text-[13.5px] leading-snug" style={{ color: INK }}>
                    {p.name}
                  </span>
                  <span className="block text-[11px] font-body text-muted-foreground truncate">
                    {p.isHome
                      ? p.travel
                      : visited
                        ? `${count} visit${count === 1 ? "" : "s"}${last ? ` · last ${formatDate(last)}` : ""}${photoCount ? ` · ${photoCount} 📷` : ""}`
                        : `Not visited yet · ${p.travel}`}
                  </span>
                </span>
                {visited && !p.isHome && (
                  <span
                    className="shrink-0 text-[9px] font-body font-extrabold uppercase tracking-[0.1em] px-2 py-1 rounded-full"
                    style={{ background: `${MOSS}22`, color: "#5D7050" }}
                  >
                    Been here
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== Place sheet ===== */}
      <PlaceSheet
        place={selected}
        log={log}
        setLog={setLog}
        logLoading={logLoading}
        photos={(photos ?? []).filter((ph) => ph.placeId === selectedId)}
        userName={user?.name ?? undefined}
        onClose={() => setSelectedId(null)}
        onPhotoUploaded={() => utils.photos.list.invalidate()}
      />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Place bottom sheet                                                   */
/* ------------------------------------------------------------------ */

interface PhotoRowLite {
  id: number;
  url: string;
  caption: string | null;
  date: string;
  placeId: string | null;
  createdByName: string | null;
}

function PlaceSheet({
  place,
  log,
  setLog,
  logLoading,
  photos,
  userName,
  onClose,
  onPhotoUploaded,
}: {
  place: Place | undefined;
  log: PlaceLogMap;
  setLog: (next: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => void;
  logLoading: boolean;
  photos: PhotoRowLite[];
  userName?: string;
  onClose: () => void;
  onPhotoUploaded: () => void;
}) {
  const [journalText, setJournalText] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "compressing" | "uploading">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const uploadMutation = trpc.photos.upload.useMutation({
    onSuccess: () => {
      onPhotoUploaded();
      toast.success("📸 Photo tagged to this spot");
    },
    onError: () => toast.error("Upload failed — try again"),
  });
  const removePhoto = trpc.photos.remove.useMutation({
    onSuccess: onPhotoUploaded,
    onError: () => toast.error("Couldn't delete — try again"),
  });

  const entries = place ? entriesForPlace(log, place.id) : [];
  const visits = entries.filter((e) => e.kind === "visit");
  const journals = entries.filter((e) => e.kind === "journal");
  const visitedToday = visits.some((v) => v.date === todayISO());

  const logVisit = () => {
    if (!place) return;
    const entry = makeEntry({ placeId: place.id, kind: "visit", date: todayISO(), by: userName });
    setLog((prev) => ({ ...prev, [entry.id]: entry }));
    toast.success(`🐾 Wobbles was here — ${place.name}`);
  };

  const addJournal = () => {
    if (!place || !journalText.trim()) return;
    const entry = makeEntry({
      placeId: place.id,
      kind: "journal",
      date: todayISO(),
      text: journalText,
      by: userName,
    });
    setLog((prev) => ({ ...prev, [entry.id]: entry }));
    setJournalText("");
    setJournalOpen(false);
    toast.success("📓 Journal entry saved");
  };

  const deleteEntry = (id: string) => {
    setLog((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const pickPhoto = async (f: File | undefined) => {
    if (!f || !place || phase !== "idle") return;
    if (!f.type.startsWith("image/") && f.type !== "") {
      toast.error("Please choose an image");
      return;
    }
    setPhase("compressing");
    try {
      const { dataBase64, mimeType } = await compressImage(f);
      setPhase("uploading");
      await uploadMutation.mutateAsync({
        fileName: f.name || `photo-${Date.now()}.jpg`,
        mimeType,
        dataBase64,
        date: todayISO(),
        placeId: place.id,
        caption: place.isHome ? undefined : place.name,
      });
    } catch {
      /* toast in onError */
    } finally {
      setPhase("idle");
    }
  };

  return (
    <Drawer open={place != null} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-[#FFFDF8]">
        {place && (
          <>
            <DrawerHeader className="pb-1">
              <DrawerTitle className="font-display text-[1.45rem] flex items-center gap-2" style={{ color: INK }}>
                <span className="text-[1.6rem]">{place.emoji}</span>
                <span className="min-w-0 flex-1 text-left leading-tight">{place.name}</span>
              </DrawerTitle>
              <p className="text-left text-[11px] font-body font-bold text-muted-foreground flex items-center gap-1">
                <MapPin size={11} style={{ color: SIENNA }} /> {place.area} · {place.travel}
              </p>
            </DrawerHeader>

            <div className="px-5 pb-8 pt-1 max-h-[70vh] overflow-y-auto">
              <p className="text-[12.5px] font-body leading-relaxed" style={{ color: "#5A6B7E" }}>
                {place.blurb}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {place.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-body font-extrabold uppercase tracking-[0.1em] px-2 py-1 rounded-full border border-[#E5DAC8] bg-[#F8F3EB]"
                    style={{ color: SIENNA }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* ---- visit log ---- */}
              {!place.isHome && (
                <div className="mt-4">
                  <button
                    onClick={logVisit}
                    disabled={logLoading}
                    className="btn-ink w-full h-12 rounded-2xl font-body font-extrabold text-[14px] press-scale flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <PawPrint size={16} />
                    {visitedToday ? "Log another visit today" : "Wobbles was here today"}
                  </button>
                  {visits.length > 0 && (
                    <div className="mt-3">
                      <Eyebrow className="mb-1.5">
                        {visits.length} visit{visits.length === 1 ? "" : "s"}
                      </Eyebrow>
                      <div className="flex flex-wrap gap-1.5">
                        {visits.slice(0, 12).map((v) => (
                          <span
                            key={v.id}
                            className="group inline-flex items-center gap-1 text-[10px] font-body font-bold px-2 py-1 rounded-full border"
                            style={{ borderColor: `${MOSS}66`, background: `${MOSS}14`, color: "#5D7050" }}
                          >
                            🐾 {formatDate(v.date)}
                            {v.by ? ` · ${v.by.split(" ")[0]}` : ""}
                            <button
                              onClick={() => deleteEntry(v.id)}
                              aria-label="Remove this visit"
                              className="opacity-50 hover:opacity-100"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                        {visits.length > 12 && (
                          <span className="text-[10px] font-body font-bold text-muted-foreground px-1 py-1">
                            +{visits.length - 12} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---- photos ---- */}
              <div className="mt-5">
                <div className="flex items-baseline justify-between">
                  <Eyebrow>Photos here</Eyebrow>
                  <span className="text-[10px] font-body font-bold text-muted-foreground">
                    {photos.length > 0 ? `${photos.length} photo${photos.length === 1 ? "" : "s"}` : ""}
                  </span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                {photos.length === 0 ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={phase !== "idle"}
                    className="mt-2 w-full py-4 rounded-2xl border-2 border-dashed border-[#C66A3D]/40 text-[#B4512E] font-body font-extrabold text-[12.5px] flex items-center justify-center gap-1.5 press-scale disabled:opacity-60"
                  >
                    {phase !== "idle" ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        {phase === "compressing" ? "Compressing…" : "Uploading…"}
                      </>
                    ) : (
                      <>
                        <Camera size={15} /> Add the first photo from here
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {photos.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => setViewerIndex(i)}
                          className="keepsake-card p-1 press-scale"
                          style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
                        >
                          <img
                            src={p.url}
                            alt={p.caption ?? place.name}
                            loading="lazy"
                            className="w-full aspect-square object-cover rounded-[5px] bg-[#22364D]/5"
                          />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={phase !== "idle"}
                      className="mt-2 w-full h-10 rounded-xl border-2 border-dashed border-[#C66A3D]/40 text-[#B4512E] font-body font-extrabold text-[12px] flex items-center justify-center gap-1.5 press-scale disabled:opacity-60"
                    >
                      {phase !== "idle" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={14} /> Add a photo
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* ---- journal ---- */}
              <div className="mt-5">
                <div className="flex items-baseline justify-between">
                  <Eyebrow>Journal</Eyebrow>
                  {!journalOpen && (
                    <button
                      onClick={() => setJournalOpen(true)}
                      className="text-[11px] font-body font-extrabold flex items-center gap-1"
                      style={{ color: "#B4512E" }}
                    >
                      <NotebookPen size={12} /> Write an entry
                    </button>
                  )}
                </div>

                {journalOpen && (
                  <div className="mt-2">
                    <Textarea
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder={`First off-leash zoomies at ${place.isHome ? "home" : place.name}…`}
                      className="rounded-xl bg-background text-[13px]"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={addJournal}
                        disabled={!journalText.trim()}
                        className="btn-ink flex-1 h-10 rounded-xl font-body font-extrabold text-[13px] press-scale disabled:opacity-50"
                      >
                        Save entry
                      </button>
                      <button
                        onClick={() => {
                          setJournalOpen(false);
                          setJournalText("");
                        }}
                        className="h-10 px-4 rounded-xl border border-[#E5DAC8] font-body font-bold text-[13px] press-scale"
                        style={{ color: INK }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {journals.length === 0 && !journalOpen ? (
                  <p className="mt-2 text-[11.5px] font-body text-muted-foreground leading-relaxed">
                    No entries yet — capture the little moments from this spot and they'll
                    live here for both of you.
                  </p>
                ) : (
                  <div className="mt-2.5 space-y-2.5">
                    {journals.map((j) => (
                      <div key={j.id} className="sticker-card px-3.5 py-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-body font-extrabold uppercase tracking-[0.1em]" style={{ color: SIENNA }}>
                            {formatDate(j.date)}
                          </span>
                          {j.by && (
                            <span className="text-[10px] font-body font-bold text-muted-foreground">
                              {j.by.split(" ")[0]}
                            </span>
                          )}
                          <button
                            onClick={() => deleteEntry(j.id)}
                            aria-label="Delete this journal entry"
                            className="ml-auto text-muted-foreground/60 hover:text-destructive"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-[12.5px] font-body leading-relaxed mt-1 whitespace-pre-wrap" style={{ color: "#33475C" }}>
                          {j.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* full-screen viewer for this place's photos */}
            <PhotoLightbox
              photos={photos}
              index={viewerIndex}
              onIndexChange={setViewerIndex}
              onClose={() => setViewerIndex(null)}
              onDelete={(id) => {
                setViewerIndex(null);
                removePhoto.mutate({ id });
              }}
            />
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

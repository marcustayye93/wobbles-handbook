/*
 * PhotoLightbox — full-screen album viewer for the Memories page.
 * Swipe left/right (touch) or use arrow keys/buttons to move between
 * photos; swipe down or press Esc / the close button to dismiss.
 * Shows date, who added it, caption and Wobbles' age; keeps the
 * confirm-before-delete flow from the old viewer dialog.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatDate, WOBBLES } from "@/content/wobbles";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";

export interface LightboxPhoto {
  id: number;
  url: string;
  date: string;
  caption?: string | null;
  createdByName?: string | null;
}

interface Props {
  photos: LightboxPhoto[];
  /** index into `photos`, or null when closed */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onDelete: (id: number) => void;
}

function ageAt(iso: string): string {
  const ms = new Date(iso + "T00:00:00").getTime() - new Date(WOBBLES.dob + "T00:00:00").getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 0) return "";
  const weeks = Math.floor(days / 7);
  if (weeks >= 52) return `${Math.floor(weeks / 52)}y ${weeks % 52}w old`;
  return `${weeks}w ${days % 7}d old`;
}

const SWIPE_X = 48; // px horizontal travel to change photo
const SWIPE_Y = 80; // px downward travel to dismiss

export default function PhotoLightbox({ photos, index, onIndexChange, onClose, onDelete }: Props) {
  const open = index != null && index >= 0 && index < photos.length;
  const photo = open ? photos[index!] : undefined;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const prev = useCallback(() => {
    if (index != null && index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);
  const next = useCallback(() => {
    if (index != null && index < photos.length - 1) onIndexChange(index + 1);
  }, [index, photos.length, onIndexChange]);

  // Reset delete confirmation whenever the photo changes or box closes
  useEffect(() => {
    setConfirmDelete(false);
  }, [index]);

  // Keyboard: Esc closes, arrows navigate
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || !photo) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    // dominant axis only, and never drag upwards
    if (Math.abs(dx) > Math.abs(dy)) setDrag({ dx, dy: 0 });
    else setDrag({ dx: 0, dy: Math.max(0, dy) });
  };
  const onTouchEnd = () => {
    if (!touchStart.current || !drag) {
      touchStart.current = null;
      setDrag(null);
      return;
    }
    const { dx, dy } = drag;
    touchStart.current = null;
    setDrag(null);
    if (dy > SWIPE_Y) onClose();
    else if (dx <= -SWIPE_X) next();
    else if (dx >= SWIPE_X) prev();
  };

  const age = ageAt(photo.date);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col"
      style={{
        background: `rgba(15, 24, 36, ${drag && drag.dy > 0 ? Math.max(0.5, 0.96 - drag.dy / 400) : 0.96})`,
        transition: drag ? "none" : "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption ?? `Photo from ${formatDate(photo.date)}`}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-3 pt-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <span className="text-[11px] font-body font-extrabold tracking-[0.12em] uppercase text-[#FFFDF8]/70 px-2">
          {index! + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close photo"
          className="w-11 h-11 rounded-full bg-[#FFFDF8]/10 text-[#FFFDF8] flex items-center justify-center press-scale"
        >
          <X size={20} />
        </button>
      </div>

      {/* photo area (swipe surface) */}
      <div
        className="relative flex-1 flex items-center justify-center px-2 overflow-hidden"
        style={{ touchAction: "none" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.caption ?? "Wobbles photo"}
          draggable={false}
          className="max-w-full max-h-full object-contain rounded-lg select-none lightbox-photo-enter"
          style={{
            transform: drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
            opacity: drag && drag.dy > 0 ? Math.max(0.4, 1 - drag.dy / 300) : undefined,
            transition: drag ? "none" : "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />

        {/* desktop arrows */}
        {index! > 0 && (
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#FFFDF8]/10 text-[#FFFDF8] items-center justify-center press-scale"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {index! < photos.length - 1 && (
          <button
            onClick={next}
            aria-label="Next photo"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#FFFDF8]/10 text-[#FFFDF8] items-center justify-center press-scale"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* caption / meta / actions */}
      <div
        className="px-5 pb-5 pt-3"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <p className="text-[10px] font-body font-extrabold uppercase tracking-[0.12em] text-[#E8B48F]">
          {formatDate(photo.date)}
          {age ? ` · ${age}` : ""}
          {photo.createdByName ? ` · added by ${photo.createdByName}` : ""}
        </p>
        {photo.caption && (
          <p className="font-body font-bold text-[15px] leading-snug text-[#FFFDF8] mt-1">
            {photo.caption}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] font-body text-[#FFFDF8]/40">
            Swipe to browse · swipe down to close
          </span>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="min-h-[44px] flex items-center gap-1 text-[12px] font-body font-extrabold px-3 rounded-xl bg-[#FFFDF8]/10 text-[#FFFDF8] press-scale"
              >
                <X size={14} /> Keep
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  onDelete(photo.id);
                }}
                className="min-h-[44px] flex items-center gap-1.5 text-[12px] font-body font-extrabold text-[#FFFDF8] px-3 rounded-xl bg-[#B4512E] press-scale"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Remove photo from album"
              className="min-h-[44px] flex items-center gap-1.5 text-[12px] font-body font-extrabold text-[#E8B48F] px-3 rounded-xl bg-[#FFFDF8]/10 press-scale"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

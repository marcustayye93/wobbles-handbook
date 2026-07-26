/*
 * Collapse — smooth ~200ms height transition for accordion card bodies.
 *
 * Why not pure CSS? `height: auto` can't be transitioned, so we animate to a
 * measured pixel height, then snap to `auto` once the transition ends (so the
 * card keeps growing naturally if inner content changes, e.g. images loading).
 *
 * Design notes (per the app's animation guide):
 * - 200ms, snappy ease-out `cubic-bezier(0.23, 1, 0.32, 1)` — never ease-in.
 * - Animates height + opacity only; content is not unmounted while visible so
 *   the collapse can play before the node disappears.
 * - Interruptible: re-toggling mid-flight re-measures from the current pixel
 *   height and reverses smoothly (CSS transitions, not keyframes).
 * - Respects `prefers-reduced-motion`: toggles instantly with no animation.
 * - Plays nicely with anchoredToggle: the rAF scroll-anchor there fires on the
 *   first frame of the transition, and because both the collapse and the
 *   scroll adjustment are tiny, the tapped card stays visually pinned; the
 *   header row never moves because it sits outside this component.
 */
import { useEffect, useRef, useState } from "react";

const DURATION = 200; // ms
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Collapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Keep content mounted while the exit animation plays.
  const [rendered, setRendered] = useState(open);
  const firstRender = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Initial mount: set final state with no animation.
    if (firstRender.current) {
      firstRender.current = false;
      el.style.height = open ? "auto" : "0px";
      el.style.opacity = open ? "1" : "0";
      return;
    }

    if (prefersReducedMotion()) {
      setRendered(open);
      el.style.transition = "none";
      el.style.height = open ? "auto" : "0px";
      el.style.opacity = open ? "1" : "0";
      return;
    }

    let raf = 0;
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== "height") return;
      el.removeEventListener("transitionend", onEnd);
      if (open) {
        el.style.height = "auto"; // let content reflow naturally when open
      } else {
        setRendered(false);
      }
    };

    if (open) {
      setRendered(true);
      // Wait a frame so children mount and scrollHeight is measurable.
      raf = requestAnimationFrame(() => {
        // If interrupted mid-collapse, start from the current pixel height.
        const start =
          el.style.height === "auto" ? el.scrollHeight : el.offsetHeight;
        el.style.transition = "none";
        el.style.height = `${start}px`;
        void el.offsetHeight; // force reflow
        el.style.transition = `height ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}`;
        el.style.height = `${el.scrollHeight}px`;
        el.style.opacity = "1";
        el.addEventListener("transitionend", onEnd);
      });
    } else {
      // From `auto` (or mid-flight px) to 0: pin the current height first.
      el.style.transition = "none";
      el.style.height = `${el.offsetHeight}px`;
      void el.offsetHeight; // force reflow
      el.style.transition = `height ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}`;
      el.style.height = "0px";
      el.style.opacity = "0";
      el.addEventListener("transitionend", onEnd);
    }

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("transitionend", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ overflow: "hidden", height: 0, opacity: 0 }}
      aria-hidden={!open}
    >
      {(rendered || open) && children}
    </div>
  );
}

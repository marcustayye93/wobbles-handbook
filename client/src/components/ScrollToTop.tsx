/*
 * ScrollToTop — resets window scroll to the top whenever the route path
 * changes (wouter keeps scroll position by default, so deep pages opened
 * from a scrolled list would otherwise start mid-page). Instant (no smooth
 * animation) so navigation feels like opening a fresh page. Renders nothing.
 */
import { useLayoutEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTop() {
  const [location] = useLocation();

  useLayoutEffect(() => {
    // Instant jump before paint — avoids a visible mid-page flash.
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

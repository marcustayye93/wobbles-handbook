/*
 * Deep link: any URL ending in #dogs opens the Dog-friendly tab.
 */
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function HashDogsRedirect() {
  const [loc, setLoc] = useLocation();
  useEffect(() => {
    const go = () => {
      if (window.location.hash.replace(/^#/, "") === "dogs" && loc !== "/dogs") {
        setLoc("/dogs");
      }
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [loc, setLoc]);
  return null;
}

/* Shared localStorage state hook — all app data persists on-device under "wobbles:" keys */
import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const fullKey = `wobbles:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(fullKey, JSON.stringify(v));
        } catch {
          /* storage full or unavailable — keep in-memory */
        }
        return v;
      });
    },
    [fullKey],
  );

  return [value, set] as const;
}

/** ISO date string for today, local time */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** hh:mm local time */
export function nowHM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Friendly display like "Mon 21 Jul" from ISO date */
export function friendlyDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

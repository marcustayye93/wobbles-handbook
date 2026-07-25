/*
 * Device-remembered profile (no login) — Wobbles' Handbook opens straight
 * into the app once a profile has been picked on this device. Three profiles:
 * Marcus, Chesa, and Caretaker (for friends dog-sitting while the family is
 * overseas). The choice lives in localStorage and is sent to the server on
 * every request via the `x-wobbles-profile` header (see main.tsx), which
 * stamps attribution on logs, photos and chat messages.
 */
import { useSyncExternalStore } from "react";

export const PROFILES = ["Marcus", "Chesa", "Caretaker"] as const;
export type Profile = (typeof PROFILES)[number];

export const PROFILE_KEY = "wobbles-profile";
const EVENT = "wobbles-profile-changed";

export function readProfile(): Profile | null {
  try {
    // URL bootstrap: opening any link with ?profile=Marcus|Chesa|Caretaker
    // preselects the profile on this device (handy for sharing set-up links
    // with a caretaker — and for automated previews).
    const fromUrl = new URLSearchParams(window.location.search).get("profile");
    if (fromUrl && PROFILES.includes(fromUrl as Profile)) {
      if (localStorage.getItem(PROFILE_KEY) !== fromUrl)
        localStorage.setItem(PROFILE_KEY, fromUrl);
      return fromUrl as Profile;
    }
    const raw = localStorage.getItem(PROFILE_KEY);
    return PROFILES.includes(raw as Profile) ? (raw as Profile) : null;
  } catch {
    return null;
  }
}

export function writeProfile(profile: Profile | null) {
  try {
    if (profile) localStorage.setItem(PROFILE_KEY, profile);
    else localStorage.removeItem(PROFILE_KEY);
  } catch {
    // localStorage unavailable — app still works, attribution falls back to "Family"
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Reactive current profile; null until first pick on this device. */
export function useProfile(): {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
} {
  const profile = useSyncExternalStore(subscribe, readProfile, () => null);
  return { profile, setProfile: writeProfile };
}

/** Emoji shown beside each profile in pickers and switchers. */
export const PROFILE_EMOJI: Record<Profile, string> = {
  Marcus: "🧑🏻",
  Chesa: "👩🏻",
  Caretaker: "🤝",
};

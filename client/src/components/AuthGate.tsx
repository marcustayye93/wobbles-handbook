/*
 * ProfileGate (formerly AuthGate) — no login required. The app is private by
 * URL only (user-confirmed). On first open, each device picks who's holding
 * the phone — Marcus, Chesa, or Caretaker (for friends dog-sitting) — and the
 * choice is remembered forever on that device. All data still lives in the
 * Manus cloud (database + S3), synced across devices and fully readable by
 * the Wobbles AI; only the identity label is stored locally.
 */
import { useEffect, useRef, useState } from "react";
import { useLegacyImport } from "@/hooks/useSyncedData";
import { PROFILES, PROFILE_EMOJI, useProfile, type Profile } from "@/hooks/useProfile";
import { ASSETS, WOBBLES } from "@/content/wobbles";
import { ChevronRight } from "lucide-react";

const PROFILE_TAGLINE: Record<Profile, string> = {
  Marcus: "Wobbles' dad",
  Chesa: "Wobbles' mum",
  Caretaker: "Friends looking after Wobbles",
};

function ProfilePicker({ onPick }: { onPick: (p: Profile) => void }) {
  return (
    <div className="phone-shell paper-grain min-h-screen flex flex-col">
      {/* hero */}
      <div className="relative">
        <img
          src={ASSETS.v2Hero}
          alt="Gouache illustration of Wobbles the Cavoodle puppy"
          className="w-full aspect-[4/5] max-h-[46vh] object-cover object-top"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to bottom, transparent, #F8F3EB)" }}
          aria-hidden
        />
      </div>

      <div className="px-6 -mt-10 relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md border-[1.5px] border-[#C66A3D] text-[#C66A3D] font-display font-bold text-sm flex items-center justify-center bg-[#FFFDF8]">
            W
          </span>
          <span className="text-[10px] font-body font-extrabold uppercase tracking-[0.18em] text-[#22364D]/70">
            Wobbles' Handbook
          </span>
        </div>
        <h1 className="font-display font-semibold text-[2.5rem] leading-[1] text-[#22364D] mt-3">
          Who's holding
          <br />
          the phone?
        </h1>
        <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed mt-2.5 max-w-[300px]">
          Pick once — this device will remember. Everything you log about{" "}
          {WOBBLES.name} syncs to the shared family journal.
        </p>

        <div className="mt-5 space-y-2.5">
          {PROFILES.map((p) => (
            <button
              key={p}
              onClick={() => onPick(p)}
              className="sticker-card w-full px-4 py-3.5 flex items-center gap-3.5 press-scale text-left"
            >
              <span className="text-[24px] shrink-0">{PROFILE_EMOJI[p]}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-body font-bold text-[15px] leading-snug text-[#22364D]">
                  {p}
                </span>
                <span className="block text-[11px] font-body text-muted-foreground">
                  {PROFILE_TAGLINE[p]}
                </span>
              </span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <p className="text-[10.5px] font-body text-muted-foreground text-center mt-auto pt-4 pb-8 leading-relaxed">
          No password needed — keep the app link within the family.
          <br />
          You can switch who's logging anytime from Home.
        </p>
      </div>
    </div>
  );
}

export default function ProfileGate({ children }: { children: React.ReactNode }) {
  const { profile, setProfile } = useProfile();
  const runImport = useLegacyImport();
  const ran = useRef(false);
  // Avoid a hydration flash: read synchronously on first render.
  const [ready] = useState(true);

  useEffect(() => {
    if (profile && !ran.current) {
      ran.current = true;
      void runImport();
    }
  }, [profile, runImport]);

  if (!ready) return null;
  if (!profile) return <ProfilePicker onPick={setProfile} />;
  return <>{children}</>;
}

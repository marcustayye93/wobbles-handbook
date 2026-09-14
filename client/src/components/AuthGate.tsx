import { useEffect, useRef, useState } from "react";
import { useLegacyImport } from "@/hooks/useSyncedData";
import { PROFILES, PROFILE_EMOJI, useProfile, type Profile } from "@/hooks/useProfile";
import { ASSETS, WOBBLES } from "@/content/wobbles";
import { trpc } from "@/lib/trpc";
import { ChevronRight } from "lucide-react";

const PROFILE_TAGLINE: Record<Profile, string> = {
  Marcus: "Paddington's dad",
  Chesa: "Paddington's mum",
  Caretaker: "Friends looking after Paddington",
};

function FamilyCodeGate({ onUnlocked }: { onUnlocked: (profile: Profile) => void }) {
  const login = trpc.auth.login.useMutation();
  const [code, setCode] = useState("");
  const [profile, setProfile] = useState<Profile>("Marcus");
  const [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login.mutateAsync({ code: code.trim(), profile });
      onUnlocked(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That family code is not right");
    }
  }
  return (
    <div className="phone-shell paper-grain min-h-screen flex flex-col">
      <div className="relative">
        <img src={ASSETS.v2Hero} alt="" className="w-full aspect-[4/5] max-h-[46vh] object-cover object-top"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to bottom, transparent, #F8F3EB)" }} />
      </div>
      <form onSubmit={submit} className="px-6 -mt-10 relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md border-[1.5px] border-[#C66A3D] text-[#C66A3D] font-display font-bold text-sm flex items-center justify-center bg-[#FFFDF8]">P</span>
          <span className="text-[10px] font-body font-extrabold uppercase tracking-[0.18em] text-[#22364D]/70">Paddington's Handbook</span>
        </div>
        <h1 className="font-display font-semibold text-[2.4rem] leading-[1] text-[#22364D] mt-3">Family code</h1>
        <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed mt-2.5 max-w-[320px]">
          Household access only. No Google or X sign-in. Then pick who is holding the phone so logs for {WOBBLES.name} are attributed.
        </p>
        <label className="mt-5 text-[11px] font-body font-extrabold uppercase tracking-[0.14em] text-[#22364D]/70">Code</label>
        <input autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)}
          className="mt-1.5 w-full rounded-2xl border border-[#E2D6C6] bg-[#FFFDF8] px-4 py-3 text-[16px] font-body text-[#22364D] tracking-[0.12em]"
          placeholder="Family code" />
        <p className="mt-4 text-[11px] font-body font-extrabold uppercase tracking-[0.14em] text-[#22364D]/70">Who's holding the phone?</p>
        <div className="mt-2 space-y-2">
          {PROFILES.map((p) => (
            <button type="button" key={p} onClick={() => setProfile(p)}
              className="sticker-card w-full px-4 py-3 flex items-center gap-3.5 press-scale text-left"
              style={profile === p ? { outline: "2px solid #C66A3D" } : undefined}>
              <span className="text-[24px] shrink-0">{PROFILE_EMOJI[p]}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-body font-bold text-[15px] leading-snug text-[#22364D]">{p}</span>
                <span className="block text-[11px] font-body text-muted-foreground">{PROFILE_TAGLINE[p]}</span>
              </span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
        {error ? <p className="mt-3 text-[13px] font-body text-[#B4512E]">{error}</p> : null}
        <button type="submit" disabled={login.isPending || !code.trim()}
          className="mt-5 mb-8 min-h-[48px] rounded-2xl bg-[#22364D] text-[#F8F3EB] font-body font-extrabold">
          {login.isPending ? "Checking…" : "Open the handbook"}
        </button>
      </form>
    </div>
  );
}

export default function ProfileGate({ children }: { children: React.ReactNode }) {
  const { profile, setProfile } = useProfile();
  const me = trpc.auth.me.useQuery(undefined, { retry: false });
  const runImport = useLegacyImport();
  const ran = useRef(false);
  useEffect(() => {
    if (profile && me.data?.authenticated && !ran.current) { ran.current = true; void runImport(); }
  }, [profile, me.data?.authenticated, runImport]);
  if (me.isLoading) {
    return <div className="phone-shell paper-grain min-h-screen flex items-center justify-center text-[#5A6B7E] font-body">Opening Paddington's handbook…</div>;
  }
  if (!me.data?.authenticated) {
    return <FamilyCodeGate onUnlocked={(p) => { setProfile(p); void me.refetch(); }} />;
  }
  if (!profile && me.data.profile) setProfile(me.data.profile);
  return <>{children}</>;
}

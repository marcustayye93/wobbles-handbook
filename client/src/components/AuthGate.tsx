/*
 * AuthGate — wraps the whole app. Family members must sign in (Manus OAuth)
 * before seeing any household data, since everything is now synced/shared.
 *
 * States:
 *  - loading: soft keepsake splash (no flash of the login screen)
 *  - logged out: keepsake welcome page with a single sign-in button
 *  - logged in: renders children + fires the one-time legacy import
 */
import { useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useLegacyImport } from "@/hooks/useSyncedData";
import { ASSETS, WOBBLES } from "@/content/wobbles";
import { PawPrint, Users } from "lucide-react";

function Splash() {
  return (
    <div className="phone-shell paper-grain min-h-screen flex flex-col items-center justify-center gap-4">
      <span className="w-12 h-12 rounded-2xl border-2 border-[#C66A3D] text-[#C66A3D] font-display font-bold text-xl flex items-center justify-center animate-pulse">
        W
      </span>
      <p className="text-[11px] font-body font-extrabold uppercase tracking-[0.2em] text-[#22364D]/60">
        Opening the handbook…
      </p>
    </div>
  );
}

function Welcome() {
  return (
    <div className="phone-shell paper-grain min-h-screen flex flex-col">
      {/* hero */}
      <div className="relative">
        <img
          src={ASSETS.v2Hero}
          alt="Gouache illustration of Wobbles the Cavoodle puppy"
          className="w-full aspect-[4/5] object-cover"
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
        <h1 className="font-display font-semibold text-[2.7rem] leading-[1] text-[#22364D] mt-3">
          The family
          <br />
          journal
        </h1>
        <p className="text-[13.5px] font-body text-[#5A6B7E] leading-relaxed mt-3 max-w-[300px]">
          Every log, tick and memory about {WOBBLES.name} now syncs between
          everyone in the family. Sign in once on each phone and you'll both
          always see the same story.
        </p>

        <div className="mt-5 space-y-2">
          <div className="sticker-card px-4 py-2.5 flex items-center gap-3">
            <PawPrint size={15} className="text-[#C66A3D] shrink-0" />
            <span className="text-[12px] font-body font-bold text-[#22364D]">
              Trackers, checklists &amp; reading progress — shared live
            </span>
          </div>
          <div className="sticker-card px-4 py-2.5 flex items-center gap-3">
            <Users size={15} className="text-[#C66A3D] shrink-0" />
            <span className="text-[12px] font-body font-bold text-[#22364D]">
              Anything this phone already logged moves over automatically
            </span>
          </div>
        </div>

        <button
          onClick={() => startLogin()}
          className="btn-ink w-full h-13 rounded-2xl mt-6 py-4 font-body font-extrabold text-[15px] press-scale"
        >
          Sign in to open the handbook
        </button>
        <p className="text-[10.5px] font-body text-muted-foreground text-center mt-3 pb-8 leading-relaxed">
          Private family app — sign in with the same Manus account you use here.
        </p>
      </div>
    </div>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const runImport = useLegacyImport();
  const ran = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !ran.current) {
      ran.current = true;
      void runImport();
    }
  }, [isAuthenticated, runImport]);

  if (loading) return <Splash />;
  if (!isAuthenticated) return <Welcome />;
  return <>{children}</>;
}

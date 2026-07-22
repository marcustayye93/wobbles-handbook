/*
 * OfflineBanner — small, keepsake-styled connectivity indicator.
 * Shows a persistent strip while offline (reading works from the cached
 * snapshot; logging needs the connection) and a brief "back online" note
 * when connectivity returns.
 */
import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

/** Shared online/offline state hook (navigator.onLine + events). */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  return online;
}

export default function OfflineBanner() {
  const online = useOnline();
  const [justReconnected, setJustReconnected] = useState(false);
  // Track transitions: offline -> online shows a short confirmation.
  const [wasOffline, setWasOffline] = useState(false);
  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setJustReconnected(false);
    } else if (wasOffline) {
      setJustReconnected(true);
      const t = setTimeout(() => {
        setJustReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [online, wasOffline]);

  if (online && !justReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-body font-extrabold uppercase tracking-[0.12em] shadow-sm"
      style={
        online
          ? { background: "#7B8C6A", color: "#FFFDF8" }
          : { background: "#22364D", color: "#FFFDF8" }
      }
    >
      {online ? (
        <>
          <Wifi size={13} /> Back online — syncing
        </>
      ) : (
        <>
          <WifiOff size={13} /> Offline — reading works, logging will resume online
        </>
      )}
    </div>
  );
}

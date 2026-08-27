/*
 * Redesign v2 — "Keepsake Field Guide" app shell.
 * Paper #F8F3EB bg w/ grain, ivory cards, Ink Navy #22364D nav bar + CTAs,
 * Burnt Sienna #C66A3D active/eyebrow accents, Cormorant Garamond display.
 * Bottom nav matches live grok.me: Home / Logs / Photos / Guides / Ask.
 * Growth, Health and Journey live under Home → "His record".
 */
import { Link, useLocation } from "wouter";
import {
  Home,
  BookOpen,
  ClipboardList,
  Camera,
  ChevronLeft,
  PawPrint,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PawFab from "@/components/PawFab";
import { WOBBLES, daysUntil } from "@/content/wobbles";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trackers", label: "Logs", icon: ClipboardList },
  { href: "/memories", label: "Photos", icon: Camera },
  { href: "/handbook", label: "Guides", icon: BookOpen },
  { href: "/ask", label: "Ask", icon: Sparkles },
] as const;

function isTabActive(href: string, loc: string) {
  if (href === "/") return loc === "/";
  if (href === "/handbook")
    return loc.startsWith("/handbook") || loc.startsWith("/training") || loc.startsWith("/grooming");
  return loc.startsWith(href);
}

function preHomecoming() {
  return daysUntil(WOBBLES.homecoming) > 0;
}

export function BottomNav() {
  const [loc] = useLocation();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-md z-50 print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-3 mb-2.5 rounded-[26px] bg-[#22364D] shadow-[0_10px_30px_rgba(34,54,77,0.35)]">
        <div className="grid grid-cols-5 py-1.5 px-1">
          {TABS.map((t) => {
            const active = isTabActive(t.href, loc);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-1 rounded-2xl press-scale select-none transition-colors duration-200",
                  active ? "text-[#E8935C]" : "text-[#C9D4E2]",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                <span
                  className={cn(
                    "text-[11px] leading-none tracking-[0.04em]",
                    active ? "font-extrabold" : "font-semibold",
                  )}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function PageShell({
  children,
  className,
  hideNav,
  hideFab,
}: {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  hideFab?: boolean;
}) {
  const hideTheFab = hideFab || preHomecoming();
  return (
    <div className="phone-shell paper-grain">
      <main
        className={cn(className, hideNav ? "pb-6" : "safe-bottom")}
        style={
          hideNav
            ? undefined
            : { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8.75rem)" }
        }
      >
        {children}
      </main>
      {!hideNav && !hideTheFab && <PawFab />}
      {!hideNav && <BottomNav />}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  emoji,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  emoji?: string;
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F3EB]/92 backdrop-blur-md border-b border-border/60 print:static print:bg-white">
      <div className="px-4 py-3 flex items-center gap-2.5">
        {back && (
          <Link
            href={back}
            className="shrink-0 w-9 h-9 -ml-1 rounded-full flex items-center justify-center bg-[#22364D] text-[#F8F3EB] press-scale print:hidden"
            aria-label="Back"
          >
            <ChevronLeft size={19} />
          </Link>
        )}
        {emoji && <span className="text-2xl leading-none">{emoji}</span>}
        <div className="min-w-0">
          <h1 className="font-display font-bold text-xl leading-tight truncate text-[#22364D]">{title}</h1>
          {subtitle && (
            <p className="text-[11px] font-body font-semibold text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function PawDivider() {
  return (
    <div className="flex items-center gap-3 my-6" aria-hidden>
      <span className="flex-1 border-t border-dashed border-[#C9BBA4]" />
      <PawPrint size={13} className="text-[#C66A3D]/60" />
      <span className="flex-1 border-t border-dashed border-[#C9BBA4]" />
    </div>
  );
}

export function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="sticker-card px-3 py-2.5 text-center">
      <p className="font-display font-bold text-lg leading-tight text-[#22364D]">{value}</p>
      <p className="text-[9px] font-body font-bold text-[#B4512E] uppercase tracking-[0.12em] mt-0.5">{label}</p>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 4,
  label,
  className,
  trackColor = "rgba(34,54,77,0.12)",
  color = "#C66A3D",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
  trackColor?: string;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.23,1,0.32,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? (
          <span className="font-body font-extrabold text-[10px] text-[#22364D] leading-none">
            {Math.round(clamped * 100)}%
            {label && <span className="block text-[7px] font-bold text-muted-foreground mt-0.5">{label}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

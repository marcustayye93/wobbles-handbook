/*
 * Storybook Picture-Book theme — app shell components.
 * Cream paper bg, chestnut primary, sticker cards, bottom tab bar (5 tabs),
 * Fraunces display + Nunito body, paw motifs, gentle fade-up entrances.
 */
import { Link, useLocation } from "wouter";
import { Home, BookOpen, ClipboardList, Plane, PawPrint, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/handbook", label: "Handbook", icon: BookOpen },
  { href: "/trackers", label: "Trackers", icon: ClipboardList },
  { href: "/singapore", label: "Singapore", icon: Plane },
  { href: "/about", label: "Wobbles", icon: PawPrint },
] as const;

export function BottomNav() {
  const [loc] = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-3 mb-2 rounded-3xl bg-card/95 backdrop-blur-md border border-border shadow-[0_-2px_20px_oklch(0.52_0.115_45/0.12),0_4px_14px_oklch(0.52_0.115_45/0.10)]">
        <div className="grid grid-cols-5 py-1.5 px-1">
          {TABS.map((t) => {
            const active = t.href === "/" ? loc === "/" : loc.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 rounded-2xl press-scale select-none",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-10 h-6 rounded-full transition-colors duration-200",
                    active && "bg-primary/12",
                  )}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 2}
                    className={cn("transition-transform duration-200", active && "scale-110")}
                  />
                </span>
                <span className={cn("text-[10px] leading-none", active ? "font-extrabold" : "font-semibold")}>
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

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="phone-shell">
      <main className={cn("safe-bottom", className)}>{children}</main>
      <BottomNav />
    </div>
  );
}

/** Sticky page header with optional back link */
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
    <header className="sticky top-0 z-40 bg-background/92 backdrop-blur-md border-b border-border/60 print:static print:bg-white">
      <div className="px-4 py-3 flex items-center gap-2.5">
        {back && (
          <Link
            href={back}
            className="shrink-0 w-9 h-9 -ml-1 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground press-scale print:hidden"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </Link>
        )}
        {emoji && <span className="text-2xl leading-none">{emoji}</span>}
        <div className="min-w-0">
          <h1 className="font-display font-bold text-lg leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}

/** Hand-stitched dashed divider with a paw in the middle */
export function PawDivider() {
  return (
    <div className="flex items-center gap-3 my-6" aria-hidden>
      <span className="flex-1 border-t-2 border-dashed border-border" />
      <PawPrint size={14} className="text-primary/50" />
      <span className="flex-1 border-t-2 border-dashed border-border" />
    </div>
  );
}

/** Small stat chip */
export function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="sticker-card px-3 py-2 text-center">
      <p className="font-display font-bold text-base leading-tight text-primary">{value}</p>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

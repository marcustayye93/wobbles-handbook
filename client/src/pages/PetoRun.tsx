/*
 * "PetO Brisbane Run" — store-specific shopping list for the family's Brisbane
 * visit. Verified products from peto.com.au with prices, links, alternatives
 * and fly-to-Singapore packing notes. Ticks reuse the family-shared "shopping"
 * map ids, so buying something here also ticks it on the master Shopping
 * Countdown (and vice versa).
 */
import { useState } from "react";
import { PageShell, PageHeader, ProgressRing, Eyebrow, PawDivider } from "@/components/AppShell";
import SyncIndicator from "@/components/SyncIndicator";
import {
  PETO_RUN,
  PETO_STORES,
  PETO_RUN_DATE_NOTE,
  type PetoRunItem,
  type PetoStore,
} from "@/content/petoRun";
import { useSharedState } from "@/hooks/useSyncedData";
import { cn } from "@/lib/utils";
import {
  PawPrint,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  Plane,
  ChevronDown,
  Star,
  Sparkles,
} from "lucide-react";

const INK = "#22364D";
const SIENNA = "#C66A3D";
const RUST = "#B4512E";
const MOSS = "#7B8C6A";

const PRIORITY_META: Record<
  PetoRunItem["priority"],
  { title: string; blurb: string; emoji: string }
> = {
  "grab-first": {
    title: "Grab first",
    blurb: "The Brisbane-only wins — things that should reach Charmaine before Wobbles flies.",
    emoji: "⭐",
  },
  standard: {
    title: "The core run",
    blurb: "Gaps from the master plan that PetO covers well, verified in their range.",
    emoji: "🛒",
  },
  optional: {
    title: "Judgement calls",
    blurb: "Worth a look in the aisle, but skippable — cheaper elsewhere or heavy to fly.",
    emoji: "🤔",
  },
};

function RunItemCard({
  item,
  done,
  onToggle,
}: {
  item: PetoRunItem;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn("keepsake-card overflow-hidden transition-opacity", done && "opacity-75")}>
      {/* tick row */}
      <button onClick={onToggle} className="w-full flex items-start gap-3 px-4 pt-4 text-left press-scale">
        <span
          className={cn(
            "shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-colors",
            done ? "text-white border-transparent" : "border-border bg-background",
          )}
          style={done ? { backgroundColor: MOSS } : undefined}
        >
          {done && <PawPrint size={13} />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-[14px] font-body font-bold leading-snug",
              done ? "line-through text-muted-foreground" : "",
            )}
            style={done ? undefined : { color: INK }}
          >
            {item.emoji} {item.label}
          </span>
          {!done && (
            <span className="block text-[11.5px] font-body text-muted-foreground leading-relaxed mt-1">
              {item.why}
            </span>
          )}
        </span>
      </button>

      {!done && (
        <div className="px-4 pb-4 pt-2.5">
          {/* top pick */}
          <a
            href={item.pick.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-[#E5DAC8] bg-[#FBF7EF] px-3 py-2.5 press-scale"
          >
            <div className="flex items-center gap-1.5">
              <Star size={11} style={{ color: SIENNA }} className="shrink-0" />
              <span className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em]" style={{ color: SIENNA }}>
                The pick
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 mt-1">
              <span className="min-w-0 text-[12.5px] font-body font-bold leading-snug" style={{ color: INK }}>
                {item.pick.name}
              </span>
              <span className="shrink-0 flex items-center gap-1 text-[12.5px] font-body font-extrabold" style={{ color: RUST }}>
                {item.pick.price}
                <ExternalLink size={11} className="text-muted-foreground" />
              </span>
            </div>
            {item.pick.note && (
              <p className="text-[11px] font-body text-muted-foreground leading-relaxed mt-1">{item.pick.note}</p>
            )}
          </a>

          {/* alternatives */}
          {item.alts && item.alts.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.alts.map((a) => (
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg press-scale hover:bg-muted/50"
                >
                  <span className="min-w-0 text-[11.5px] font-body text-[#33475C] leading-snug">
                    also: {a.name}
                  </span>
                  <span className="shrink-0 text-[11.5px] font-body font-bold text-muted-foreground">
                    {a.price}
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* travel note */}
          {item.travel && (
            <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-[#22364D]/5 px-3 py-2">
              <Plane size={12} className="shrink-0 mt-0.5" style={{ color: INK }} />
              <p className="text-[10.5px] font-body text-[#33475C] leading-relaxed">{item.travel}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StoreRow({ store, featured }: { store: PetoStore; featured?: boolean }) {
  const [open, setOpen] = useState(!!featured);
  return (
    <div className={cn("sticker-card overflow-hidden", featured && "border-[#C66A3D]/40")}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left press-scale">
        <MapPin size={15} className="shrink-0" style={{ color: featured ? SIENNA : "#8FA0B5" }} />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-body font-bold leading-snug" style={{ color: INK }}>
            {store.name}
          </span>
          <span className="block text-[10.5px] font-body text-muted-foreground">{store.area}</span>
        </span>
        <ChevronDown size={14} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-3.5 pb-3 space-y-1.5 border-t border-dashed border-[#E5DAC8] pt-2.5">
          {store.bestFor && (
            <p className="text-[11px] font-body font-bold leading-relaxed" style={{ color: RUST }}>
              {store.bestFor}
            </p>
          )}
          <p className="text-[11px] font-body text-[#33475C] leading-relaxed">{store.address}</p>
          <p className="flex items-center gap-1.5 text-[11px] font-body text-muted-foreground">
            <Phone size={10} /> {store.phone}
          </p>
          <p className="flex items-start gap-1.5 text-[11px] font-body text-muted-foreground leading-relaxed">
            <Clock size={10} className="mt-0.5 shrink-0" /> {store.hours}
          </p>
          {store.services && (
            <p className="text-[10.5px] font-body font-bold text-[#7B8C6A]">In-store: {store.services}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PetoRun() {
  const [ticks, setTicks] = useSharedState<Record<string, boolean>>("shopping", {});
  const doneCount = PETO_RUN.filter((i) => ticks[i.id]).length;

  const toggle = (id: string) => setTicks((p) => ({ ...p, [id]: !p[id] }));

  const groups = (["grab-first", "standard", "optional"] as const).map((p) => ({
    priority: p,
    meta: PRIORITY_META[p],
    items: PETO_RUN.filter((i) => i.priority === p),
  }));

  return (
    <PageShell>
      <PageHeader
        title="PetO Brisbane Run"
        subtitle="Specific products, verified in their range"
        back="/handbook/shopping"
        emoji="🛍️"
      />

      {/* hero */}
      <div className="px-5 pt-5">
        <div className="keepsake-card px-5 py-5">
          <div className="flex items-center gap-5">
            <ProgressRing
              value={doneCount / PETO_RUN.length}
              size={84}
              stroke={7}
              trackColor="rgba(34,54,77,0.1)"
              color={SIENNA}
            >
              <span className="flex flex-col items-center leading-none">
                <span className="font-display font-semibold text-[1.5rem]" style={{ color: INK }}>
                  {doneCount}
                </span>
                <span className="text-[8px] font-body font-extrabold uppercase tracking-[0.14em] text-muted-foreground mt-0.5">
                  of {PETO_RUN.length}
                </span>
              </span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <Eyebrow>The Brisbane haul</Eyebrow>
                <SyncIndicator />
              </div>
              <p className="text-[12.5px] font-body text-muted-foreground leading-relaxed mt-1.5">
                Everything still unbought that PetO stocks — ticks here also tick the{" "}
                <span className="font-bold" style={{ color: RUST }}>
                  master shopping plan
                </span>
                , so nothing gets bought twice.
              </p>
            </div>
          </div>
          <p className="flex items-start gap-1.5 text-[10px] font-body text-muted-foreground leading-relaxed mt-3 border-t border-dashed border-[#E5DAC8] pt-2.5">
            <Sparkles size={11} className="shrink-0 mt-0.5" style={{ color: SIENNA }} />
            {PETO_RUN_DATE_NOTE} Free 2-hour delivery over $149 if the haul gets heavy.
          </p>
        </div>
      </div>

      {/* grouped items */}
      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.priority} className="px-5 pt-6">
              <div className="flex items-baseline gap-2 mb-1">
                <Eyebrow>
                  {g.meta.emoji} {g.meta.title}
                </Eyebrow>
                <span className="text-[10px] font-body font-bold text-muted-foreground">
                  {g.items.filter((i) => ticks[i.id]).length}/{g.items.length}
                </span>
              </div>
              <p className="text-[11px] font-body text-muted-foreground leading-relaxed mb-2.5">{g.meta.blurb}</p>
              <div className="space-y-2.5">
                {g.items.map((it) => (
                  <RunItemCard key={it.id} item={it} done={!!ticks[it.id]} onToggle={() => toggle(it.id)} />
                ))}
              </div>
            </section>
          ),
      )}

      <div className="px-5">
        <PawDivider />
      </div>

      {/* stores */}
      <section className="px-5 pb-8">
        <Eyebrow className="mb-1">📍 Seven stores around Brisbane</Eyebrow>
        <p className="text-[11px] font-body text-muted-foreground leading-relaxed mb-2.5">
          Spring Hill is the city pick; Browns Plains pairs with a Doghouse QLD visit. All are open
          seven days.
        </p>
        <div className="space-y-2">
          {PETO_STORES.map((s, i) => (
            <StoreRow key={s.name} store={s} featured={i < 2} />
          ))}
        </div>
        <p className="text-[10.5px] font-body text-muted-foreground text-center mt-4 leading-relaxed">
          PetO beats any competitor's price by 10% — screenshot cheaper prices before the run.
        </p>
      </section>
    </PageShell>
  );
}

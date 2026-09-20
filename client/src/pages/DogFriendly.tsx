/*
 * Dog-friendly places in Singapore. Planning list for after 16 Oct plus
 * a SingVet nod. Dataset is verbatim Sep 2026 research.
 */
import { useMemo, useState } from "react";
import { PageShell, Eyebrow } from "@/components/AppShell";
import {
  DOG_FRIENDLY_PLACES,
  KIND_LABEL,
  LEASH_BLURB,
  PLANNING_BLURB,
  HAWKER_BLURB,
  searchDogPlaces,
  withDistances,
  formatKm,
  type PlaceKind,
} from "@/content/dogFriendly";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const KINDS: PlaceKind[] = [
  "dog-run",
  "beach",
  "park",
  "cafe",
  "mall",
  "staycation",
  "hotel",
  "ferry",
  "hawker",
];

export default function DogFriendly() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<PlaceKind | "all">("all");
  const [softOnly, setSoftOnly] = useState(false);

  const rows = useMemo(() => {
    let found = searchDogPlaces(DOG_FRIENDLY_PLACES, query);
    if (kind !== "all") found = found.filter((p) => p.kind === kind);
    if (softOnly) found = found.filter((p) => p.softCage);
    return withDistances(found, null);
  }, [query, kind, softOnly]);

  return (
    <PageShell>
      <header className="px-5 pt-9 pb-1">
        <Eyebrow>Outings</Eyebrow>
        <h1 className="font-display font-semibold text-[2.15rem] leading-[1.02] mt-1.5 text-[#22364D]">
          Dog-friendly
        </h1>
        <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed mt-2">
          {PLANNING_BLURB}
        </p>
      </header>

      <section className="px-4 mt-4">
        <div className="keepsake-card p-4">
          <p className="text-[11px] font-body font-extrabold uppercase tracking-[0.14em] text-[#B4512E]">
            Leash rule
          </p>
          <p className="text-[12.5px] font-body text-[#33475C] leading-snug mt-1.5">{LEASH_BLURB}</p>
          <p className="text-[12.5px] font-body text-[#33475C] leading-snug mt-2">{HAWKER_BLURB}</p>
        </div>
      </section>

      <section className="px-4 mt-3">
        <label className="relative block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6B7E]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, area, soft cage, or hawker"
            className="w-full h-11 pl-9 pr-3 rounded-2xl bg-[#FFFDF8] border border-[#E5DAC8] text-[13px] font-body text-[#22364D] placeholder:text-[#5A6B7E]/70 outline-none focus:border-[#C66A3D]"
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto mt-2.5 pb-1 -mx-1 px-1">
          <FilterChip active={kind === "all"} onClick={() => setKind("all")}>
            All
          </FilterChip>
          {KINDS.map((k) => (
            <FilterChip key={k} active={kind === k} onClick={() => setKind(k)}>
              {KIND_LABEL[k]}
            </FilterChip>
          ))}
          <FilterChip active={softOnly} onClick={() => setSoftOnly((v) => !v)}>
            Soft cage
          </FilterChip>
        </div>
      </section>

      <section className="px-4 mt-3 pb-4 space-y-2.5">
        <p className="px-1 text-[11px] font-body font-bold text-[#5A6B7E]">
          {rows.length} {rows.length === 1 ? "place" : "places"}
        </p>
        {rows.map(({ place, km }) => {
          const href = place.sourceUrls[0];
          const inner = (
            <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-display font-semibold text-[1.2rem] leading-tight text-[#22364D]">
                  {place.name}
                </h2>
                <p className="text-[11px] font-body text-[#5A6B7E] mt-0.5">
                  {KIND_LABEL[place.kind]} · {place.travel.region}
                  {km != null ? ` · ${formatKm(km)}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[11px] font-body font-extrabold uppercase tracking-[0.12em] px-2 py-1 rounded-full",
                  place.leash === "off-leash"
                    ? "bg-[#6B7C5A] text-[#FFFDF8]"
                    : "bg-[#22364D]/10 text-[#22364D]",
                )}
              >
                {place.leash === "off-leash" ? "Off-leash" : "Leashed"}
              </span>
            </div>
            {place.softCage && (
              <p className="text-[11px] font-body font-extrabold text-[#B4512E] mt-1.5">
                Soft cage, carrier or stroller indoors
              </p>
            )}
            {place.kind === "hawker" && (
              <p className="text-[11px] font-body font-extrabold text-[#B4512E] mt-1">
                Officially not allowed. Sighting only.
              </p>
            )}
            <p className="text-[12.5px] font-body text-[#33475C] leading-snug mt-2">{place.notes}</p>
            <p className="text-[11px] font-body text-[#5A6B7E] mt-1.5">{place.address}</p>
            {place.travel.coordsApproximate && (
              <p className="text-[11px] font-body font-bold text-[#B4512E] mt-1">
                Location approximate
              </p>
            )}
            {place.travel.nearestMrt && (
              <p className="text-[11px] font-body text-[#5A6B7E] mt-0.5">
                Nearest MRT: {place.travel.nearestMrt}
              </p>
            )}
            {href && (
              <p className="mt-2.5 text-[11px] font-body font-extrabold text-[#B4512E]">
                Verified Sep 2026
              </p>
            )}
            </>
          );
          return href ? (
            <a
              key={place.id}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="keepsake-card p-4 block press-scale"
            >
              {inner}
            </a>
          ) : (
            <article key={place.id} className="keepsake-card p-4">
              {inner}
            </article>
          );
        })}
        {rows.length === 0 && (
          <p className="text-[13px] font-body text-[#5A6B7E] px-1 py-6">
            Nothing matches that search. Try a neighbourhood or a category like cafe.
          </p>
        )}
      </section>
    </PageShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 px-3 min-h-11 h-11 rounded-full text-[11px] font-body font-extrabold press-scale",
        active ? "bg-[#22364D] text-[#FFFDF8]" : "bg-[#FFFDF8] text-[#22364D] border border-[#E5DAC8]",
      )}
    >
      {children}
    </button>
  );
}

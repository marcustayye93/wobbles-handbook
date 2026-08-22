/*
 * Trick detail page — /journey/tricks/:id
 * Gouache illustration hero, why-it-matters, step-by-step guide, pro tip,
 * live "times practiced" counter (Training Log matches), one-tap
 * "Log a practice" that writes a training entry, and recent practice list.
 */
import { useMemo, useState } from "react";
import { useRoute, Link } from "wouter";
import { PageShell, PageHeader, Eyebrow } from "@/components/AppShell";
import { useTrackerEntries, useAddTrackerEntry } from "@/hooks/useSyncedData";
import { getTrick, entryMatchesTrick, TRICKS } from "@/content/tricks";
import { todayISO, nowHM, friendlyDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { GraduationCap, Clock, Baby, Lightbulb, ChevronRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LEVEL_LABEL: Record<string, string> = {
  foundation: "Foundation",
  core: "Life skill",
  party: "Party trick",
};

export default function TrickDetail() {
  const [, params] = useRoute("/journey/tricks/:id");
  const trick = getTrick(params?.id ?? "");
  const { entries: trainingEntries } = useTrackerEntries("training");
  const addEntry = useAddTrackerEntry();
  const [justLogged, setJustLogged] = useState(false);

  const matches = useMemo(
    () => (trick ? trainingEntries.filter((e) => entryMatchesTrick(trick, e)) : []),
    [trick, trainingEntries],
  );

  if (!trick) {
    return (
      <PageShell className="pb-28">
        <PageHeader title="Trick not found" subtitle="This page has wandered off" emoji="🐾" back="/journey" />
        <section className="px-4 mt-6">
          <Link href="/journey" className="btn-ink inline-flex">
            Back to Journey <ChevronRight size={15} />
          </Link>
        </section>
      </PageShell>
    );
  }

  const count = matches.length;
  const next = TRICKS[(TRICKS.findIndex((t) => t.id === trick.id) + 1) % TRICKS.length];

  const logPractice = () => {
    addEntry.mutate(
      {
        trackerId: "training",
        date: todayISO(),
        time: nowHM(),
        option: trick.matchOptions[0] ?? "Tricks / fun",
        note: `${trick.name} practice`,
      },
      {
        onSuccess: () => {
          setJustLogged(true);
          toast.success(`Practice logged — that's ${count + 1} for ${trick.name}!`);
          setTimeout(() => setJustLogged(false), 2500);
        },
      },
    );
  };

  return (
    <PageShell className="pb-28">
      <PageHeader
        title={trick.name}
        subtitle={trick.tagline}
        emoji={trick.emoji}
        back="/journey"
      />

      {/* ===== Illustration hero ===== */}
      <section className="px-4 mt-4">
        <div className="keepsake-card overflow-hidden">
          <img
            src={trick.image}
            alt={`Gouache illustration showing how to train "${trick.name}" with Paddington`}
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-[#7B8C6A] bg-[#6B7C5A]/10 px-2 py-1 rounded-full">
              {LEVEL_LABEL[trick.level]}
            </span>
            <span className="ml-auto text-right">
              <span className="font-display font-bold text-[1.35rem] text-[#B4512E] leading-none">
                {count}
              </span>
              <span className="block text-[8px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                {count === 1 ? "time practiced" : "times practiced"}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ===== Log practice CTA ===== */}
      <section className="px-4 mt-3">
        <button
          onClick={logPractice}
          disabled={addEntry.isPending}
          className={cn(
            "w-full btn-ink justify-center py-3 text-[13px]",
            justLogged && "bg-[#6B7C5A] border-[#6B7C5A]",
          )}
        >
          {addEntry.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : justLogged ? (
            <>
              <Check size={15} /> Logged!
            </>
          ) : (
            <>
              <GraduationCap size={15} /> Log a practice session
            </>
          )}
        </button>
        <p className="text-center text-[10.5px] font-body text-muted-foreground mt-1.5">
          Counts every Training Log entry for “{trick.matchOptions[0] ?? "Tricks / fun"}”
          {trick.keywords.length > 0 && <> or notes mentioning “{trick.keywords[0]}”</>}
        </p>
      </section>

      {/* ===== Why + facts ===== */}
      <section className="px-4 mt-5">
        <div className="keepsake-card p-4">
          <Eyebrow className="mb-2">Why it matters</Eyebrow>
          <p className="text-[13px] font-body text-[#33475C] leading-relaxed">{trick.why}</p>
          <dl className="mt-3.5 space-y-2 border-t border-dashed border-[#E5DAC8] pt-3.5">
            <div className="flex gap-2.5 items-start">
              <Baby size={14} className="text-[#C66A3D] shrink-0 mt-0.5" />
              <div>
                <dt className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#C66A3D]">
                  When to start
                </dt>
                <dd className="text-[12px] font-body text-[#33475C] leading-snug mt-0.5">
                  {trick.startAge}
                </dd>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <Clock size={14} className="text-[#C66A3D] shrink-0 mt-0.5" />
              <div>
                <dt className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#C66A3D]">
                  Session length
                </dt>
                <dd className="text-[12px] font-body text-[#33475C] leading-snug mt-0.5">
                  {trick.sessionLength}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* ===== Steps ===== */}
      <section className="px-4 mt-5">
        <Eyebrow className="px-1 mb-2.5">How to train it</Eyebrow>
        <div className="space-y-2.5">
          {trick.steps.map((s, i) => (
            <div key={s.title} className="sticker-card px-4 py-3.5 flex gap-3">
              <span className="w-7 h-7 rounded-full bg-[#22364D]/6 flex items-center justify-center font-display font-bold text-[13px] text-[#C66A3D] shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-body font-bold text-[13px] leading-snug text-[#22364D]">
                  {s.title}
                </p>
                <p className="text-[12px] font-body text-[#5A6B7E] leading-relaxed mt-1">
                  {s.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Pro tip ===== */}
      <section className="px-4 mt-4">
        <div className="keepsake-card relative p-4 pl-11">
          <Lightbulb size={16} className="absolute left-4 top-4 text-[#C66A3D]" />
          <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-[#C66A3D]">
            Pro tip
          </p>
          <p className="text-[12.5px] font-body text-[#33475C] leading-relaxed mt-1">
            {trick.proTip}
          </p>
        </div>
      </section>

      {/* ===== Recent practice ===== */}
      {matches.length > 0 && (
        <section className="px-4 mt-5">
          <Eyebrow className="px-1 mb-2.5">Recent practice</Eyebrow>
          <div className="keepsake-card divide-y divide-dashed divide-[#E5DAC8]">
            {matches.slice(0, 6).map((e) => (
              <div key={e.id} className="px-4 py-2.5 flex items-center gap-3">
                <Check size={13} className="text-[#6B7C5A] shrink-0" />
                <span className="text-[12px] font-body font-bold text-[#22364D]">
                  {friendlyDate(e.date)}
                </span>
                {e.time && (
                  <span className="text-[11px] font-body text-muted-foreground">{e.time}</span>
                )}
                {e.value && (
                  <span className="ml-auto text-[11px] font-body font-extrabold text-[#B4512E]">
                    {e.value}/5
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Next trick ===== */}
      <section className="px-4 mt-6">
        <Link
          href={`/journey/tricks/${next.id}`}
          className="sticker-card px-4 py-3.5 flex items-center gap-3 press-scale"
        >
          <span className="text-[16px]">{next.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Next trick
            </span>
            <span className="block font-body font-bold text-[13px] text-[#22364D]">{next.name}</span>
          </span>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </Link>
      </section>
    </PageShell>
  );
}

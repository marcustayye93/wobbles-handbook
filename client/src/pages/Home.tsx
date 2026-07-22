/*
 * Storybook Picture-Book theme — Home page.
 * A scrapbook cover: Wobbles' photo on a chestnut blob, live age ticker,
 * countdowns, "right now" guidance driven by his real age, quick links.
 */
import { Link } from "wouter";
import { PageShell, PawDivider, StatChip } from "@/components/AppShell";
import { ASSETS, WOBBLES, MILESTONES, wobblesAge, daysUntil, formatDate } from "@/content/wobbles";
import { SECTIONS } from "@/content/handbookSections";
import { BookOpen, ClipboardList, Plane, ChevronRight, Sparkles, PawPrint } from "lucide-react";

/** Age-driven "right now" guidance */
function currentGuidance(): { title: string; text: string; link: string; linkLabel: string } {
  const age = wobblesAge();
  const toHome = daysUntil(WOBBLES.homecoming);
  if (!age.born)
    return {
      title: "Counting down to Wobbles",
      text: "He hasn't been born yet — use this time to read the handbook and prepare the house.",
      link: "/handbook/checklists",
      linkLabel: "Puppy arrival checklist",
    };
  if (toHome > 0)
    return {
      title: "He's with his breeder mum",
      text: `Wobbles is ${age.weeks} weeks old, growing up with his litter at The Doghouse QLD. Perfect time to puppy-proof, shop the kit list and read the first-day guide.`,
      link: "/handbook/first-day",
      linkLabel: "Read: The First Day & Night",
    };
  if (age.weeks < 16)
    return {
      title: "Socialisation window is OPEN",
      text: `At ${age.weeks} weeks, every calm new sight, sound and surface is building his adult brain. One tiny new experience a day — log them in the tracker.`,
      link: "/trackers/social",
      linkLabel: "Open socialisation tracker",
    };
  if (age.months < 6)
    return {
      title: "Adolescent brain, baby coat",
      text: `${age.months} months old — keep training sessions short and keep brushing daily so the brush stays a friend before the coat change hits.`,
      link: "/handbook/grooming-psychology",
      linkLabel: "Grooming psychology",
    };
  if (age.months < 12)
    return {
      title: "Coat change season",
      text: `Between 6–12 months the adult fleece coat comes in and matting peaks. Daily line brushing, shorter cuts, and patience.`,
      link: "/handbook/coat-science",
      linkLabel: "Read: Coat Science",
    };
  return {
    title: "All grown up (mostly)",
    text: "Keep the routines: brush most days, groom every 4–6 weeks, and log health notes in the trackers.",
    link: "/trackers",
    linkLabel: "Open trackers",
  };
}

export default function Home() {
  const age = wobblesAge();
  const toHome = daysUntil(WOBBLES.homecoming);
  const toSg = daysUntil("2026-09-18");
  const guide = currentGuidance();
  const nextMilestones = MILESTONES.filter((m) => daysUntil(m.date) >= 0).slice(0, 3);

  return (
    <PageShell>
      {/* Cover */}
      <section className="relative pt-10 pb-2 px-5 overflow-hidden">
        {/* chestnut blob behind photo */}
        <div
          className="absolute -top-16 -right-20 w-72 h-72 opacity-[0.16]"
          style={{
            background: "oklch(0.52 0.115 45)",
            borderRadius: "58% 42% 55% 45% / 45% 58% 42% 55%",
          }}
          aria-hidden
        />
        <div
          className="absolute top-40 -left-24 w-56 h-56 opacity-[0.10]"
          style={{
            background: "oklch(0.72 0.11 60)",
            borderRadius: "45% 55% 48% 52% / 55% 45% 55% 45%",
          }}
          aria-hidden
        />
        <p className="relative text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary flex items-center gap-1.5 fade-up">
          <PawPrint size={13} /> The Family Handbook
        </p>
        <h1 className="relative font-display font-black text-[2.4rem] leading-[1.05] mt-2 fade-up" style={{ animationDelay: "40ms" }}>
          Wobbles’
          <br />
          <span className="italic text-primary">Handbook</span>
        </h1>
        <p className="relative text-sm text-muted-foreground mt-2.5 leading-relaxed max-w-[19rem] fade-up" style={{ animationDelay: "80ms" }}>
          Everything for one very good red-parti Cavoodle — from first night to Singapore.
        </p>

        {/* Photo card, tilted like taped-in */}
        <div className="relative mt-6 fade-up" style={{ animationDelay: "120ms" }}>
          <div className="absolute -inset-2 bg-primary/10 rounded-[2rem] rotate-[1.5deg]" aria-hidden />
          <img
            src={ASSETS.photoFace}
            alt="Cartoon sketch of Wobbles the red-parti Cavoodle puppy"
            className="relative w-full aspect-[4/3] object-cover rounded-[1.8rem] border-2 border-card shadow-lg -rotate-[0.6deg]"
          />
          <span className="absolute bottom-3 left-3 bg-card/92 backdrop-blur px-3 py-1.5 rounded-full text-xs font-extrabold border border-border">
            🐶 Wobbles, {age.born ? `${age.weeks}w ${age.remDays}d old` : "coming soon"}
          </span>
        </div>

        {/* Stat chips */}
        <div className="relative grid grid-cols-3 gap-2.5 mt-5 fade-up" style={{ animationDelay: "160ms" }}>
          <StatChip label="Born" value="26 Jun" />
          {toHome > 0 ? (
            <StatChip label="Days to homecoming" value={String(toHome)} />
          ) : (
            <StatChip label="Weeks old" value={String(age.weeks)} />
          )}
          {toSg > 0 ? <StatChip label="Days to fly-ready" value={String(toSg)} /> : <StatChip label="Adult weight" value="≈8 kg" />}
        </div>
      </section>

      {/* Right now guidance */}
      <section className="px-5 mt-6">
        <div className="sticker-card p-4 border-primary/25 bg-gradient-to-br from-card to-secondary/40">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-primary">
            <Sparkles size={13} /> Right now
          </p>
          <h2 className="font-display font-bold text-lg mt-1.5 leading-snug">{guide.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{guide.text}</p>
          <Link
            href={guide.link}
            className="inline-flex items-center gap-1 mt-3 text-sm font-extrabold text-primary press-scale"
          >
            {guide.linkLabel} <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <div className="px-5">
        <PawDivider />
      </div>

      {/* Quick tabs */}
      <section className="px-5 grid grid-cols-3 gap-2.5">
        {[
          { href: "/handbook", icon: BookOpen, label: "Handbook", note: "11 chapters" },
          { href: "/trackers", icon: ClipboardList, label: "Trackers", note: "8 logs" },
          { href: "/singapore", icon: Plane, label: "Singapore", note: "Move guide" },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href} className="sticker-card p-3.5 press-scale flex flex-col gap-2">
              <span className="w-9 h-9 rounded-2xl bg-primary/12 text-primary flex items-center justify-center">
                <Icon size={18} />
              </span>
              <span>
                <span className="block font-extrabold text-[13px]">{q.label}</span>
                <span className="block text-[11px] text-muted-foreground">{q.note}</span>
              </span>
            </Link>
          );
        })}
      </section>

      {/* Coming up milestones */}
      {nextMilestones.length > 0 && (
        <section className="px-5 mt-7">
          <h2 className="font-display font-bold text-xl mb-3">Coming up</h2>
          <div className="space-y-2.5">
            {nextMilestones.map((m) => (
              <div key={m.date} className="sticker-card px-4 py-3 flex items-center gap-3.5">
                <div className="shrink-0 text-center w-12">
                  <p className="font-display font-black text-lg text-primary leading-none">{daysUntil(m.date)}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">days</p>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[13px] leading-snug">{m.label}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(m.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured chapters */}
      <section className="px-5 mt-7">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-bold text-xl">Start reading</h2>
          <Link href="/handbook" className="text-xs font-extrabold text-primary">
            All chapters →
          </Link>
        </div>
        <div className="space-y-2.5">
          {SECTIONS.slice(0, 4).map((s, i) => (
            <Link
              key={s.slug}
              href={`/handbook/${s.slug}`}
              className="sticker-card px-4 py-3.5 flex items-center gap-3 press-scale"
              style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-[14px] leading-snug">{s.title}</span>
                <span className="block text-[11px] text-muted-foreground truncate">{s.tagline}</span>
              </span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="px-5 mt-8 text-center text-[11px] text-muted-foreground leading-relaxed">
        Made with 💛 for {WOBBLES.name} ({WOBBLES.pedigreeName}), born {formatDate(WOBBLES.dob)}.
        <br />
        All data stays on this device.
      </p>
    </PageShell>
  );
}

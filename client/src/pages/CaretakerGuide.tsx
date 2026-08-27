/*
 * Caretaker's Guide to Paddington — the handover template page.
 * Keepsake Field Guide style: paper bg, serif display, ink navy + sienna,
 * sticker cards. Renders CORE_DUTIES, the handover kit, and all structured
 * sections from caretakerGuide.ts. Values marked TBC show an amber
 * "To be confirmed" badge so the template is fillable at a glance.
 */
import { Link } from "wouter";
import { PageShell, Eyebrow, PawDivider } from "@/components/AppShell";
import {
  CORE_DUTIES,
  HANDOVER_KIT,
  GUIDE_SECTIONS,
  isTBC,
  tbcCount,
} from "@/content/caretakerGuide";
import { ASSETS, WOBBLES } from "@/content/wobbles";
import { ArrowLeft, HeartHandshake, Info } from "lucide-react";

function TBCBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#C9A24B] bg-[#FBF3DD] px-2 py-0.5 text-[9.5px] font-body font-extrabold uppercase tracking-[0.08em] text-[#8A6D1F]">
      To be confirmed
    </span>
  );
}

export default function CaretakerGuide() {
  const tbc = tbcCount();

  return (
    <PageShell className="pb-24">
      {/* Header */}
      <header className="px-5 pt-8">
        <Link
          href="/handbook"
          className="inline-flex items-center gap-1.5 text-[11px] font-body font-extrabold uppercase tracking-[0.14em] text-[#B4512E] press-scale"
        >
          <ArrowLeft size={13} /> Guides
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Eyebrow>The handover guide</Eyebrow>
            <h1 className="font-display font-semibold text-[2.2rem] leading-[1.04] text-[#22364D] mt-1.5">
              A Caretaker's Guide to Paddington
            </h1>
            <p className="text-[13px] font-body text-muted-foreground mt-2 leading-relaxed">
              Everything you need while {WOBBLES.name} stays at your place. Thank
              you for looking after our boy — you're officially family.
            </p>
          </div>
          <img
            src={ASSETS.v2SpotHighfive}
            alt=""
            aria-hidden
            className="w-20 h-20 object-contain shrink-0 mt-4"
          />
        </div>
      </header>

      {/* Template banner */}
      {tbc > 0 && (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-[#C9A24B] bg-[#FBF3DD] px-4 py-3 flex items-start gap-2.5">
          <Info size={15} className="text-[#8A6D1F] shrink-0 mt-0.5" />
          <p className="text-[12px] font-body text-[#6E571A] leading-relaxed">
            This is a living template — <strong>{tbc} details</strong> are still
            marked "To be confirmed". We'll fill every one in before handing
            Paddington over.
          </p>
        </div>
      )}

      {/* Core duties — the mission */}
      <section className="px-4 mt-6">
        <div className="keepsake-card relative p-5">
          <span className="absolute -top-3 left-4 bg-[#B4512E] text-[#FFFDF8] text-[9px] font-body font-extrabold uppercase tracking-[0.16em] px-2.5 py-1">
            Your three jobs
          </span>
          <p className="text-[12.5px] font-body text-[#5A6B7E] leading-relaxed mt-1">
            Strip everything else away and caretaking comes down to three
            things. If these are covered, you're doing brilliantly.
          </p>
          <div className="mt-4 space-y-3.5">
            {CORE_DUTIES.map((d, i) => (
              <div key={d.title} className="flex gap-3">
                <span className="shrink-0 w-9 h-9 rounded-2xl bg-[#22364D]/6 flex items-center justify-center text-[17px]">
                  {d.emoji}
                </span>
                <div className="min-w-0">
                  <p className="font-body font-bold text-[13.5px] text-[#22364D] leading-snug">
                    {i + 1}. {d.title}
                  </p>
                  <p className="text-[12px] font-body text-[#5A6B7E] leading-relaxed mt-0.5">
                    {d.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Handover kit */}
      <section className="px-4 mt-7">
        <Eyebrow className="mb-2.5 px-1">What we hand over with him</Eyebrow>
        <div className="space-y-2.5">
          {HANDOVER_KIT.map((k) => (
            <div key={k.name} className="sticker-card px-4 py-3.5 flex gap-3.5">
              <span className="shrink-0 w-11 h-11 rounded-2xl bg-[#7B8C6A]/15 flex items-center justify-center text-[19px]">
                {k.emoji}
              </span>
              <div className="min-w-0">
                <p className="font-body font-bold text-[13.5px] text-[#22364D] leading-snug">
                  {k.name}
                </p>
                <p className="text-[11.5px] font-body text-muted-foreground leading-relaxed mt-0.5">
                  {k.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PawDivider />

      {/* Structured sections */}
      <div className="px-4 space-y-7">
        {GUIDE_SECTIONS.map((s, si) => (
          <section key={s.id} id={s.id}>
            <div className="flex items-center gap-2.5 px-1 mb-2.5">
              <span className="text-[18px]">{s.emoji}</span>
              <div className="min-w-0">
                <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.16em] text-[#C66A3D]">
                  Section {si + 1}
                </p>
                <h2 className="font-display font-semibold text-[1.35rem] leading-tight text-[#22364D]">
                  {s.title}
                </h2>
              </div>
            </div>
            <p className="px-1 text-[12px] font-body text-[#5A6B7E] leading-relaxed mb-3">
              {s.intro}
            </p>
            <div className="keepsake-card p-4">
              <dl className="space-y-3.5">
                {s.items.map((it) => (
                  <div
                    key={it.label}
                    className="border-b border-dashed border-[#E5DAC8] last:border-0 pb-3.5 last:pb-0"
                  >
                    <dt className="text-[9.5px] font-body font-extrabold uppercase tracking-[0.12em] text-[#C66A3D]">
                      {it.label}
                    </dt>
                    <dd className="mt-1">
                      {isTBC(it.value) ? (
                        <TBCBadge />
                      ) : (
                        <p className="text-[12.5px] font-body text-[#33475C] leading-relaxed">
                          {it.value}
                        </p>
                      )}
                      {it.note && (
                        <p className="text-[11px] font-body text-muted-foreground leading-relaxed mt-1">
                          {it.note}
                        </p>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ))}
      </div>

      {/* Thank-you footer */}
      <section className="px-4 mt-8">
        <div className="sticker-card px-5 py-4 flex items-center gap-3.5">
          <HeartHandshake size={22} className="text-[#B4512E] shrink-0" />
          <p className="text-[12.5px] font-body text-[#33475C] leading-relaxed">
            Thank you for taking care of {WOBBLES.name}. Anything unclear, at any
            hour — message us. We'd always rather get ten "silly" questions than
            one worried guess.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

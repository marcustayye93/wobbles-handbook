/*
 * Keepsake Field Guide — SearchDialog.
 * Client-side global search across handbook chapters, checklists,
 * 100 Things and Singapore guide. Built on the cmdk CommandDialog.
 */
import { useMemo } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SECTIONS } from "@/content/handbookSections";
import { CHECKLISTS } from "@/content/checklists";
import { HUNDRED } from "@/content/hundredThings";
import { SG_FACTS, SG_STEPS, SG_TIPS } from "@/content/singapore";

interface SearchDoc {
  id: string;
  group: string;
  emoji: string;
  title: string;
  snippet: string;
  haystack: string; // lowercased searchable text
  link: string;
}

/** Flatten a handbook block union into plain text (best effort, type-safe-ish). */
function blockText(b: unknown): string {
  if (b == null || typeof b !== "object") return "";
  const o = b as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of ["text", "title", "label"]) {
    if (typeof o[key] === "string") parts.push(o[key] as string);
  }
  for (const key of ["items", "rows"]) {
    const v = o[key];
    if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "string") parts.push(item);
        else if (Array.isArray(item)) parts.push(item.filter((x) => typeof x === "string").join(" "));
        else if (item && typeof item === "object") {
          const io = item as Record<string, unknown>;
          for (const ik of ["text", "title", "label", "detail"]) {
            if (typeof io[ik] === "string") parts.push(io[ik] as string);
          }
        }
      }
    }
  }
  return parts.join(" ");
}

function buildIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // Handbook chapters — one doc per chapter (title/tagline + body text)
  for (const s of SECTIONS) {
    const body = s.blocks.map(blockText).join(" ");
    docs.push({
      id: `ch-${s.slug}`,
      group: "Handbook chapters",
      emoji: "📖",
      title: s.title,
      snippet: s.tagline,
      haystack: `${s.title} ${s.tagline} ${body}`.toLowerCase(),
      link: `/handbook/${s.slug}`,
    });
  }

  // Checklists — one doc per list, items searchable
  for (const c of CHECKLISTS) {
    docs.push({
      id: `cl-${c.id}`,
      group: "Checklists",
      emoji: c.emoji,
      title: c.title,
      snippet: `${c.items.length} items · ${c.cadence}`,
      haystack: `${c.title} ${c.items.join(" ")}`.toLowerCase(),
      link: "/handbook/checklists",
    });
  }

  // 100 Things — one doc per category
  for (const cat of HUNDRED) {
    docs.push({
      id: `h-${cat.id}`,
      group: "100 Things",
      emoji: cat.emoji,
      title: cat.title,
      snippet: `${cat.items.length} experiences`,
      haystack: `${cat.title} ${cat.items.join(" ")}`.toLowerCase(),
      link: "/handbook/100-things",
    });
  }

  // Singapore guide — one combined doc + one per step phase
  docs.push({
    id: "sg-overview",
    group: "Singapore move",
    emoji: "✈️",
    title: "Singapore relocation guide",
    snippet: "Requirements, timeline and tips",
    haystack: `singapore ${SG_FACTS.map((f) => `${f.label} ${f.value}`).join(" ")} ${SG_TIPS.join(" ")}`.toLowerCase(),
    link: "/singapore",
  });
  for (const step of SG_STEPS) {
    docs.push({
      id: `sg-${step.phase}-${step.title}`,
      group: "Singapore move",
      emoji: "🛂",
      title: step.title,
      snippet: `${step.phase} · ${step.timing}`,
      haystack: `singapore ${step.phase} ${step.title} ${step.timing} ${step.detail}`.toLowerCase(),
      link: "/singapore",
    });
  }

  return docs;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: Props) {
  const [, navigate] = useLocation();
  const docs = useMemo(buildIndex, []);
  const groups = useMemo(() => {
    const order = ["Handbook chapters", "Checklists", "100 Things", "Singapore move"];
    return order.map((g) => ({ name: g, docs: docs.filter((d) => d.group === g) }));
  }, [docs]);

  const go = (link: string) => {
    onOpenChange(false);
    navigate(link);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search the handbook">
      <CommandInput placeholder="Search chapters, checklists, tips…" />
      <CommandList className="pb-2">
        <CommandEmpty>Nothing found — try another word.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g.name} heading={g.name}>
            {g.docs.map((d) => (
              <CommandItem
                key={d.id}
                value={`${d.title} ${d.haystack.slice(0, 600)}`}
                onSelect={() => go(d.link)}
                className="gap-3"
              >
                <span className="text-[15px]">{d.emoji}</span>
                <span className="min-w-0">
                  <span className="block font-body font-bold text-[13px] leading-snug">{d.title}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">{d.snippet}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

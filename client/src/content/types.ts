/* Shared content block types for handbook sections */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "tip"; title: string; text: string }
  | { type: "warn"; title: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "img"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; source?: string }
  | { type: "bars"; title: string; items: { label: string; value: number; note?: string }[] }
  | { type: "timeline"; items: { when: string; title: string; text: string }[] };

export interface Section {
  slug: string;
  title: string;
  emoji: string;
  tagline: string;
  readMins: number;
  hero?: string;
  blocks: Block[];
}

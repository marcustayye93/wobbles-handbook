/*
 * Ask Wobbles — the family AI assistant, keepsake style.
 * Chat with a puppy-care assistant that knows Wobbles' profile and remembers
 * facts the family shares. Three surfaces on one page:
 *  - the chat thread (persisted server-side, family-shared)
 *  - a history sheet (past conversations, resumable/deletable)
 *  - a memory-book sheet ("What I've learned about Wobbles", forgettable)
 */
import { useEffect, useRef, useState } from "react";
import { PageShell, PageHeader, Eyebrow } from "@/components/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Sparkles,
  SendHorizonal,
  History,
  Brain,
  Trash2,
  PawPrint,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Starter prompts shown on an empty chat */
const STARTERS = [
  "What should we pack for his flight from Brisbane?",
  "How long can a young puppy hold his bladder?",
  "How do we puppy-proof an HDB flat?",
  "What's the best brushing routine for a fleece coat?",
];

const CATEGORY_EMOJI: Record<string, string> = {
  health: "🩺",
  training: "🎓",
  food: "🍽️",
  behaviour: "🐾",
  routine: "🗓️",
  grooming: "🪮",
  other: "📌",
};

interface LocalMsg {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  authorName?: string | null;
  pending?: boolean;
}

export default function Ask() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [optimistic, setOptimistic] = useState<LocalMsg[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);

  const messagesQuery = trpc.ai.messages.useQuery(
    { conversationId: conversationId ?? 0 },
    { enabled: conversationId != null },
  );
  const conversationsQuery = trpc.ai.conversations.useQuery(undefined, {
    enabled: historyOpen,
  });
  const memoryQuery = trpc.ai.memory.useQuery(undefined, { enabled: memoryOpen });

  const send = trpc.ai.send.useMutation({
    onSuccess: (res) => {
      setConversationId(res.conversationId);
      setOptimistic([]);
      utils.ai.messages.invalidate({ conversationId: res.conversationId });
      utils.ai.conversations.invalidate();
      if (res.learned.length > 0) {
        utils.ai.memory.invalidate();
        toast(`Remembered ${res.learned.length} new thing${res.learned.length === 1 ? "" : "s"} about Wobbles`, {
          icon: "🧠",
        });
      }
    },
    onError: (err) => {
      setOptimistic([]);
      toast.error(err.message || "Couldn't reach the assistant — your message wasn't lost, try again.");
    },
  });

  const deleteConvo = trpc.ai.deleteConversation.useMutation({
    onSuccess: () => {
      utils.ai.conversations.invalidate();
      toast("Conversation deleted");
    },
  });

  const forget = trpc.ai.forgetMemory.useMutation({
    onSuccess: () => utils.ai.memory.invalidate(),
  });

  const serverMsgs: LocalMsg[] = (messagesQuery.data ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    authorName: m.authorName,
  }));
  const thread = [...serverMsgs, ...optimistic];
  const busy = send.isPending;

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.length, busy]);

  const submit = (text?: string) => {
    const message = (text ?? draft).trim();
    if (!message || busy) return;
    setDraft("");
    setOptimistic([
      { id: `tmp-${Date.now()}`, role: "user", content: message, authorName: user?.name ?? null, pending: true },
    ]);
    send.mutate({ conversationId: conversationId ?? undefined, message });
  };

  const startNew = () => {
    setConversationId(null);
    setOptimistic([]);
    setDraft("");
  };

  const openConversation = (id: number) => {
    setConversationId(id);
    setOptimistic([]);
    setHistoryOpen(false);
  };

  return (
    <PageShell className="pb-0" hideNav>
      <PageHeader title="Ask Wobbles" subtitle="Puppy questions, answered for him" back="/" emoji="✨" />

      {/* Toolbar: new chat / history / memory */}
      <div className="px-4 pt-3 flex items-center gap-2">
        <button
          onClick={startNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FFFDF8] border border-[#E5DAC8] text-[11px] font-body font-extrabold text-[#22364D] press-scale"
        >
          <Plus size={13} className="text-[#C66A3D]" /> New chat
        </button>

        {/* History sheet */}
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FFFDF8] border border-[#E5DAC8] text-[11px] font-body font-extrabold text-[#22364D] press-scale">
              <History size={13} className="text-[#C66A3D]" /> History
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#F8F3EB] rounded-t-3xl max-h-[75vh] overflow-y-auto">
            <SheetHeader className="pb-1">
              <SheetTitle className="font-display text-[#22364D]">Past conversations</SheetTitle>
            </SheetHeader>
            <div className="space-y-2 pb-6 px-1">
              {conversationsQuery.isLoading && (
                <p className="text-[12px] font-body text-muted-foreground py-4 text-center">Loading…</p>
              )}
              {conversationsQuery.data?.length === 0 && (
                <p className="text-[12px] font-body text-muted-foreground py-4 text-center">
                  No conversations yet — every chat is saved here for the whole family.
                </p>
              )}
              {conversationsQuery.data?.map((c) => (
                <div key={c.id} className="sticker-card px-3.5 py-3 flex items-center gap-3">
                  <button onClick={() => openConversation(c.id)} className="min-w-0 flex-1 text-left press-scale">
                    <p className="font-body font-bold text-[13px] text-[#22364D] leading-snug truncate">{c.title}</p>
                    <p className="text-[11px] font-body text-muted-foreground truncate mt-0.5">
                      {c.preview || "(empty)"}
                    </p>
                    <p className="text-[9.5px] font-body font-semibold text-[#7B8C6A] mt-0.5">
                      {new Date(c.updatedAt).toLocaleString(undefined, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {c.createdByName ? ` · started by ${c.createdByName}` : ""}
                    </p>
                  </button>
                  <button
                    aria-label="Delete conversation"
                    onClick={() => {
                      deleteConvo.mutate({ conversationId: c.id });
                      if (conversationId === c.id) startNew();
                    }}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-[#B4512E] press-scale"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Memory book sheet */}
        <Sheet open={memoryOpen} onOpenChange={setMemoryOpen}>
          <SheetTrigger asChild>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#22364D] text-[#F8F3EB] text-[11px] font-body font-extrabold press-scale">
              <Brain size={13} className="text-[#E8935C]" /> Memory
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#F8F3EB] rounded-t-3xl max-h-[75vh] overflow-y-auto">
            <SheetHeader className="pb-1">
              <SheetTitle className="font-display text-[#22364D]">What I've learned about Wobbles</SheetTitle>
            </SheetHeader>
            <p className="text-[11.5px] font-body text-muted-foreground px-1 pb-2 leading-relaxed">
              Facts distilled from your chats, saved in Wobbles' own memory book and used to tailor every future
              answer. Tap the bin to make me forget one.
            </p>
            <div className="space-y-2 pb-6 px-1">
              {memoryQuery.isLoading && (
                <p className="text-[12px] font-body text-muted-foreground py-4 text-center">Loading…</p>
              )}
              {memoryQuery.data?.length === 0 && (
                <p className="text-[12px] font-body text-muted-foreground py-4 text-center">
                  Nothing yet — tell me about Wobbles in chat (his weight, favourite treats, quirks) and I'll
                  remember it here.
                </p>
              )}
              {memoryQuery.data?.map((m) => (
                <div key={m.id} className="sticker-card px-3.5 py-2.5 flex items-start gap-2.5">
                  <span className="text-[15px] shrink-0 mt-0.5">{CATEGORY_EMOJI[m.category] ?? "📌"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[12.5px] text-[#33475C] leading-snug">{m.fact}</p>
                    <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#C66A3D] mt-1">
                      {m.category}
                    </p>
                  </div>
                  <button
                    aria-label="Forget this fact"
                    onClick={() => forget.mutate({ id: m.id })}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-[#B4512E] press-scale"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Thread */}
      <div className="px-4 pt-4 pb-40 space-y-3">
        {thread.length === 0 && !busy && (
          <div className="pt-6">
            <div className="keepsake-card relative p-5 text-center">
              <span className="tape" aria-hidden />
              <Sparkles size={22} className="mx-auto text-[#C66A3D]" />
              <h2 className="font-display font-semibold text-[1.5rem] text-[#22364D] mt-2 leading-tight">
                Ask me anything about Wobbles
              </h2>
              <p className="text-[12.5px] font-body text-[#5A6B7E] leading-relaxed mt-1.5">
                I know his breed, age, coat and the move to Singapore — and I remember what you tell me, so my
                answers get more personal over time. Every conversation is saved for both of you.
              </p>
            </div>
            <Eyebrow className="mt-6 mb-2.5">Try asking</Eyebrow>
            <div className="space-y-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="w-full sticker-card px-4 py-3 text-left flex items-center gap-2.5 press-scale"
                >
                  <PawPrint size={13} className="text-[#C66A3D] shrink-0" />
                  <span className="text-[12.5px] font-body font-bold text-[#22364D] leading-snug">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {thread.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#22364D] text-[#F8F3EB] px-4 py-2.5 shadow-sm">
                {m.authorName && (
                  <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.12em] text-[#8FA0B5] mb-0.5">
                    {m.authorName}
                  </p>
                )}
                <p className="text-[13.5px] font-body leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            ) : (
              <div className="max-w-[92%] keepsake-card px-4 py-3">
                <p className="text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-[#C66A3D] mb-1 flex items-center gap-1">
                  <Sparkles size={10} /> Ask Wobbles
                </p>
                <div className="ai-answer text-[13.5px] font-body text-[#33475C] leading-relaxed">
                  <Streamdown>{m.content}</Streamdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="keepsake-card px-4 py-3 flex items-center gap-2.5">
              <Loader2 size={14} className="animate-spin text-[#C66A3D]" />
              <span className="text-[12.5px] font-body text-[#5A6B7E]">Thinking about Wobbles…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer — fixed above the safe area, nav hidden on this page */}
      <div
        className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-md z-50 px-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-end gap-2 bg-[#FFFDF8] border border-[#E5DAC8] rounded-[22px] px-3 py-2 shadow-[0_10px_30px_rgba(34,54,77,0.18)]"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask about Wobbles…"
            className="flex-1 resize-none bg-transparent outline-none text-[14px] font-body text-[#22364D] placeholder:text-muted-foreground py-1.5 max-h-28"
            style={{ minHeight: "34px" }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || busy}
            aria-label="Send"
            className={cn(
              "shrink-0 w-9 h-9 rounded-full flex items-center justify-center press-scale transition-colors",
              draft.trim() && !busy ? "bg-[#B4512E] text-[#FFFDF8]" : "bg-[#E5DAC8] text-[#A79C87]",
            )}
          >
            <SendHorizonal size={15} />
          </button>
        </form>
      </div>
    </PageShell>
  );
}

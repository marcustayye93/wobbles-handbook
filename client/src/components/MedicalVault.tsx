/*
 * U3 — Medical vault sections for the Health page:
 * Medicine cabinet (recurring meds with next-due chips + one-tap "Given today"),
 * Paper trail (vet documents filed in S3, upload sheet),
 * Symptom log (last 5 entries of the symptom tracker + quick-log).
 * Keepsake styling matches the rest of the app.
 */
import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Eyebrow } from "@/components/AppShell";
import { useTrackerEntries } from "@/hooks/useSyncedData";
import { formatDate } from "@/content/wobbles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Pill,
  FileText,
  Plus,
  Check,
  Loader2,
  Trash2,
  Archive,
  Paperclip,
  ExternalLink,
} from "lucide-react";

/* ============================================================
 * Client-side copy of the pure next-due maths (server/medical.ts)
 * ============================================================ */
interface MedShape {
  frequencyDays: number;
  startDate: string;
  endDate?: string | null;
  lastGivenDate?: string | null;
  active: number;
}

const DAY_MS = 86_400_000;
const parseISO = (d: string) => new Date(`${d}T00:00:00`);
const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function nextDueDate(med: MedShape, todayStr: string): string | null {
  if (!med.active) return null;
  const freq = Math.max(1, Math.round(med.frequencyDays || 1));
  let due: string;
  if (med.lastGivenDate) {
    due = toISO(new Date(parseISO(med.lastGivenDate).getTime() + freq * DAY_MS));
  } else {
    due = med.startDate <= todayStr ? todayStr : med.startDate;
  }
  if (med.endDate && due > med.endDate) return null;
  return due;
}

export function daysUntilDue(med: MedShape, todayStr: string): number | null {
  const due = nextDueDate(med, todayStr);
  if (!due) return null;
  return Math.round((parseISO(due).getTime() - parseISO(todayStr).getTime()) / DAY_MS);
}

export function dueChipLabel(med: MedShape, todayStr: string): string {
  const days = daysUntilDue(med, todayStr);
  if (days === null) return med.active ? "course ended" : "archived";
  if (days < -1) return `${-days} days overdue`;
  if (days === -1) return "1 day overdue";
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

const KIND_EMOJI: Record<string, string> = {
  parasite: "🛡️",
  heartworm: "❤️",
  prescription: "💊",
  supplement: "🌿",
  other: "🧴",
};

const KIND_OPTIONS = [
  { value: "parasite", label: "Parasite preventive" },
  { value: "heartworm", label: "Heartworm" },
  { value: "prescription", label: "Prescription" },
  { value: "supplement", label: "Supplement" },
  { value: "other", label: "Other" },
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  "vaccine-cert": "Vaccine certificate",
  "vet-report": "Vet report",
  "lab-result": "Lab result",
  insurance: "Insurance",
  licence: "Licence",
  prescription: "Prescription",
  receipt: "Receipt",
  other: "Other",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const FREQ_PRESETS = [
  { label: "Daily", days: 1 },
  { label: "Weekly", days: 7 },
  { label: "Fortnightly", days: 14 },
  { label: "Monthly", days: 30 },
  { label: "3-monthly", days: 91 },
  { label: "Yearly", days: 365 },
];

function todayLocalISO(): string {
  return toISO(new Date());
}

const inputCls =
  "w-full rounded-xl border border-[#E5DAC8] bg-[#FFFDF8] px-3 py-2.5 text-[13px] font-body text-[#22364D] placeholder:text-[#A99B82] focus:outline-none focus:ring-2 focus:ring-[#C66A3D]/40";
const labelCls =
  "block text-[9px] font-body font-extrabold uppercase tracking-[0.14em] text-[#7B8C6A] mb-1";

/* ============================================================
 * Medicine cabinet
 * ============================================================ */
function AddMedSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof KIND_OPTIONS)[number]["value"]>("parasite");
  const [dose, setDose] = useState("");
  const [freq, setFreq] = useState(30);
  const [startDate, setStartDate] = useState(todayLocalISO());
  const [note, setNote] = useState("");

  const add = trpc.medical.meds.add.useMutation({
    onSuccess: () => {
      utils.medical.meds.list.invalidate();
      toast.success("Added to the medicine cabinet");
      onOpenChange(false);
      setName("");
      setDose("");
      setNote("");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-[#F8F3EB] border-[#E5DAC8] max-h-[88vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-[#22364D]">Add a medication</SheetTitle>
          <SheetDescription className="font-body text-[12px]">
            Preventives, prescriptions and supplements — the cabinet tracks when each is next due.
          </SheetDescription>
        </SheetHeader>
        <div className="px-1 pb-6 space-y-3.5">
          <div>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NexGard Spectra"
            />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <div className="flex flex-wrap gap-1.5">
              {KIND_OPTIONS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => setKind(k.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-body font-bold border press-scale",
                    kind === k.value
                      ? "bg-[#22364D] text-[#FFFDF8] border-[#22364D]"
                      : "bg-[#FFFDF8] text-[#22364D] border-[#E5DAC8]",
                  )}
                >
                  {KIND_EMOJI[k.value]} {k.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Dose (optional)</label>
            <input
              className={inputCls}
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder='e.g. 1 chew (2–3.5 kg)'
            />
          </div>
          <div>
            <label className={labelCls}>How often</label>
            <div className="flex flex-wrap gap-1.5">
              {FREQ_PRESETS.map((f) => (
                <button
                  key={f.days}
                  type="button"
                  onClick={() => setFreq(f.days)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-body font-bold border press-scale",
                    freq === f.days
                      ? "bg-[#B4512E] text-[#FFFDF8] border-[#B4512E]"
                      : "bg-[#FFFDF8] text-[#22364D] border-[#E5DAC8]",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] font-body text-muted-foreground">
              Every {freq} day{freq === 1 ? "" : "s"}
            </p>
          </div>
          <div>
            <label className={labelCls}>Starts</label>
            <input
              type="date"
              className={inputCls}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Note (optional)</label>
            <input
              className={inputCls}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. give with food"
            />
          </div>
          <button
            type="button"
            disabled={!name.trim() || add.isPending}
            onClick={() =>
              add.mutate({
                name: name.trim(),
                kind,
                dose: dose.trim() || undefined,
                frequencyDays: freq,
                startDate,
                note: note.trim() || undefined,
              })
            }
            className="btn-ink w-full justify-center inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {add.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Add to cabinet
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MedicineCabinet() {
  const [now] = useState(() => new Date());
  const todayStr = toISO(now);
  const {
    data: meds,
    isLoading,
    isError: medsError,
    refetch: refetchMeds,
  } = trpc.medical.meds.list.useQuery(undefined, { retry: 2, retryDelay: 1500 });
  const utils = trpc.useUtils();
  const [addOpen, setAddOpen] = useState(false);

  const markGiven = trpc.medical.meds.markGiven.useMutation({
    onMutate: async ({ id, date }) => {
      await utils.medical.meds.list.cancel();
      const prev = utils.medical.meds.list.getData();
      utils.medical.meds.list.setData(undefined, (old) =>
        old?.map((m) => (m.id === id ? { ...m, lastGivenDate: date } : m)),
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) utils.medical.meds.list.setData(undefined, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: () => toast.success("Marked as given today"),
    onSettled: () => utils.medical.meds.list.invalidate(),
  });

  const archive = trpc.medical.meds.update.useMutation({
    onSuccess: () => {
      utils.medical.meds.list.invalidate();
      toast.success("Archived");
    },
    onError: (e) => toast.error(e.message),
  });

  const sorted = useMemo(() => {
    if (!meds) return [];
    const active = meds.filter((m) => m.active === 1);
    return [...active].sort((a, b) => {
      const da = daysUntilDue(a, todayStr);
      const db_ = daysUntilDue(b, todayStr);
      if (da === null && db_ === null) return a.name.localeCompare(b.name);
      if (da === null) return 1;
      if (db_ === null) return -1;
      return da - db_;
    });
  }, [meds, todayStr]);

  return (
    <section className="px-4 mt-7">
      <div className="flex items-baseline justify-between px-1 mb-2.5">
        <Eyebrow>Medicine cabinet</Eyebrow>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="text-[11px] font-body font-extrabold text-[#B4512E]"
        >
          + Add
        </button>
      </div>
      {isLoading ? (
        <p className="px-1 text-[12px] font-body text-muted-foreground">Opening the cabinet…</p>
      ) : medsError ? (
        <div className="sticker-card px-4 py-3.5 text-center">
          <p className="text-[12px] font-body text-[#5A6B7E] leading-relaxed">
            Couldn't reach the cabinet just now — usually a brief connection blip.
          </p>
          <button
            type="button"
            onClick={() => refetchMeds()}
            className="mt-2 text-[11px] font-body font-extrabold text-[#B4512E]"
          >
            Try again
          </button>
        </div>
      ) : sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map((m) => {
            const days = daysUntilDue(m, todayStr);
            const chip = dueChipLabel(m, todayStr);
            const urgent = days !== null && days <= 0;
            const givenToday = m.lastGivenDate === todayStr;
            return (
              <div key={m.id} className="sticker-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-[#3E6B9E]/10 flex items-center justify-center text-[16px]">
                    {KIND_EMOJI[m.kind] ?? "💊"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-body font-bold text-[#22364D] leading-snug">
                      {m.name}
                      {m.dose ? (
                        <span className="ml-1.5 font-normal text-[11px] text-muted-foreground">
                          {m.dose}
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-[10.5px] font-body text-muted-foreground leading-snug mt-0.5">
                      Every {m.frequencyDays} day{m.frequencyDays === 1 ? "" : "s"}
                      {m.lastGivenDate ? ` · last ${formatDate(m.lastGivenDate)}` : " · not given yet"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-1 rounded-full text-[9px] font-body font-extrabold uppercase tracking-[0.08em]",
                      urgent
                        ? "bg-[#B4512E]/12 text-[#B4512E]"
                        : "bg-[#6B7C5A]/12 text-[#6B7C5A]",
                    )}
                  >
                    {chip}
                  </span>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#E5DAC8] flex items-center gap-2">
                  <button
                    type="button"
                    disabled={givenToday || markGiven.isPending}
                    onClick={() => markGiven.mutate({ id: m.id, date: todayStr })}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-body font-bold press-scale border",
                      givenToday
                        ? "bg-[#6B7C5A]/12 text-[#6B7C5A] border-transparent"
                        : "bg-[#22364D] text-[#FFFDF8] border-[#22364D]",
                    )}
                  >
                    <Check size={12} strokeWidth={3} />
                    {givenToday ? "Given today" : "Given today?"}
                  </button>
                  {m.note && (
                    <span className="min-w-0 flex-1 truncate text-[10.5px] font-body text-muted-foreground">
                      {m.note}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Archive ${m.name}`}
                    onClick={() => archive.mutate({ id: m.id, active: 0 })}
                    className="ml-auto shrink-0 text-muted-foreground press-scale p-1"
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sticker-card px-4 py-4 text-center">
          <Pill size={18} className="mx-auto text-[#A99B82]" />
          <p className="mt-1.5 text-[12.5px] font-body text-[#5A6B7E] leading-relaxed">
            Nothing in the cabinet yet. Add his parasite preventive first — the app will nag you
            when a dose comes due, from puppyhood to his golden years.
          </p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="btn-ink mt-3 inline-flex items-center gap-1.5"
          >
            <Plus size={15} /> Add a medication
          </button>
        </div>
      )}
      <AddMedSheet open={addOpen} onOpenChange={setAddOpen} />
    </section>
  );
}

/* ============================================================
 * Paper trail (documents)
 * ============================================================ */
function UploadDocSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("vaccine-cert");
  const [recordDate, setRecordDate] = useState(todayLocalISO());
  const [note, setNote] = useState("");

  const upload = trpc.medical.records.upload.useMutation({
    onSuccess: () => {
      utils.medical.records.list.invalidate();
      toast.success("Filed in the paper trail");
      onOpenChange(false);
      setFile(null);
      setTitle("");
      setNote("");
    },
    onError: (e) => toast.error(e.message),
  });

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Max 8 MB — try a photo or compressed PDF");
      return;
    }
    setFile(f);
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  };

  const submit = async () => {
    if (!file || !title.trim()) return;
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    upload.mutate({
      title: title.trim(),
      category: category as never,
      recordDate,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      dataBase64: btoa(binary),
      note: note.trim() || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-[#F8F3EB] border-[#E5DAC8] max-h-[88vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-[#22364D]">File a document</SheetTitle>
          <SheetDescription className="font-body text-[12px]">
            Vaccine certs, vet reports, insurance — photos or PDFs up to 8 MB, kept forever.
          </SheetDescription>
        </SheetHeader>
        <div className="px-1 pb-6 space-y-3.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "w-full rounded-xl border-2 border-dashed px-4 py-5 text-center press-scale",
              file ? "border-[#6B7C5A] bg-[#6B7C5A]/8" : "border-[#D8CBB2] bg-[#FFFDF8]",
            )}
          >
            <Paperclip size={17} className="mx-auto text-[#7B8C6A]" />
            <span className="mt-1 block text-[12px] font-body font-bold text-[#22364D]">
              {file ? file.name : "Choose a photo or PDF"}
            </span>
            {file && (
              <span className="block text-[10px] font-body text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            )}
          </button>
          <div>
            <label className={labelCls}>Title</label>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. C3 vaccination certificate"
            />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-body font-bold border press-scale",
                    category === c.value
                      ? "bg-[#22364D] text-[#FFFDF8] border-[#22364D]"
                      : "bg-[#FFFDF8] text-[#22364D] border-[#E5DAC8]",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Document date</label>
            <input
              type="date"
              className={inputCls}
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Note (optional)</label>
            <input
              className={inputCls}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. microchip number on page 2"
            />
          </div>
          <button
            type="button"
            disabled={!file || !title.trim() || upload.isPending}
            onClick={submit}
            className="btn-ink w-full justify-center inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {upload.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            File it
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PaperTrail() {
  const {
    data: records,
    isLoading,
    isError: recordsError,
    refetch: refetchRecords,
  } = trpc.medical.records.list.useQuery(undefined, { retry: 2, retryDelay: 1500 });
  const utils = trpc.useUtils();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const remove = trpc.medical.records.remove.useMutation({
    onSuccess: () => {
      utils.medical.records.list.invalidate();
      toast.success("Removed");
    },
    onError: (e) => toast.error(e.message),
  });

  const sorted = useMemo(
    () => (records ? [...records].sort((a, b) => b.recordDate.localeCompare(a.recordDate)) : []),
    [records],
  );
  const shown = showAll ? sorted : sorted.slice(0, 6);

  return (
    <section className="px-4 mt-7">
      <div className="flex items-baseline justify-between px-1 mb-2.5">
        <Eyebrow>Paper trail</Eyebrow>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="text-[11px] font-body font-extrabold text-[#B4512E]"
        >
          + File a document
        </button>
      </div>
      {isLoading ? (
        <p className="px-1 text-[12px] font-body text-muted-foreground">Opening the folder…</p>
      ) : recordsError ? (
        <div className="sticker-card px-4 py-3.5 text-center">
          <p className="text-[12px] font-body text-[#5A6B7E] leading-relaxed">
            Couldn't open the folder just now — usually a brief connection blip.
          </p>
          <button
            type="button"
            onClick={() => refetchRecords()}
            className="mt-2 text-[11px] font-body font-extrabold text-[#B4512E]"
          >
            Try again
          </button>
        </div>
      ) : sorted.length > 0 ? (
        <>
          <div className="space-y-2">
            {shown.map((r) => (
              <div key={r.id} className="sticker-card px-4 py-2.5 flex items-center gap-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-[#B4512E]/8 flex items-center justify-center">
                  <FileText size={15} className="text-[#B4512E]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-body font-bold text-[#22364D] leading-snug truncate">
                    {r.title}
                  </span>
                  <span className="block text-[10.5px] font-body text-muted-foreground leading-snug">
                    {CATEGORY_LABEL[r.category] ?? r.category} · {formatDate(r.recordDate)}
                    {r.note ? ` · ${r.note}` : ""}
                  </span>
                </span>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${r.title}`}
                  className="shrink-0 text-[#3E6B9E] press-scale p-1"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  type="button"
                  aria-label={`Delete ${r.title}`}
                  onClick={() => {
                    if (window.confirm(`Delete "${r.title}" from the paper trail?`)) {
                      remove.mutate({ id: r.id });
                    }
                  }}
                  className="shrink-0 text-muted-foreground press-scale p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {sorted.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 px-1 text-[11px] font-body font-extrabold text-[#B4512E]"
            >
              {showAll ? "Show fewer" : `Show all ${sorted.length}`}
            </button>
          )}
        </>
      ) : (
        <div className="sticker-card px-4 py-4 text-center">
          <FileText size={18} className="mx-auto text-[#A99B82]" />
          <p className="mt-1.5 text-[12.5px] font-body text-[#5A6B7E] leading-relaxed">
            No documents filed yet. Vaccine certificates, AVS paperwork, vet reports — snap a photo
            and it lives here forever, findable at every vet visit for the next 15 years.
          </p>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="btn-ink mt-3 inline-flex items-center gap-1.5"
          >
            <Plus size={15} /> File the first document
          </button>
        </div>
      )}
      <UploadDocSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </section>
  );
}

/* ============================================================
 * Symptom log (last 5 + quick log)
 * ============================================================ */
export function SymptomLog({ onLog }: { onLog: () => void }) {
  const { entries, isLoading } = useTrackerEntries("symptom");
  const recent = useMemo(
    () =>
      [...entries]
        .sort((a, b) => (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? "")))
        .slice(0, 5),
    [entries],
  );

  return (
    <section className="px-4 mt-7">
      <div className="flex items-baseline justify-between px-1 mb-2.5">
        <Eyebrow>Symptom log</Eyebrow>
        <Link
          href="/trackers/symptom"
          className="text-[11px] font-body font-extrabold text-[#B4512E]"
        >
          Full diary →
        </Link>
      </div>
      {isLoading ? (
        <p className="px-1 text-[12px] font-body text-muted-foreground">Loading the diary…</p>
      ) : recent.length > 0 ? (
        <div className="sticker-card px-4 py-3 space-y-2.5">
          {recent.map((e) => (
            <div key={e.id} className="flex items-start gap-2.5">
              <span className="text-[14px] shrink-0 leading-snug">🩺</span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-body font-bold text-[#22364D] leading-snug">
                  {e.option ?? "Symptom"}
                </span>
                <span className="block text-[10.5px] font-body text-muted-foreground leading-snug">
                  {formatDate(e.date)}
                  {e.time ? ` · ${e.time}` : ""}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
              </span>
            </div>
          ))}
          <p className="pt-1 text-[10px] font-body text-muted-foreground border-t border-dashed border-[#E5DAC8]">
            A dated symptom diary is gold at the vet — patterns across days beat memory.
          </p>
        </div>
      ) : (
        <div className="sticker-card px-4 py-4 text-center">
          <p className="text-[12.5px] font-body text-[#5A6B7E] leading-relaxed">
            Nothing logged — that's a good thing. When something seems off (a limp, a skipped meal,
            an itchy ear), note it here the moment you spot it.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onLog}
        className="btn-ink mt-3 inline-flex items-center gap-1.5"
      >
        <Plus size={15} /> Log a symptom
      </button>
    </section>
  );
}

import { useMemo, useState } from "react";
import { PageShell, PageHeader } from "@/components/AppShell";
import { compressImage } from "@/components/PhotoJournal";
import { trpc } from "@/lib/trpc";
import { todayISO } from "@/lib/dates";
import { toast } from "sonner";

type Item = { id: string; file: File; preview: string; date: string; caption: string; status: "ready" | "uploading" | "done" | "failed"; error?: string };
function newId() { return crypto.randomUUID(); }

export default function ImportPhotos() {
  const utils = trpc.useUtils();
  const upload = trpc.photos.upload.useMutation();
  const [items, setItems] = useState<Item[]>([]);
  const [batchDate, setBatchDate] = useState(todayISO());
  const [batchCaption, setBatchCaption] = useState("");
  const pending = items.filter((i) => i.status !== "done");
  const failed = items.filter((i) => i.status === "failed");
  function addFiles(files: FileList | File[]) {
    const next: Item[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".heic")) continue;
      next.push({ id: newId(), file, preview: URL.createObjectURL(file), date: batchDate, caption: batchCaption, status: "ready" });
    }
    if (!next.length) { toast.message("No photos in that pick — zip is the secondary path below."); return; }
    setItems((prev) => [...prev, ...next]);
  }
  async function uploadOne(item: Item) {
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "uploading" } : p)));
    try {
      const compressed = await compressImage(item.file);
      await upload.mutateAsync({ fileName: item.file.name, mimeType: compressed.mimeType, dataBase64: compressed.dataBase64, caption: item.caption || undefined, date: item.date });
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "done" } : p)));
    } catch (err) {
      setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, status: "failed", error: err instanceof Error ? err.message : "Upload failed" } : p));
    }
  }
  async function uploadReady() {
    const queue = items.filter((i) => i.status === "ready" || i.status === "failed");
    for (const item of queue) await uploadOne(item);
    await utils.photos.list.invalidate();
    toast.success("Added to the album — nothing was replaced.");
  }
  const doneCount = useMemo(() => items.filter((i) => i.status === "done").length, [items]);
  return (
    <PageShell>
      <PageHeader title="Import photos" subtitle="Adds to the family album. Does not replace it." emoji="📷" />
      <section className="px-4 mt-3 space-y-3">
        <p className="text-[13px] font-body text-[#5A6B7E] leading-relaxed">
          Pick from Camera Roll. Every save <strong>appends</strong> to Memories. It does not wipe photos that are already there. Failed shots stay on this list so you can retry.
        </p>
        <label className="sticker-card block px-4 py-3">
          <span className="text-[11px] font-body font-extrabold uppercase tracking-[0.14em] text-[#22364D]/70">Batch date</span>
          <input type="date" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} className="mt-1 w-full bg-transparent text-[16px] font-body text-[#22364D]" />
        </label>
        <label className="sticker-card block px-4 py-3">
          <span className="text-[11px] font-body font-extrabold uppercase tracking-[0.14em] text-[#22364D]/70">Batch caption</span>
          <input value={batchCaption} onChange={(e) => setBatchCaption(e.target.value)} placeholder="Optional — applied to new picks" className="mt-1 w-full bg-transparent text-[16px] font-body text-[#22364D]" />
        </label>
        <label className="block min-h-[48px] rounded-2xl bg-[#22364D] text-[#F8F3EB] font-body font-extrabold text-center leading-[48px]">
          Choose from Camera Roll
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
        </label>
        <label className="block min-h-[44px] rounded-2xl border border-[#E2D6C6] text-[#22364D] font-body font-bold text-center leading-[44px] text-[13px]">
          Secondary: zip of photos
          <input type="file" accept=".zip,application/zip" className="hidden" onChange={() => toast.message("Unzip on the phone first, then multi-pick. Zip is secondary so failed shots can retry one by one.")} />
        </label>
        {items.length > 0 ? (
          <button type="button" onClick={uploadReady} className="w-full min-h-[48px] rounded-2xl bg-[#C66A3D] text-white font-body font-extrabold">Add {pending.length} to album</button>
        ) : null}
        <p className="text-[12px] font-body text-[#5A6B7E]">Queued {items.length} · added {doneCount} · retry {failed.length}</p>
        <div className="grid grid-cols-2 gap-2 pb-8">
          {items.map((item) => (
            <div key={item.id} className="sticker-card overflow-hidden">
              <img src={item.preview} alt="" className="w-full aspect-square object-cover" />
              <div className="px-2 py-2">
                <input value={item.caption} onChange={(e) => setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, caption: e.target.value } : p)))} className="w-full text-[12px] font-body bg-transparent" placeholder="Caption" />
                <input type="date" value={item.date} onChange={(e) => setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, date: e.target.value } : p)))} className="w-full text-[11px] font-body bg-transparent mt-1" />
                <p className="text-[11px] mt-1 font-body">{item.status === "failed" ? item.error : item.status}</p>
                {item.status === "failed" ? <button type="button" className="text-[12px] font-extrabold text-[#C66A3D]" onClick={() => uploadOne(item)}>Retry</button> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

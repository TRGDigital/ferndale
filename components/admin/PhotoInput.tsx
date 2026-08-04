"use client";

// A drop-in file input that optimises photos in the browser before the form
// submits. Vercel caps request bodies at ~4.5MB and phone photos are often
// bigger, so we downscale + re-encode client-side (also bakes in EXIF rotation,
// so sideways phone photos upload upright). Falls back to the original file if
// the browser can't decode it (e.g. HEIC), with a size warning.
import { useRef, useState } from "react";

const MAX_EDGE = 2000; // px, long edge — plenty for full-width display
const QUALITY = 0.82;
const PLATFORM_CAP = 4 * 1024 * 1024; // stay under Vercel's ~4.5MB body limit

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)}MB`;

export function PhotoInput({
  name = "file",
  required,
  accept = "image/*",
  className = "text-sm file:mr-3 file:rounded file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white",
}: {
  name?: string;
  required?: boolean;
  accept?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function optimise() {
    const input = inputRef.current;
    const file = input?.files?.[0];
    setNote(null);
    if (!input || !file || !/^image\//.test(file.type)) return;
    setBusy(true);
    try {
      // from-image applies the EXIF orientation, so the pixels come out upright.
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      ctx.drawImage(bmp, 0, 0, w, h);
      bmp.close();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", QUALITY),
      );
      if (!blob) throw new Error("encode failed");
      if (blob.size < file.size) {
        const renamed = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        const dt = new DataTransfer();
        dt.items.add(new File([blob], renamed, { type: "image/jpeg" }));
        input.files = dt.files;
        setNote({ tone: "ok", text: `Photo optimised: ${mb(file.size)} → ${mb(blob.size)}. Ready to upload.` });
      } else if (file.size > PLATFORM_CAP) {
        setNote({ tone: "warn", text: `This photo is ${mb(file.size)} and couldn't be made smaller — the upload may fail (limit ~4MB).` });
      }
    } catch {
      if (file.size > PLATFORM_CAP) {
        setNote({
          tone: "warn",
          text: `This photo is ${mb(file.size)} and this browser can't optimise it (limit ~4MB). Try saving it as a JPG first.`,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex flex-col gap-1">
      <input ref={inputRef} type="file" name={name} accept={accept} required={required} onChange={optimise} className={className} />
      {busy ? <span className="text-xs text-neutral-400">Optimising photo…</span> : null}
      {note ? (
        <span className={`text-xs ${note.tone === "ok" ? "text-green-600" : "text-amber-600"}`}>{note.text}</span>
      ) : null}
    </span>
  );
}

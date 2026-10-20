"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCsrfToken } from "@/lib/http/csrf";

interface MediaFile {
  url: string;
  name: string;
  size: number;
  modifiedAt: string;
}

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function MediaLibraryPicker({ value, onChange, label = "Featured Image" }: Props) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      } else setError("Failed to load media library");
    } catch {
      setError("Failed to load media library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadMedia();
  }, [open, loadMedia]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-csrf-token": getCsrfToken() },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        await loadMedia();
      } else setError("Upload failed");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onChange, loadMedia]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
    e.target.value = "";
  };

  const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div>
      <label className="block text-sm font-medium text-white/90">{label}</label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-primary/30 bg-deep/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Featured" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-deep/50 text-xs text-white/40">
            No image
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
          >
            {open ? "Close Library" : "Choose from Library"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/10 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload New"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-left text-xs text-red-400 transition hover:text-red-300"
            >
              Remove image
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {open && (
        <div className="mt-3 rounded-xl border border-primary/20 bg-deep/50 p-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-white/50">Loading media library...</div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/50">No images yet. Upload one to get started.</div>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
              {files.map((f) => (
                <button
                  key={f.url}
                  type="button"
                  onClick={() => { onChange(f.url); setOpen(false); }}
                  className={`group relative aspect-square overflow-hidden rounded-lg border transition ${
                    value === f.url ? "border-primary ring-2 ring-primary/40" : "border-primary/20 hover:border-primary/60"
                  }`}
                  title={f.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-deep/80 px-1 py-0.5 text-[9px] text-white/70">
                    {fmt(f.size)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
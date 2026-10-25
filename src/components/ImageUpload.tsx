"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { UploadCloud, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { uploadImage } from "@/lib/upload";

/**
 * Komponen upload gambar — drag & drop atau klik pilih file.
 * Otomatis unggah ke Supabase Storage lalu kirim URL ke parent.
 */
export function ImageUpload({
  value,
  onChange,
  label = "Foto",
  hint = "JPG, PNG, WEBP, atau GIF · maksimal 5 MB",
  required = false,
  ratio = "16 / 10",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  required?: boolean;
  ratio?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // validasi cepat di client
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`Ukuran ${(file.size / 1024 / 1024).toFixed(1)} MB — maksimal 5 MB.`);
        return;
      }

      start(async () => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadImage(fd);

        if (!res.ok) {
          setError(res.error);
          return;
        }
        onChange(res.url);
      });
    },
    [onChange]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  }

  const hasImage = Boolean(value);

  return (
    <div className="iq-adm-field">
      <label>
        {label}
        {required && <span className="req">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onPick}
        style={{ display: "none" }}
      />

      {hasImage ? (
        /* ---------- PREVIEW ---------- */
        <div className="iq-up__preview" style={{ aspectRatio: ratio }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" />

          <div className="iq-up__overlay">
            <button
              type="button"
              className="iq-up__ovbtn"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
            >
              <UploadCloud size={15} /> Ganti
            </button>
            <button
              type="button"
              className="iq-up__ovbtn iq-up__ovbtn--del"
              onClick={() => onChange("")}
              disabled={pending}
            >
              <X size={15} /> Hapus
            </button>
          </div>

          {pending && (
            <div className="iq-up__loading">
              <Loader2 size={22} className="iq-spin" />
            </div>
          )}
        </div>
      ) : (
        /* ---------- DROPZONE ---------- */
        <div
          className={`iq-up__zone ${dragging ? "is-drag" : ""} ${pending ? "is-busy" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !pending && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          {pending ? (
            <>
              <Loader2 size={26} className="iq-spin" />
              <strong>Mengunggah…</strong>
              <span>Mohon tunggu sebentar</span>
            </>
          ) : (
            <>
              <div className="iq-up__ico">
                <ImageIcon size={22} />
              </div>
              <strong>Klik untuk pilih foto</strong>
              <span>atau seret file ke sini</span>
              <em>{hint}</em>
            </>
          )}
        </div>
      )}

      {error && (
        <span className="iq-up__err">
          <AlertCircle size={14} /> {error}
        </span>
      )}
    </div>
  );
}

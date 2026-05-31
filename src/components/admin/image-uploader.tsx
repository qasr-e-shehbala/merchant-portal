"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { addProductImageAction, deleteProductImageAction } from "@/server/catalog/mutations";

interface ExistingImage {
  id: string;
  r2Key: string;
  alt: string;
  sortOrder: number;
}

interface ImageUploaderProps {
  productId: string;
  images: ExistingImage[];
}

export function ImageUploader({ productId, images: initialImages }: ImageUploaderProps) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // 1. Get presigned URL from server
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          productId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      const { uploadUrl, r2Key, note } = await res.json() as {
        uploadUrl: string | null;
        r2Key: string;
        note?: string;
      };

      if (uploadUrl) {
        // 2. Upload directly to R2
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!putRes.ok) throw new Error("Upload to storage failed");
      }

      // 3. Default alt text from filename (editable later)
      const defaultAlt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      await addProductImageAction(productId, r2Key, defaultAlt, images.length);

      setImages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), r2Key, alt: defaultAlt, sortOrder: prev.length },
      ]);

      if (note) setError(`Note: ${note}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    await deleteProductImageAction(imageId, productId);
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <div className="space-y-4">
      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 p-2 text-center leading-tight">
                {img.r2Key.split("/").pop()}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Delete image"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <p className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                {img.alt}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          id="image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-colors hover:border-royal hover:bg-royal/5"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" aria-hidden="true" />
              <p className="text-sm text-gray-500">Uploading…</p>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-gray-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-700">Click to upload a photo</p>
                <p className="text-xs text-gray-400">JPEG, PNG or WebP · max 10 MB</p>
              </div>
            </>
          )}
        </label>

        {!process.env.NEXT_PUBLIC_CF_IMAGES_URL && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-3 py-2">
            R2 not configured — images will be tracked but not displayed until you add CLOUDFLARE_R2_* and NEXT_PUBLIC_CF_IMAGES_URL to your Vercel environment.
          </p>
        )}

        {error && (
          <p className={`mt-2 text-xs rounded px-3 py-2 ${error.startsWith("Note") ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

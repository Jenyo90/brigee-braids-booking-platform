"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useBookingStore } from "@/store/bookingStore";
import { Button } from "@/components/ui/button";

export function PhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { inspirationPhotos, addInspirationPhoto, removeInspirationPhoto } = useBookingStore();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Each photo must be under 10MB");
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `inspiration/${user?.id ?? "guest"}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("inspiration-photos")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError("Upload failed. Please try again.");
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("inspiration-photos")
        .getPublicUrl(path);

      addInspirationPhoto(urlData.publicUrl);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      {/* Upload area */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-[--color-border] hover:border-[--color-gold] transition-colors p-8 text-center group"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-[--color-gold] animate-spin" />
            <p className="text-sm text-[--color-on-dark-muted]">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-8 w-8 text-[--color-on-dark-muted] group-hover:text-[--color-gold] transition-colors" />
            <div>
              <p className="text-sm font-medium">Tap to upload inspiration photos</p>
              <p className="text-xs text-[--color-on-dark-muted] mt-1">JPEG, PNG, WEBP up to 10MB each</p>
            </div>
          </div>
        )}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {/* Preview grid */}
      {inspirationPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {inspirationPhotos.map((url) => (
            <div key={url} className="relative aspect-square">
              <Image src={url} alt="Inspiration" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeInspirationPhoto(url)}
                className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-0.5 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

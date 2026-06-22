// src/components/admin/ImageUploader.jsx
import { useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

const BUCKET = "content-images";

export default function ImageUploader({ value, onChange, folder = "misc" }) {
  const inputRef  = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const ext  = file.name.split(".").pop().toLowerCase();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setError("Error al subir: " + upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    e.target.value = "";
  };

  const quitar = () => onChange("");

  return (
    <div className="flex flex-col gap-2">
      {/* Preview */}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-dark-600" style={{ height: 160 }}>
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-contain cursor-pointer bg-dark-700"
            onClick={() => window.open(value, "_blank")}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <button
            type="button"
            onClick={quitar}
            className="absolute top-2 right-2 bg-[rgba(0,0,0,0.6)] text-white text-xs px-2 py-1 rounded-lg hover:bg-brand-red/80 transition-all"
          >
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-28 rounded-xl border-2 border-dashed border-dark-600 hover:border-brand-purple text-text-muted hover:text-brand-purple transition-all flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-xs">Subiendo…</span>
          ) : (
            <>
              <span className="text-2xl">🖼️</span>
              <span className="text-xs font-semibold">Clic para subir imagen</span>
              <span className="text-[10px] text-text-muted">JPG, PNG, WEBP · máx. 5 MB</span>
            </>
          )}
        </button>
      )}

      {/* Botón cambiar si ya hay imagen */}
      {value && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-text-muted hover:text-brand-purple transition-colors text-left"
        >
          Cambiar imagen
        </button>
      )}

      {uploading && value && (
        <span className="text-xs text-text-muted">Subiendo imagen…</span>
      )}

      {error && (
        <span className="text-xs text-brand-red">{error}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

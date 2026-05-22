import { useState, useRef, useCallback } from "react";
import { Upload, Camera, X, Image, Loader2 } from "lucide-react";
import { uploadImage, fileToDataUrl, resizeDataUrl } from "@/lib/api";

interface ImageUploadProps {
  entityType: string;                   // 'animal' | 'finca' | 'personal' | 'logo'
  entityId: string;                     // ID of the entity
  currentUrl?: string;                  // Current image dataURL or URL
  onUploaded?: (dataUrl: string) => void; // Called with dataUrl after upload
  size?: "sm" | "md" | "lg";
  label?: string;
  disabled?: boolean;
  shape?: "square" | "circle";
}

const SIZES = {
  sm: { container: "w-16 h-16",  icon: 14, text: "text-[9px]"  },
  md: { container: "w-24 h-24",  icon: 18, text: "text-[10px]" },
  lg: { container: "w-32 h-32",  icon: 22, text: "text-[11px]" },
};

export function ImageUpload({
  entityType, entityId, currentUrl, onUploaded,
  size = "md", label = "Foto", disabled = false, shape = "square",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sz = SIZES[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    try {
      // Resize to max 800×800 for preview + upload
      let dataUrl = await fileToDataUrl(file);
      if (dataUrl.length > 300_000) {
        dataUrl = await resizeDataUrl(dataUrl, 800, 800, 0.82);
      }
      setPreview(dataUrl);
      // Try to persist to API (fire-and-forget if offline)
      try {
        await uploadImage(file, entityType, entityId);
      } catch { /* offline — preview stays in state */ }
      onUploaded?.(dataUrl);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, onUploaded]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const clearImage = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setPreview(null);
    onUploaded?.("");
  };

  return (
    <div
      className={`relative ${sz.container} ${radius} cursor-pointer group select-none`}
      style={{
        border: dragOver
          ? "2px solid var(--plan-primary)"
          : preview
            ? "2px solid rgba(var(--plan-glow),0.35)"
            : "2px dashed rgba(var(--plan-glow),0.25)",
        background: preview ? "transparent" : "rgba(0,0,0,0.25)",
        transition: "all 0.2s",
        overflow: "hidden",
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
        disabled={disabled || loading}
      />

      {/* Current image */}
      {preview && !loading && (
        <img
          src={preview}
          alt={label}
          className={`w-full h-full object-cover ${radius}`}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 size={sz.icon} className="animate-spin" style={{ color: "var(--plan-primary)" }} />
        </div>
      )}

      {/* Empty state */}
      {!preview && !loading && (
        <div className="flex flex-col items-center justify-center h-full gap-1 opacity-60 group-hover:opacity-90 transition-opacity">
          {dragOver
            ? <Upload size={sz.icon} style={{ color: "var(--plan-primary)" }} />
            : <Camera size={sz.icon} className="text-slate-400" />
          }
          {size !== "sm" && (
            <span className={`${sz.text} text-slate-400`}>{label}</span>
          )}
        </div>
      )}

      {/* Hover overlay */}
      {preview && !loading && (
        <div className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 ${radius}`}>
          <Image size={sz.icon} className="text-white" />
          {size !== "sm" && <span className={`${sz.text} text-white`}>Cambiar</span>}
        </div>
      )}

      {/* Clear button */}
      {preview && !loading && !disabled && (
        <button
          onClick={clearImage}
          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Quitar foto"
        >
          <X size={10} className="text-white" />
        </button>
      )}
    </div>
  );
}

/** Compact inline version — shows image or icon in given size */
export function AnimalPhoto({
  foto, nombre, size = 40, className = "",
}: { foto?: string; nombre: string; size?: number; className?: string }) {
  const initials = nombre
    .split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase();

  if (foto) {
    return (
      <img
        src={foto}
        alt={nombre}
        className={`object-cover rounded-full ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      />
    );
  }

  const hue = (nombre.charCodeAt(0) + nombre.charCodeAt(1 % nombre.length)) % 360;

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white select-none ${className}`}
      style={{
        width: size, height: size, minWidth: size,
        background: `hsl(${hue},55%,30%)`,
        fontSize: Math.max(10, size * 0.32),
      }}
    >
      {initials || "🐄"}
    </div>
  );
}

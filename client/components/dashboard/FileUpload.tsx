import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  uploading: boolean;
  theme: string;
}

export function FileUpload({
  onFileSelected,
  uploading,
  theme,
}: FileUploadProps) {
  const colors = getThemeColors(theme);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  return (
    <div
      className="rounded-xl border-2 p-10 text-center transition-all"
      style={{
        backgroundColor: dragActive ? colors.accentLight : colors.card,
        borderColor: dragActive ? colors.primary : colors.border,
        borderStyle: "dashed",
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        disabled={uploading}
        className="hidden"
        accept="*/*"
      />

      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: colors.accentLight,
          }}
        >
          <Upload
            className="w-8 h-8"
            style={{
              color: colors.primary,
            }}
          />
        </div>

        <div>
          <p
            className="font-semibold text-base"
            style={{
              color: colors.text,
            }}
          >
            {dragActive
              ? "Drop your file here"
              : "Click to upload or drag and drop"}
          </p>
          <p
            className="text-sm mt-1"
            style={{
              color: colors.textSecondary,
            }}
          >
            Any file type • Maximum 100MB • Secure cloud storage
          </p>
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: colors.accentLight,
            color: colors.primary,
          }}
        >
          {uploading ? "Uploading..." : "Browse Files"}
        </button>
      </div>
    </div>
  );
}

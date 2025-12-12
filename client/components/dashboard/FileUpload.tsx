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
      className="border p-6 text-center transition-colors"
      style={{
        backgroundColor: dragActive ? colors.accentLight : "transparent",
        borderColor: dragActive ? colors.primary : colors.border,
        borderStyle: dragActive ? "solid" : "dashed",
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

      <div className="flex flex-col items-center gap-3">
        <p
          className="text-sm"
          style={{
            color: colors.text,
          }}
        >
          {dragActive ? "Drop file here" : "Drag file or"}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="font-semibold ml-1 underline cursor-pointer disabled:opacity-50 hover:opacity-70"
            style={{
              color: colors.primary,
            }}
          >
            browse
          </button>
        </p>
        <p
          className="text-xs"
          style={{
            color: colors.textSecondary,
          }}
        >
          Max 100MB
        </p>
      </div>
    </div>
  );
}

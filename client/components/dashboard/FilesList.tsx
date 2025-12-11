import { Share2, Trash2, Download, Lock } from "lucide-react";
import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, getBytes } from "firebase/storage";
import { getThemeColors } from "@/lib/theme-colors";

interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  shared: boolean;
  shareUrl?: string;
  storagePath?: string;
}

interface FilesListProps {
  files: FileItem[];
  loading: boolean;
  theme: string;
  onShare: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onCopyShareLink: (url: string) => void;
}

export function FilesList({
  files,
  loading,
  theme,
  onShare,
  onDelete,
  onCopyShareLink,
}: FilesListProps) {
  const colors = getThemeColors(theme);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (file: FileItem) => {
    if (!file.storagePath) return;

    setDownloadingId(file.id);
    try {
      const fileRef = ref(storage, file.storagePath);
      const bytes = await getBytes(fileRef);
      const blob = new Blob([bytes]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyShare = (fileId: string, shareUrl?: string) => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(fileId);
      setTimeout(() => setCopiedId(null), 2000);
      onCopyShareLink(shareUrl);
    }
  };

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{
          borderColor: colors.border,
        }}
      >
        <h2 className="text-xl font-bold" style={{ color: colors.text }}>
          My Files {files.length > 0 && `(${files.length})`}
        </h2>
      </div>

      <div
        className="divide-y"
        style={{
          borderColor: colors.border,
        }}
      >
        {loading ? (
          <div className="px-6 py-8 text-center">
            <p
              style={{
                color: colors.textSecondary,
              }}
            >
              Loading files...
            </p>
          </div>
        ) : files.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p
              style={{
                color: colors.textSecondary,
              }}
            >
              No files yet. Upload one to get started!
            </p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="px-6 py-4 flex items-center justify-between hover:opacity-75 transition-opacity"
              style={{
                backgroundColor: colors.card,
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate"
                  style={{
                    color: colors.text,
                  }}
                  title={file.name}
                >
                  {file.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <p
                    className="text-sm"
                    style={{
                      color: colors.textSecondary,
                    }}
                  >
                    {file.size} • {file.uploadedAt}
                  </p>
                  {file.shared && (
                    <span
                      className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      style={{
                        backgroundColor: colors.accentLight,
                        color: colors.primary,
                      }}
                    >
                      <Lock className="w-3 h-3" />
                      Shared
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => handleDownload(file)}
                  disabled={downloadingId === file.id}
                  className="p-2 rounded hover:opacity-60 transition-opacity disabled:opacity-50"
                  title="Download file"
                  style={{
                    color: theme === "dark" ? "#60A5FA" : "#3B82F6",
                  }}
                >
                  {downloadingId === file.id ? (
                    <div
                      className="w-4 h-4 border-2 border-transparent rounded-full animate-spin"
                      style={{
                        borderTopColor: colors.primary,
                        borderRightColor: colors.primary,
                      }}
                    ></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
                {!file.shared ? (
                  <button
                    onClick={() => onShare(file.id)}
                    className="p-2 rounded hover:opacity-60 transition-opacity"
                    title="Share file"
                    style={{
                      color: colors.textSecondary,
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleCopyShare(file.id, file.shareUrl)}
                    className="p-2 rounded transition-opacity"
                    title="Copy share link"
                    style={{
                      color: colors.primary,
                    }}
                  >
                    {copiedId === file.id ? (
                      "✓"
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => onDelete(file.id)}
                  className="p-2 rounded hover:opacity-60 transition-opacity"
                  title="Delete file"
                  style={{
                    color: "#EF4444",
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

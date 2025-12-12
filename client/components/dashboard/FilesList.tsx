import {
  Share2,
  Trash2,
  Download,
  Lock,
  FileText,
  Image,
  Video,
  Archive,
  File,
} from "lucide-react";
import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, getBytes } from "firebase/storage";
import { getThemeColors } from "@/lib/theme-colors";
import { motion } from "framer-motion";

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

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const docs = ["pdf", "doc", "docx", "txt", "xlsx", "xls", "ppt", "pptx"];
  const imgs = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  const vids = ["mp4", "avi", "mkv", "mov", "wmv", "flv"];
  const archs = ["zip", "rar", "7z", "tar", "gz"];

  if (docs.includes(ext)) return { icon: FileText, color: "#3B82F6" };
  if (imgs.includes(ext)) return { icon: Image, color: "#8B5CF6" };
  if (vids.includes(ext)) return { icon: Video, color: "#EC4899" };
  if (archs.includes(ext)) return { icon: Archive, color: "#F59E0B" };
  return { icon: File, color: "#06B6D4" };
};

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (file: FileItem) => {
    if (!file.storagePath) {
      alert("File storage path not found. Please try again.");
      return;
    }

    setDownloadingId(file.id);

    // Retry configuration
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000; // 1 second

    const downloadWithRetry = async (retryCount = 0): Promise<Uint8Array> => {
      try {
        const fileRef = ref(storage, file.storagePath);

        // Configure timeout - increase max time for larger files
        const maxDownloadBytes = 500 * 1024 * 1024; // 500MB max
        const bytes = await getBytes(fileRef, maxDownloadBytes);

        return bytes;
      } catch (storageError) {
        const errorMsg =
          storageError instanceof Error
            ? storageError.message
            : String(storageError);
        console.error(`Download attempt ${retryCount + 1} failed:`, errorMsg);

        // Check if we should retry
        if (
          (errorMsg.includes("retry-limit-exceeded") ||
            errorMsg.includes("network") ||
            errorMsg.includes("timeout")) &&
          retryCount < MAX_RETRIES
        ) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = INITIAL_DELAY * Math.pow(2, retryCount);
          console.log(
            `Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`,
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          return downloadWithRetry(retryCount + 1);
        }

        // Check for common Firebase Storage errors
        if (
          errorMsg.includes("auth/unauthenticated") ||
          errorMsg.includes("permission-denied")
        ) {
          throw new Error("Access denied. Please try logging in again.");
        } else if (errorMsg.includes("storage/object-not-found")) {
          throw new Error(
            "File not found in storage. It may have been deleted.",
          );
        } else if (errorMsg.includes("retry-limit-exceeded")) {
          throw new Error(
            "Download timed out due to slow connection. Please check your internet and try again.",
          );
        } else if (errorMsg.includes("network")) {
          throw new Error(
            "Network error. Please check your connection and try again.",
          );
        } else {
          throw new Error(`Storage error: ${errorMsg}`);
        }
      }
    };

    try {
      // Download with retry logic
      const bytes = await downloadWithRetry();

      // Create blob with proper type
      const blob = new Blob([bytes], { type: "application/octet-stream" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name || "download";
      link.style.display = "none";

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to download file: ${errorMessage}`);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      <div
        className="px-6 py-5 border-b backdrop-blur-sm"
        style={{
          borderColor: colors.border,
          background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.sidebar}22 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            My Files
            {files.length > 0 && (
              <motion.span
                className="ml-2 px-3 py-1 rounded-full text-sm font-medium inline-block"
                style={{
                  backgroundColor: colors.accentLight,
                  color: colors.primary,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {files.length}
              </motion.span>
            )}
          </h2>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: colors.border }}>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 py-12 text-center"
          >
            <div className="inline-block">
              <div
                className="w-8 h-8 border-3 border-transparent rounded-full animate-spin"
                style={{
                  borderTopColor: colors.primary,
                  borderRightColor: colors.primary,
                }}
              ></div>
            </div>
            <p
              className="mt-4 text-sm"
              style={{
                color: colors.textSecondary,
              }}
            >
              Loading your files...
            </p>
          </motion.div>
        ) : files.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-6 py-12 text-center"
          >
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor: colors.accentLight,
              }}
            >
              <File className="w-8 h-8" style={{ color: colors.primary }} />
            </div>
            <p
              className="text-sm font-medium"
              style={{
                color: colors.text,
              }}
            >
              No files yet
            </p>
            <p
              className="text-xs mt-1"
              style={{
                color: colors.textSecondary,
              }}
            >
              Upload files to get started
            </p>
          </motion.div>
        ) : (
          <div className="space-y-1 p-2">
            {files.map((file, idx) => {
              const { icon: FileIcon, color } = getFileIcon(file.name);

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{
                    x: 4,
                  }}
                  className="px-4 py-3 rounded-lg flex items-center justify-between group transition-all hover:shadow-md"
                  style={{
                    backgroundColor: colors.sidebar,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {/* File Info */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${color}15`,
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FileIcon className="w-5 h-5" style={{ color }} />
                    </motion.div>

                    <div className="min-w-0">
                      <p
                        className="font-medium text-sm truncate"
                        style={{
                          color: colors.text,
                        }}
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p
                          className="text-xs"
                          style={{
                            color: colors.textSecondary,
                          }}
                        >
                          {file.size}
                        </p>
                        <span
                          style={{
                            color: colors.textTertiary,
                          }}
                        >
                          •
                        </span>
                        <p
                          className="text-xs"
                          style={{
                            color: colors.textSecondary,
                          }}
                        >
                          {file.uploadedAt}
                        </p>
                        {file.shared && (
                          <>
                            <span
                              style={{
                                color: colors.textTertiary,
                              }}
                            >
                              •
                            </span>
                            <motion.span
                              className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                              style={{
                                backgroundColor: "rgba(34, 197, 94, 0.15)",
                                color: "#22C55E",
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              ✓ Shared
                            </motion.span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-4 opacity-100 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor:
                          downloadingId === file.id
                            ? colors.accentLight
                            : "transparent",
                        color: colors.primary,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Download file"
                    >
                      {downloadingId === file.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </motion.button>

                    {!file.shared ? (
                      <motion.button
                        onClick={() => onShare(file.id)}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          color: colors.textSecondary,
                        }}
                        whileHover={{
                          scale: 1.05,
                          color: colors.primary,
                          backgroundColor: colors.accentLight,
                        }}
                        title="Share file"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => handleCopyShare(file.id, file.shareUrl)}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor:
                            copiedId === file.id
                              ? "rgba(34, 197, 94, 0.15)"
                              : "transparent",
                          color:
                            copiedId === file.id ? "#22C55E" : colors.primary,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Copy share link"
                      >
                        {copiedId === file.id ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            ✓
                          </motion.div>
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => {
                        setDeletingId(file.id);
                        onDelete(file.id);
                      }}
                      disabled={deletingId === file.id}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        color: "#EF4444",
                      }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete file"
                    >
                      {deletingId === file.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getThemeColors } from "@/lib/theme-colors";

interface UploadModalProps {
  isOpen: boolean;
  fileName: string;
  progress: number;
  stage: "validating" | "uploading" | "processing" | "complete" | "error";
  error?: string;
  onClose: () => void;
  theme: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit

const stageLabels = {
  validating: "Validating file...",
  uploading: "Uploading to cloud...",
  processing: "Processing file...",
  complete: "Upload complete!",
  error: "Upload failed",
};

const stageDescriptions = {
  validating: "Checking file integrity and permissions",
  uploading: "Transferring file to secure cloud storage",
  processing: "Finalizing and indexing your file",
  complete: "File is now available in your dashboard",
  error: "Please try again or contact support",
};

export function UploadModal({
  isOpen,
  fileName,
  progress,
  stage,
  error,
  onClose,
  theme,
}: UploadModalProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (stage !== "complete" && stage !== "error") {
      const timer = setTimeout(() => {
        setDisplayProgress(Math.min(progress, 99));
      }, 100);
      return () => clearTimeout(timer);
    } else if (stage === "complete") {
      setDisplayProgress(100);
    }
  }, [progress, stage]);

  if (!isOpen) return null;

  const colors = getThemeColors(theme);
  const isError = stage === "error";
  const isSuccess = stage === "complete";
  const isActive =
    stage === "uploading" || stage === "validating" || stage === "processing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: colors.border,
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>
            File Upload
          </h2>
          {!isActive && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-60 transition-opacity"
              style={{
                color: colors.textSecondary,
              }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Name */}
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{
                color: colors.textSecondary,
              }}
            >
              FILE NAME
            </p>
            <p
              className="font-medium truncate"
              style={{ color: colors.text }}
              title={fileName}
            >
              {fileName}
            </p>
          </div>

          {/* Status Icon and Message */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {isError ? (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                  }}
                >
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              ) : isSuccess ? (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center animate-bounce"
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                  }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <div
                    className="w-6 h-6 border-2 border-transparent rounded-full animate-spin"
                    style={{
                      borderTopColor: "#3B82F6",
                      borderRightColor: "#3B82F6",
                    }}
                  ></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p
                className="font-semibold"
                style={{
                  color: isError
                    ? "#EF4444"
                    : isSuccess
                      ? "#22C55E"
                      : theme === "dark"
                        ? "#60A5FA"
                        : "#3B82F6",
                }}
              >
                {stageLabels[stage]}
              </p>
              <p
                className="text-sm mt-1"
                style={{
                  color: theme === "dark" ? "#9CA3AF" : "#6B7280",
                }}
              >
                {stageDescriptions[stage]}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {isActive || isSuccess ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs font-medium"
                  style={{
                    color: colors.textSecondary,
                  }}
                >
                  PROGRESS
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: colors.primary,
                  }}
                >
                  {displayProgress}%
                </p>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{
                  backgroundColor: colors.accentLight,
                }}
              >
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${displayProgress}%`,
                    backgroundColor: isSuccess
                      ? "#22C55E"
                      : isError
                        ? "#EF4444"
                        : colors.primary,
                  }}
                ></div>
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {isError && error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}

          {/* Upload Stages Indicator */}
          {!isSuccess && !isError && (
            <div className="space-y-2">
              <p
                className="text-xs font-medium"
                style={{
                  color: colors.textSecondary,
                }}
              >
                STAGES
              </p>
              <div className="space-y-1">
                {(["validating", "uploading", "processing"] as const).map(
                  (s, idx) => (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-xs`}
                        style={{
                          borderColor:
                            stage === s
                              ? colors.primary
                              : [
                                    "validating",
                                    "uploading",
                                    "processing",
                                  ].indexOf(s as string) <
                                  [
                                    "validating",
                                    "uploading",
                                    "processing",
                                  ].indexOf(stage as string)
                                ? "#22C55E"
                                : colors.border,
                          backgroundColor:
                            stage === s
                              ? colors.primary
                              : [
                                    "validating",
                                    "uploading",
                                    "processing",
                                  ].indexOf(s as string) <
                                  [
                                    "validating",
                                    "uploading",
                                    "processing",
                                  ].indexOf(stage as string)
                                ? "#22C55E"
                                : "transparent",
                        }}
                      >
                        {["validating", "uploading", "processing"].indexOf(
                          s as string,
                        ) <
                        ["validating", "uploading", "processing"].indexOf(
                          stage as string,
                        ) ? (
                          <span style={{ color: "white", fontSize: "10px" }}>
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <span
                        className="text-sm"
                        style={{
                          color:
                            stage === s ? colors.text : colors.textSecondary,
                        }}
                      >
                        {stageLabels[s as keyof typeof stageLabels]}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isSuccess && (
          <div
            className="px-6 py-4 border-t"
            style={{
              borderColor: colors.border,
            }}
          >
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: colors.accentLight,
                color: colors.primary,
              }}
            >
              Done
            </button>
          </div>
        )}

        {isError && (
          <div
            className="px-6 py-4 border-t"
            style={{
              borderColor: colors.border,
            }}
          >
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: colors.accentLight,
                color: colors.primary,
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { MAX_FILE_SIZE };

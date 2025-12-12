import { X, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  theme: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  theme,
  loading = false,
}: ConfirmDialogProps) {
  const colors = getThemeColors(theme);

  if (!isOpen) return null;

  const Icon = isDangerous ? Trash2 : CheckCircle;
  const iconColor = isDangerous ? "#EF4444" : colors.primary;
  const iconBgColor = isDangerous
    ? "rgba(239, 68, 68, 0.1)"
    : `${colors.primary}15`;
  const confirmBgColor = isDangerous ? "#EF4444" : colors.accentLight;
  const confirmTextColor = isDangerous ? "white" : colors.primary;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 border-b"
          style={{
            borderColor: colors.border,
          }}
        >
          <div className="flex items-start gap-4 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: iconBgColor,
              }}
            >
              <Icon className="w-6 h-6" style={{ color: iconColor }} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-60 transition-opacity flex-shrink-0"
            style={{
              color: colors.textSecondary,
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {description && (
          <div className="px-6 py-4">
            <p
              className="text-sm"
              style={{
                color: colors.textSecondary,
              }}
            >
              {description}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="px-6 py-4 border-t space-y-3 flex flex-col-reverse"
          style={{
            borderColor: colors.border,
          }}
        >
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: confirmBgColor,
              color: confirmTextColor,
            }}
          >
            {loading ? "Processing..." : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-medium transition-all border disabled:opacity-50"
            style={{
              backgroundColor: "transparent",
              borderColor: colors.border,
              color: colors.textSecondary,
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

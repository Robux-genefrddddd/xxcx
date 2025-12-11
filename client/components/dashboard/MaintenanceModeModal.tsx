import { AlertTriangle } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";

interface MaintenanceModeModalProps {
  isOpen: boolean;
  message: string;
  theme: string;
  onClose: () => void;
}

export function MaintenanceModeModal({
  isOpen,
  message,
  theme,
  onClose,
}: MaintenanceModeModalProps) {
  const colors = getThemeColors(theme);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="rounded-lg p-8 max-w-md w-full mx-4 border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <div className="flex justify-center mb-4">
          <div
            className="p-3 rounded-full"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
            }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: "#EF4444" }} />
          </div>
        </div>

        <h2
          className="text-xl font-bold text-center mb-3"
          style={{ color: "#EF4444" }}
        >
          Maintenance Mode
        </h2>

        <p className="text-center mb-6" style={{ color: colors.text }}>
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: colors.accent,
            color: "#FFFFFF",
          }}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}

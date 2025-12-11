import { getThemeColors } from "@/lib/theme-colors";

interface MaintenanceModalProps {
  message: string;
  onDismiss: () => void;
}

export function MaintenanceModal({
  message,
  onDismiss,
}: MaintenanceModalProps) {
  const colors = getThemeColors("dark");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div
        className="rounded-lg p-8 max-w-md w-full border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          animation: "slideUp 0.4s ease-out",
        }}
      >
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "#EF4444" }}
        >
          Maintenance
        </h2>

        <p
          className="mb-6"
          style={{
            color: colors.text,
            lineHeight: "1.6",
          }}
        >
          {message}
        </p>

        <button
          onClick={onDismiss}
          className="w-full px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: colors.accent,
            color: "#FFFFFF",
          }}
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

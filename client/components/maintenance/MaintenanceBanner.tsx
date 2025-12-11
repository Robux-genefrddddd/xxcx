import { X } from "lucide-react";
import { useState } from "react";
import { getThemeColors } from "@/lib/theme-colors";

interface MaintenanceBannerProps {
  message: string;
}

export function MaintenanceBanner({ message }: MaintenanceBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const colors = getThemeColors("dark");

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between gap-4"
      style={{
        backgroundColor: "#EF4444",
        animation: "slideDown 0.4s ease-out",
      }}
    >
      <div className="flex-1">
        <p className="text-white font-medium text-sm">{message}</p>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="p-1 hover:opacity-80 transition-opacity"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
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

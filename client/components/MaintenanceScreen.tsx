import { useState, useEffect } from "react";
import { useMaintenanceMode } from "@/hooks/use-maintenance-mode";
import { getThemeColors } from "@/lib/theme-colors";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth-utils";
import { MaintenanceModal } from "@/components/maintenance/MaintenanceModal";
import { MaintenanceBanner } from "@/components/maintenance/MaintenanceBanner";

const ADMIN_BYPASS_KEY = "F12";

export function MaintenanceScreen() {
  const { isMaintenanceEnabled, maintenanceMessage, maintenanceMode } =
    useMaintenanceMode();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedModal, setDismissedModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setIsAdmin(role === "admin" || role === "founder");
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isMaintenanceEnabled) {
      setIsVisible(true);
    }
  }, [isMaintenanceEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAdmin && e.key === ADMIN_BYPASS_KEY) {
        e.preventDefault();
        setShowAdminPanel(!showAdminPanel);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdmin, showAdminPanel]);

  if (!isMaintenanceEnabled || !isVisible) {
    return null;
  }

  if (isAdmin && showAdminPanel) {
    return null;
  }

  const colors = getThemeColors("dark");

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-fade-in"
      style={{
        backgroundColor: colors.background,
        animation: "fadeIn 0.6s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <div className="text-center max-w-2xl">
        <h1
          className="text-5xl font-bold mb-6"
          style={{
            color: colors.text,
            animation: "slideUp 0.8s ease-out 0.1s both",
          }}
        >
          Maintenance
        </h1>

        <p
          className="text-xl"
          style={{
            color: colors.textSecondary,
            animation: "slideUp 0.8s ease-out 0.2s both",
            lineHeight: "1.8",
          }}
        >
          {maintenanceMessage}
        </p>
      </div>

      <style>{`
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

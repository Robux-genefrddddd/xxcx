import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MaintenanceConfig } from "@shared/api";

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  message: "The system is currently under maintenance. Please try again later.",
  mode: "fullscreen",
  lastUpdated: new Date().toISOString(),
};

export function useMaintenanceMode() {
  const [maintenanceConfig, setMaintenanceConfig] =
    useState<MaintenanceConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "appConfig", "maintenance"),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as MaintenanceConfig;
          setMaintenanceConfig({
            ...DEFAULT_CONFIG,
            ...data,
            mode: (data.mode || "fullscreen") as any,
          });
        } else {
          setMaintenanceConfig(DEFAULT_CONFIG);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading maintenance config:", error);
        setMaintenanceConfig(DEFAULT_CONFIG);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return {
    isMaintenanceEnabled: maintenanceConfig.enabled,
    maintenanceMessage: maintenanceConfig.message,
    maintenanceMode: maintenanceConfig.mode,
    loading,
  };
}

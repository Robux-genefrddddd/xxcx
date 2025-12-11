import { useState, useEffect } from "react";
import { AlertCircle, Save } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserRole, canToggleMaintenance } from "@/lib/auth-utils";

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
}

interface AdminMaintenanceModeProps {
  theme: string;
  userRole: UserRole;
}

export function AdminMaintenanceMode({
  theme,
  userRole,
}: AdminMaintenanceModeProps) {
  const colors = getThemeColors(theme);
  const [config, setConfig] = useState<MaintenanceConfig>({
    enabled: false,
    message:
      "The system is currently under maintenance. Please try again later.",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const configDoc = await getDoc(doc(db, "appConfig", "maintenance"));
      if (configDoc.exists()) {
        const data = configDoc.data();
        setConfig({
          enabled: data.enabled || false,
          message:
            data.message ||
            "The system is currently under maintenance. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error loading maintenance config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = () => {
    if (!canToggleMaintenance(userRole)) {
      alert("You don't have permission to toggle maintenance mode");
      return;
    }
    setConfig({ ...config, enabled: !config.enabled });
  };

  const handleMessageChange = (newMessage: string) => {
    setConfig({ ...config, message: newMessage });
  };

  const handleSave = async () => {
    if (!canToggleMaintenance(userRole)) {
      alert("You don't have permission to save maintenance settings");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "appConfig", "maintenance"), {
        enabled: config.enabled,
        message: config.message,
        lastUpdated: new Date().toISOString(),
      });
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving maintenance config:", error);
      setMessage("Failed to save settings");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!canToggleMaintenance(userRole)) {
    return (
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-1" style={{ color: "#EF4444" }} />
          <div>
            <h3 className="font-semibold" style={{ color: colors.text }}>
              Access Denied
            </h3>
            <p style={{ color: colors.textSecondary }} className="text-sm mt-1">
              Only founders can manage maintenance mode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold" style={{ color: colors.text }}>
        Maintenance Mode
      </h3>

      {/* Info Alert */}
      <div
        className="p-4 rounded-lg border flex items-start gap-3"
        style={{
          backgroundColor: config.enabled
            ? "rgba(239, 68, 68, 0.1)"
            : "rgba(59, 130, 246, 0.1)",
          borderColor: config.enabled
            ? "rgba(239, 68, 68, 0.3)"
            : "rgba(59, 130, 246, 0.3)",
        }}
      >
        <AlertCircle
          className="w-5 h-5 mt-0.5"
          style={{ color: config.enabled ? "#EF4444" : colors.primary }}
        />
        <div>
          <p className="font-semibold" style={{ color: colors.text }}>
            {config.enabled
              ? "Maintenance Mode is ACTIVE"
              : "Maintenance Mode is INACTIVE"}
          </p>
          <p style={{ color: colors.textSecondary }} className="text-sm mt-1">
            {config.enabled
              ? "Users will see the maintenance message when trying to access the system."
              : "System is running normally. Enable to notify users of maintenance."}
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <div
        className="flex items-center justify-between p-4 rounded-lg border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <div>
          <h4 className="font-semibold" style={{ color: colors.text }}>
            Enable Maintenance Mode
          </h4>
          <p style={{ color: colors.textSecondary }} className="text-sm mt-1">
            When enabled, users will see a maintenance message
          </p>
        </div>
        <button
          onClick={handleToggleMaintenance}
          className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
          style={{
            backgroundColor: config.enabled ? colors.accent : colors.sidebar,
          }}
        >
          <span
            className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
            style={{
              transform: config.enabled
                ? "translateX(28px)"
                : "translateX(2px)",
            }}
          />
        </button>
      </div>

      {/* Message Editor */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <label
          className="block font-semibold mb-3"
          style={{ color: colors.text }}
        >
          Maintenance Message
        </label>
        <textarea
          value={config.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          placeholder="Enter the message users will see during maintenance..."
          className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none resize-none"
          rows={4}
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.border,
            color: colors.text,
          }}
        />
        <p style={{ color: colors.textSecondary }} className="text-xs mt-2">
          This message will be displayed to all users when maintenance mode is
          enabled.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: colors.accent,
            color: "#FFFFFF",
          }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message && (
          <p
            className="text-sm"
            style={{
              color: message.includes("successfully") ? "#22C55E" : "#EF4444",
            }}
          >
            {message}
          </p>
        )}
      </div>

      {/* Preview */}
      {config.enabled && (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: colors.sidebar,
            borderColor: colors.border,
          }}
        >
          <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
            Preview
          </h4>
          <div
            className="p-4 rounded-lg border text-center"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.3)",
            }}
          >
            <AlertCircle
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: "#EF4444" }}
            />
            <h3 className="font-bold mb-2" style={{ color: "#EF4444" }}>
              Maintenance Mode
            </h3>
            <p style={{ color: colors.text }}>{config.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

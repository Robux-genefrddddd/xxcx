import { Link } from "react-router-dom";
import { Files, Users, Palette, LogOut, Shield } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getThemeColors } from "@/lib/theme-colors";
import { UserRole, canAccessAdmin } from "@/lib/auth-utils";

interface UserPlan {
  type: "free" | "premium";
  storageLimit: number;
  storageUsed: number;
}

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userEmail: string;
  theme: string;
  userPlan?: UserPlan;
  onUpgradeClick?: () => void;
  userRole?: UserRole;
}

const getNavItems = (userRole?: UserRole) => {
  const items = [
    { id: "files", label: "Files", icon: Files },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "theme", label: "Theme", icon: Palette },
  ];

  if (userRole && canAccessAdmin(userRole)) {
    items.push({ id: "admin", label: "Admin Panel", icon: Shield });
  }

  return items;
};

export function DashboardSidebar({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  theme,
  userPlan,
  onUpgradeClick,
  userRole,
}: DashboardSidebarProps) {
  const colors = getThemeColors(theme);
  const storageLimitMB = userPlan ? userPlan.storageLimit / (1024 * 1024) : 100;
  const storageUsedMB = userPlan ? userPlan.storageUsed / (1024 * 1024) : 0;
  const storagePercentage = userPlan
    ? (userPlan.storageUsed / userPlan.storageLimit) * 100
    : 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = getNavItems(userRole);

  return (
    <aside
      className="w-64 text-white p-6 flex flex-col fixed left-0 top-0 h-screen overflow-y-auto border-r"
      style={{
        backgroundColor: colors.sidebar,
        borderColor: colors.border,
        color: colors.sidebarForeground,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F91e2732f1c03487e879c66ee97e72712%2Fee08390eccc04e8dbea3ce5415d97e92?format=webp&width=800"
          alt="PinPinCloud"
          className="w-8 h-8"
        />
        <span
          className="text-lg font-bold"
          style={{ color: colors.sidebarForeground }}
        >
          PinPinCloud
        </span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left border-l-2"
              style={{
                backgroundColor: isActive ? colors.accentLight : "transparent",
                borderColor: isActive ? colors.primary : "transparent",
                color: isActive ? colors.accent : colors.textSecondary,
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info - Minimaliste */}
      <div
        className="mt-6 pt-4 border-t space-y-3"
        style={{ borderColor: colors.border }}
      >
        <div className="flex items-start gap-2">
          <div
            className="w-8 h-8 rounded text-xs flex items-center justify-center font-bold flex-shrink-0"
            style={{
              backgroundColor: colors.accentLight,
              color: colors.accent,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: colors.sidebarForeground }}
            >
              {userName}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: colors.textSecondary }}
            >
              {userEmail}
            </p>
          </div>
        </div>

        {/* Storage & Plan */}
        {userPlan && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: colors.textSecondary }}
              >
                Storage
              </p>
              <p
                className="text-xs font-semibold"
                style={{ color: colors.text }}
              >
                {storageUsedMB.toFixed(0)}MB
              </p>
            </div>
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{
                backgroundColor: colors.border,
              }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(storagePercentage, 100)}%`,
                  backgroundColor:
                    storagePercentage > 90
                      ? "#EF4444"
                      : storagePercentage > 70
                        ? "#F59E0B"
                        : colors.primary,
                }}
              />
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              {userPlan.type === "premium" ? "Premium" : "Free"}
            </p>
          </div>
        )}

        {userPlan && userPlan.type === "free" && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="w-full px-3 py-2 text-xs font-semibold transition-colors border"
            style={{
              backgroundColor: colors.accentLight,
              color: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Upgrade
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-xs transition-colors border flex items-center justify-center gap-2"
          style={{
            backgroundColor: "transparent",
            borderColor: colors.border,
            color: colors.textSecondary,
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

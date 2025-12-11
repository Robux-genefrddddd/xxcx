import { Link } from "react-router-dom";
import { Files, Users, Palette, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getThemeColors } from "@/lib/theme-colors";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userEmail: string;
  theme: string;
}

const navItems = [
  { id: "files", label: "Files", icon: Files },
  { id: "users", label: "Manage Users", icon: Users },
  { id: "theme", label: "Theme", icon: Palette },
];

export function DashboardSidebar({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  theme,
}: DashboardSidebarProps) {
  const colors = getThemeColors(theme);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        <div
          className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
          style={{
            backgroundColor: colors.primary,
            color: colors.primaryForeground,
          }}
        >
          PC
        </div>
        <span className="text-lg font-bold" style={{ color: colors.sidebarForeground }}>
          PinPinCloud
        </span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left"
              style={{
                backgroundColor: isActive ? colors.accentLight : "transparent",
                color: isActive ? colors.accent : colors.textSecondary,
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Card */}
      <div
        className="mt-6 p-4 rounded-lg border space-y-4"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
            style={{
              backgroundColor: colors.primary,
              color: colors.primaryForeground,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border font-medium"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.textSecondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              theme === "dark" ? "#FFFFFF" : "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              theme === "dark" ? "#9CA3AF" : "#6B7280";
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

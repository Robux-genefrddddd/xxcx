import { Moon, Sun, Palette } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";

interface ThemeSelectorProps {
  theme: string;
  onThemeChange: (theme: string) => void;
}

const themes = [
  {
    id: "dark",
    name: "Dark Mode",
    icon: Moon,
    description: "Professional dark theme for night viewing",
    colorPreview: "#0E0E0F",
  },
  {
    id: "light",
    name: "Light Mode",
    icon: Sun,
    description: "Soft light theme with pastel tones",
    colorPreview: "#FFFFFF",
  },
  {
    id: "blue",
    name: "Ocean Blue",
    icon: Palette,
    description: "Cool blue accent theme",
    colorPreview: "#0F172A",
  },
  {
    id: "purple",
    name: "Purple Dream",
    icon: Palette,
    description: "Modern purple accent theme",
    colorPreview: "#0F0B1D",
  },
  {
    id: "green",
    name: "Forest Green",
    icon: Palette,
    description: "Nature-inspired green theme",
    colorPreview: "#051512",
  },
  {
    id: "amber",
    name: "Warm Amber",
    icon: Palette,
    description: "Warm and energetic theme",
    colorPreview: "#1B1410",
  },
];

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  const colors = getThemeColors(theme);

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>
          Customize Your Theme
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            const themeColors = getThemeColors(t.id);

            return (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className="p-6 rounded-xl border-2 transition-all text-left hover:opacity-80"
                style={{
                  backgroundColor: colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon
                    className="w-6 h-6"
                    style={{
                      color: isActive ? colors.primary : colors.textSecondary,
                    }}
                  />
                  {isActive && (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: colors.accentLight,
                        color: colors.primary,
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>

                {/* Color Preview */}
                <div
                  className="w-full h-12 rounded-lg mb-3 border"
                  style={{
                    backgroundColor: t.colorPreview,
                    borderColor: colors.border,
                  }}
                ></div>

                <p className="font-medium" style={{ color: colors.text }}>
                  {t.name}
                </p>
                <p
                  className="text-sm mt-2"
                  style={{ color: colors.textSecondary }}
                >
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

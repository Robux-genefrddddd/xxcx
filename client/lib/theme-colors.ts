export interface ThemeColors {
  background: string;
  foreground: string;
  sidebar: string;
  sidebarForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  hover: string;
}

const themes: Record<string, ThemeColors> = {
  dark: {
    background: "#0E0E0F",
    foreground: "#FFFFFF",
    sidebar: "#111214",
    sidebarForeground: "#FFFFFF",
    card: "#111214",
    cardForeground: "#FFFFFF",
    border: "#1F2124",
    primary: "#3B82F6",
    primaryForeground: "#FFFFFF",
    accent: "#60A5FA",
    accentLight: "rgba(59, 130, 246, 0.1)",
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",
    hover: "rgba(31, 33, 36, 0.5)",
  },
  light: {
    background: "#FFFFFF",
    foreground: "#1F2937",
    sidebar: "#F9FAFB",
    sidebarForeground: "#1F2937",
    card: "#FFFFFF",
    cardForeground: "#1F2937",
    border: "#E5E7EB",
    primary: "#3B82F6",
    primaryForeground: "#FFFFFF",
    accent: "#2563EB",
    accentLight: "#DBEAFE",
    text: "#1F2937",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    hover: "rgba(243, 244, 246, 0.8)",
  },
  blue: {
    background: "#0F172A",
    foreground: "#FFFFFF",
    sidebar: "#1E293B",
    sidebarForeground: "#FFFFFF",
    card: "#1E293B",
    cardForeground: "#FFFFFF",
    border: "#334155",
    primary: "#0EA5E9",
    primaryForeground: "#FFFFFF",
    accent: "#38BDF8",
    accentLight: "rgba(14, 165, 233, 0.1)",
    text: "#FFFFFF",
    textSecondary: "#CBD5E1",
    textTertiary: "#94A3B8",
    hover: "rgba(30, 41, 59, 0.5)",
  },
  purple: {
    background: "#0F0B1D",
    foreground: "#FFFFFF",
    sidebar: "#1A1333",
    sidebarForeground: "#FFFFFF",
    card: "#1A1333",
    cardForeground: "#FFFFFF",
    border: "#3E2D5C",
    primary: "#A855F7",
    primaryForeground: "#FFFFFF",
    accent: "#D8B4FE",
    accentLight: "rgba(168, 85, 247, 0.1)",
    text: "#FFFFFF",
    textSecondary: "#E9D5FF",
    textTertiary: "#D8B4FE",
    hover: "rgba(26, 19, 51, 0.5)",
  },
  green: {
    background: "#051512",
    foreground: "#FFFFFF",
    sidebar: "#134E4A",
    sidebarForeground: "#FFFFFF",
    card: "#1F4D4A",
    cardForeground: "#FFFFFF",
    border: "#2D6A64",
    primary: "#10B981",
    primaryForeground: "#FFFFFF",
    accent: "#6EE7B7",
    accentLight: "rgba(16, 185, 129, 0.1)",
    text: "#FFFFFF",
    textSecondary: "#A7F3D0",
    textTertiary: "#6EE7B7",
    hover: "rgba(19, 78, 74, 0.5)",
  },
  amber: {
    background: "#1B1410",
    foreground: "#FFFFFF",
    sidebar: "#292415",
    sidebarForeground: "#FFFFFF",
    card: "#3F3428",
    cardForeground: "#FFFFFF",
    border: "#654321",
    primary: "#F59E0B",
    primaryForeground: "#FFFFFF",
    accent: "#FBBF24",
    accentLight: "rgba(245, 158, 11, 0.1)",
    text: "#FFFFFF",
    textSecondary: "#FEF08A",
    textTertiary: "#FCD34D",
    hover: "rgba(41, 36, 21, 0.5)",
  },
};

export function getThemeColors(theme: string): ThemeColors {
  return themes[theme] || themes.dark;
}

export function getThemeBackgroundImage(theme: string): string {
  const darkThemes = ["dark", "blue", "purple", "green", "amber"];
  if (darkThemes.includes(theme)) {
    return "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23222223' fill-opacity='0.08'%3E%3Cpath d='M29 30l-1-1 1-1 1 1-1 1M30 29l-1-1 1-1 1 1-1 1M30 31l-1 1 1 1 1-1-1-1M31 30l 1-1-1-1-1 1 1 1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";
  }
  return "none";
}

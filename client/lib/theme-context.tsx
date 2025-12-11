import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type ThemeType = "dark" | "light" | "blue";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("app-theme") as ThemeType) || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, []);

  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {mounted && children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

const themeColors = {
  dark: {
    background: "#0E0E0F",
    foreground: "#FFFFFF",
    sidebar: "#111214",
    card: "#141518",
    border: "#1F2124",
    input: "#141518",
    primary: "#60A5FA",
    text: "#FFFFFF",
    textMuted: "#9CA3AF",
  },
  light: {
    background: "#FFFFFF",
    foreground: "#111827",
    sidebar: "#F3F4F6",
    card: "#FFFFFF",
    border: "#E5E7EB",
    input: "#FFFFFF",
    primary: "#3B82F6",
    text: "#111827",
    textMuted: "#6B7280",
  },
  blue: {
    background: "#0F172A",
    foreground: "#FFFFFF",
    sidebar: "#1E3A8A",
    card: "#1E3A8A",
    border: "#1E40AF",
    input: "#1E3A8A",
    primary: "#60A5FA",
    text: "#FFFFFF",
    textMuted: "#93C5FD",
  },
};

function applyTheme(theme: ThemeType) {
  const colors = themeColors[theme];
  const root = document.documentElement;

  root.style.setProperty("--bg-primary", colors.background);
  root.style.setProperty("--bg-secondary", colors.sidebar);
  root.style.setProperty("--bg-card", colors.card);
  root.style.setProperty("--text-primary", colors.text);
  root.style.setProperty("--text-muted", colors.textMuted);
  root.style.setProperty("--border-color", colors.border);
  root.style.setProperty("--color-primary", colors.primary);

  document.documentElement.style.backgroundColor = colors.background;
}

export function getThemeColors(theme: ThemeType) {
  return themeColors[theme];
}

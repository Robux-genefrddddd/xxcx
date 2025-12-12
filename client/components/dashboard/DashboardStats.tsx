import { getThemeColors } from "@/lib/theme-colors";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileText, Image, Video, Archive } from "lucide-react";

interface DashboardStatsProps {
  files: Array<{
    id: string;
    name: string;
    size: string;
    uploadedAt: string;
    shared: boolean;
  }>;
  theme: string;
  plan: {
    type: "free" | "premium";
    storageLimit: number;
    storageUsed: number;
  };
}

const getFileType = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const docs = ["pdf", "doc", "docx", "txt", "xlsx", "xls", "ppt", "pptx"];
  const imgs = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  const vids = ["mp4", "avi", "mkv", "mov", "wmv", "flv"];
  const archs = ["zip", "rar", "7z", "tar", "gz"];

  if (docs.includes(ext)) return "Documents";
  if (imgs.includes(ext)) return "Images";
  if (vids.includes(ext)) return "Videos";
  if (archs.includes(ext)) return "Archives";
  return "Other";
};

export function DashboardStats({ files, theme, plan }: DashboardStatsProps) {
  const colors = getThemeColors(theme);

  const totalFiles = files.length;
  const sharedFiles = files.filter((f) => f.shared).length;
  const storageUsedMB = plan.storageUsed / (1024 * 1024);
  const storageLimitMB = plan.storageLimit / (1024 * 1024);
  const storagePercent = (plan.storageUsed / plan.storageLimit) * 100;

  const fileTypeMap = {
    Documents: 0,
    Images: 0,
    Videos: 0,
    Archives: 0,
    Other: 0,
  };

  files.forEach((file) => {
    const type = getFileType(file.name);
    fileTypeMap[type as keyof typeof fileTypeMap]++;
  });

  const dailyData = [
    { day: "Mon", uploads: 4 },
    { day: "Tue", uploads: 3 },
    { day: "Wed", uploads: 7 },
    { day: "Thu", uploads: 5 },
    { day: "Fri", uploads: 9 },
    { day: "Sat", uploads: 6 },
    { day: "Sun", uploads: 8 },
  ];

  const fileTypeList = [
    { type: "Documents", icon: FileText, count: fileTypeMap.Documents },
    { type: "Images", icon: Image, count: fileTypeMap.Images },
    { type: "Videos", icon: Video, count: fileTypeMap.Videos },
    { type: "Archives", icon: Archive, count: fileTypeMap.Archives },
  ];

  return (
    <div className="space-y-8">
      {/* SECTION 1: STORAGE - MINIMALISTE */}
      <div>
        <p
          className="text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: colors.textSecondary }}
        >
          Storage
        </p>
        <div className="flex items-baseline gap-1 mb-3">
          <p className="text-2xl font-semibold" style={{ color: colors.text }}>
            {storageUsedMB.toFixed(1)}
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            / {storageLimitMB.toFixed(0)} MB
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="h-1 rounded-full"
          style={{
            backgroundColor: colors.border,
            width: "100%",
          }}
        >
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(storagePercent, 100)}%`,
              backgroundColor:
                plan.type === "premium" ? "#10B981" : colors.primary,
            }}
          />
        </div>

        {/* Quick Stats - simple inline */}
        <div className="flex gap-6 mt-4">
          <div>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Files
            </p>
            <p
              className="text-lg font-semibold mt-1"
              style={{ color: colors.text }}
            >
              {totalFiles}
            </p>
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Shared
            </p>
            <p
              className="text-lg font-semibold mt-1"
              style={{ color: colors.text }}
            >
              {sharedFiles}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTIVITY CHART - MINIMAL */}
      <div>
        <p
          className="text-xs font-medium uppercase tracking-wide mb-3"
          style={{ color: colors.textSecondary }}
        >
          Activity
        </p>
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: "1rem",
          }}
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData}>
              <CartesianGrid
                strokeDasharray="0"
                stroke={colors.border}
                vertical={false}
              />
              <XAxis
                stroke={colors.textSecondary}
                style={{ fontSize: "11px" }}
              />
              <YAxis
                stroke={colors.textSecondary}
                style={{ fontSize: "11px" }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "3px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: colors.text }}
              />
              <Bar
                dataKey="uploads"
                fill={colors.primary}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: FILE TYPE DISTRIBUTION - MINIMALISTE, PAS DE GRILLE */}
      <div>
        <p
          className="text-sm font-medium uppercase tracking-wide mb-6"
          style={{ color: colors.textSecondary }}
        >
          File Types
        </p>
        <div className="space-y-3">
          {fileTypeList
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .map((item) => {
              const Icon = item.icon;
              const percentage =
                totalFiles > 0
                  ? ((item.count / totalFiles) * 100).toFixed(0)
                  : "0";
              return (
                <div
                  key={item.type}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="w-5 h-5"
                      style={{ color: colors.textSecondary, strokeWidth: 1.5 }}
                    />
                    <span style={{ color: colors.text }} className="text-sm">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span
                      style={{ color: colors.primary }}
                      className="text-lg font-bold"
                    >
                      {item.count}
                    </span>
                    <span
                      style={{ color: colors.textSecondary }}
                      className="text-xs"
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        {totalFiles === 0 && (
          <p className="text-sm py-8" style={{ color: colors.textSecondary }}>
            No files yet
          </p>
        )}
      </div>
    </div>
  );
}

import { getThemeColors } from "@/lib/theme-colors";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileIcon,
  Share2,
  HardDrive,
  Upload,
  FileText,
  Image,
  Video,
  Archive,
} from "lucide-react";
import { motion } from "framer-motion";

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

// File type detection utility
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

  // Calculate stats
  const totalFiles = files.length;
  const sharedFiles = files.filter((f) => f.shared).length;
  const storageUsedMB = plan.storageUsed / (1024 * 1024);
  const storageLimitMB = plan.storageLimit / (1024 * 1024);

  // Calculate real file type distribution
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

  // Daily upload simulation (for chart) - could be enhanced with real data
  const dailyData = [
    { day: "Mon", uploads: 4 },
    { day: "Tue", uploads: 3 },
    { day: "Wed", uploads: 7 },
    { day: "Thu", uploads: 5 },
    { day: "Fri", uploads: 9 },
    { day: "Sat", uploads: 6 },
    { day: "Sun", uploads: 8 },
  ];

  // Storage breakdown
  const storageData = [
    {
      name: "Used",
      value: Math.min(storageUsedMB, storageLimitMB),
      fill: "#3B82F6",
    },
    {
      name: "Available",
      value: Math.max(storageLimitMB - storageUsedMB, 0),
      fill: colors.accentLight.replace("0.1", "0.3"),
    },
  ];

  const COLORS = ["#3B82F6", "#9CA3AF"];

  const statCards = [
    {
      icon: FileIcon,
      label: "Total Files",
      value: totalFiles,
      color: colors.primary,
      bgColor: colors.accentLight,
    },
    {
      icon: Share2,
      label: "Shared Files",
      value: sharedFiles,
      color: colors.primary,
      bgColor: colors.accentLight,
    },
    {
      icon: HardDrive,
      label: "Storage Used",
      value: `${storageUsedMB.toFixed(1)}`,
      subValue: `of ${storageLimitMB.toFixed(0)} MB`,
      color: colors.primary,
      bgColor: colors.accentLight,
    },
    {
      icon: Upload,
      label: "Your Plan",
      value: plan.type === "premium" ? "Premium" : "Free",
      isPremium: plan.type === "premium",
      color: plan.type === "premium" ? "#22C55E" : colors.primary,
      bgColor:
        plan.type === "premium" ? "rgba(34, 197, 94, 0.1)" : colors.accentLight,
      borderColor: plan.type === "premium" ? "#22C55E" : colors.border,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -4,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              }}
              className="rounded-lg border p-6"
              style={{
                backgroundColor: card.isPremium
                  ? "rgba(34, 197, 94, 0.05)"
                  : colors.card,
                borderColor: card.borderColor || colors.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    {card.label}
                  </p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                    className="text-3xl font-bold mt-2"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </motion.p>
                  {card.subValue && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {card.subValue}
                    </p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: card.bgColor,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Uploads Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 rounded-lg border p-6"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>
            Upload Activity (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border}
                vertical={false}
              />
              <XAxis stroke={colors.textSecondary} />
              <YAxis stroke={colors.textSecondary} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.accentLight,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
                labelStyle={{ color: colors.text }}
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              />
              <Bar
                dataKey="uploads"
                fill={colors.primary}
                radius={[8, 8, 0, 0]}
                animationDuration={2000}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Storage Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-lg border p-6"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>
            Storage Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={storageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}MB`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {storageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.accentLight,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
                labelStyle={{ color: colors.text }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* File Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-lg border p-6"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: colors.text }}>
            File Type Distribution
          </h3>
          <motion.div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: colors.accentLight,
              color: colors.primary,
            }}
            whileHover={{ scale: 1.05 }}
          >
            {totalFiles} files
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { type: "Documents", icon: FileText, color: "#3B82F6" },
            { type: "Images", icon: Image, color: "#8B5CF6" },
            { type: "Videos", icon: Video, color: "#EC4899" },
            { type: "Archives", icon: Archive, color: "#F59E0B" },
            { type: "Other", icon: FileIcon, color: "#06B6D4" },
          ].map((item, idx) => {
            const Icon = item.icon;
            const count = fileTypeMap[item.type as keyof typeof fileTypeMap];
            const percentage =
              totalFiles > 0 ? ((count / totalFiles) * 100).toFixed(1) : "0";

            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + idx * 0.08 }}
                whileHover={{
                  scale: 1.08,
                  boxShadow: `0 12px 32px ${item.color}44`,
                  y: -2,
                }}
                className="p-5 rounded-xl border-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: `${item.color}08`,
                  borderColor: `${item.color}33`,
                }}
              >
                <motion.div
                  className="flex items-center justify-center mb-3"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${item.color}22`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                </motion.div>
                <motion.div
                  className="text-3xl font-bold text-center"
                  style={{ color: item.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + idx * 0.08 }}
                >
                  {count}
                </motion.div>
                <p
                  className="text-xs text-center mt-2 font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  {item.type}
                </p>
                <p
                  className="text-xs text-center mt-1"
                  style={{ color: item.color, opacity: 0.8 }}
                >
                  {percentage}%
                </p>
              </motion.div>
            );
          })}
        </div>

        {totalFiles === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8"
          >
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              No files yet. Upload files to see distribution statistics.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

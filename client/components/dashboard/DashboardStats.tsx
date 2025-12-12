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
import { FileIcon, Share2, HardDrive, Upload } from "lucide-react";
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

export function DashboardStats({ files, theme, plan }: DashboardStatsProps) {
  const colors = getThemeColors(theme);

  // Calculate stats
  const totalFiles = files.length;
  const sharedFiles = files.filter((f) => f.shared).length;
  const storageUsedMB = plan.storageUsed / (1024 * 1024);
  const storageLimitMB = plan.storageLimit / (1024 * 1024);

  // Daily upload simulation (for chart)
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Files Card */}
        <div
          className="rounded-lg border p-6 transition-all hover:shadow-lg"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Total Files
              </p>
              <p
                className="text-3xl font-bold mt-2"
                style={{ color: colors.primary }}
              >
                {totalFiles}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: colors.accentLight,
              }}
            >
              <FileIcon className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
          </div>
        </div>

        {/* Shared Files Card */}
        <div
          className="rounded-lg border p-6 transition-all hover:shadow-lg"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Shared Files
              </p>
              <p
                className="text-3xl font-bold mt-2"
                style={{ color: colors.primary }}
              >
                {sharedFiles}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: colors.accentLight,
              }}
            >
              <Share2 className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
          </div>
        </div>

        {/* Storage Used Card */}
        <div
          className="rounded-lg border p-6 transition-all hover:shadow-lg"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Storage Used
              </p>
              <p
                className="text-3xl font-bold mt-2"
                style={{ color: colors.primary }}
              >
                {storageUsedMB.toFixed(1)}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: colors.textSecondary }}
              >
                of {storageLimitMB.toFixed(0)} MB
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: colors.accentLight,
              }}
            >
              <HardDrive
                className="w-6 h-6"
                style={{ color: colors.primary }}
              />
            </div>
          </div>
        </div>

        {/* Plan Badge Card */}
        <div
          className="rounded-lg border p-6 transition-all hover:shadow-lg"
          style={{
            backgroundColor:
              plan.type === "premium" ? "rgba(34, 197, 94, 0.05)" : colors.card,
            borderColor: plan.type === "premium" ? "#22C55E" : colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Your Plan
              </p>
              <p
                className="text-3xl font-bold mt-2"
                style={{
                  color: plan.type === "premium" ? "#22C55E" : colors.primary,
                }}
              >
                {plan.type === "premium" ? "Premium" : "Free"}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor:
                  plan.type === "premium"
                    ? "rgba(34, 197, 94, 0.1)"
                    : colors.accentLight,
              }}
            >
              <Upload
                className="w-6 h-6"
                style={{
                  color: plan.type === "premium" ? "#22C55E" : colors.primary,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Uploads Chart */}
        <div
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
                }}
                labelStyle={{ color: colors.text }}
              />
              <Bar
                dataKey="uploads"
                fill={colors.primary}
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Storage Breakdown */}
        <div
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
                animationDuration={800}
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
                }}
                labelStyle={{ color: colors.text }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* File Size Distribution */}
      <div
        className="rounded-lg border p-6"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <h3 className="text-lg font-bold mb-6" style={{ color: colors.text }}>
          File Type Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: "Documents", count: 12, color: "#3B82F6" },
            { type: "Images", count: 8, color: "#8B5CF6" },
            { type: "Videos", count: 3, color: "#EC4899" },
            { type: "Other", count: 7, color: "#F59E0B" },
          ].map((item) => (
            <div
              key={item.type}
              className="text-center p-4 rounded-lg"
              style={{
                backgroundColor: colors.accentLight,
              }}
            >
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.count}
              </div>
              <p
                className="text-sm mt-2"
                style={{ color: colors.textSecondary }}
              >
                {item.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

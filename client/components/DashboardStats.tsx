import { FileText, Share2, HardDrive } from 'lucide-react';
import Sparkline from './Sparkline';

interface DashboardStatsProps {
  totalFiles: number;
  sharedFiles: number;
  storageUsed: number;
  storageLimit: number | null;
  theme: string;
}

export default function DashboardStats({
  totalFiles,
  sharedFiles,
  storageUsed,
  storageLimit,
  theme,
}: DashboardStatsProps) {
  const themeColors = {
    dark: {
      bg: '#111214',
      card: '#141518',
      border: '#1F2124',
      text: '#FFFFFF',
      textMuted: '#9CA3AF',
      primary: '#60A5FA',
    },
    light: {
      bg: '#FFFFFF',
      card: '#F9FAFB',
      border: '#E5E7EB',
      text: '#111827',
      textMuted: '#6B7280',
      primary: '#3B82F6',
    },
    blue: {
      bg: '#0F172A',
      card: '#1E3A8A',
      border: '#1E40AF',
      text: '#FFFFFF',
      textMuted: '#93C5FD',
      primary: '#60A5FA',
    },
  };

  const colors = themeColors[theme as keyof typeof themeColors] || themeColors.dark;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filesData = [2, 5, 3, 8, 6, 9, totalFiles];
  const sharedData = [0, 1, 2, 1, 3, 2, sharedFiles];
  const storageData = [100, 250, 200, 450, 400, 600, storageUsed / (1024 * 1024)];

  const stats = [
    {
      title: 'Files',
      value: totalFiles,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      sparklineColor: '#3B82F6',
      sparklineData: filesData,
    },
    {
      title: 'Shared',
      value: sharedFiles,
      icon: Share2,
      gradient: 'from-purple-500 to-purple-600',
      sparklineColor: '#A855F7',
      sparklineData: sharedData,
    },
    {
      title: 'Storage',
      value: formatBytes(storageUsed),
      icon: HardDrive,
      gradient: 'from-green-500 to-green-600',
      sparklineColor: '#10B981',
      sparklineData: storageData,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`rounded-lg p-4 border overflow-hidden relative transition-all hover:scale-105`}
            style={{
              borderColor: colors.border,
              background: `linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(96, 165, 250, 0.08) 100%)`,
            }}
          >
            <div className="mb-3">
              <Sparkline data={stat.sparklineData} color={stat.sparklineColor} height={30} />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div>
                <p style={{ color: colors.textMuted }} className="text-xs font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

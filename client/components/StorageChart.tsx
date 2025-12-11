import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StorageChartProps {
  theme: string;
}

export default function StorageChart({ theme }: StorageChartProps) {
  const themeColors = {
    dark: {
      line: "#60A5FA",
      area: "#1E40AF",
      grid: "#1F2124",
      text: "#FFFFFF",
    },
    light: {
      line: "#3B82F6",
      area: "#DBEAFE",
      grid: "#E5E7EB",
      text: "#111827",
    },
    blue: {
      line: "#60A5FA",
      area: "#1E3A8A",
      grid: "#1E40AF",
      text: "#FFFFFF",
    },
  };

  const colors =
    themeColors[theme as keyof typeof themeColors] || themeColors.dark;

  const data = [
    { day: "1", usage: 120 },
    { day: "2", usage: 150 },
    { day: "3", usage: 140 },
    { day: "4", usage: 180 },
    { day: "5", usage: 170 },
    { day: "6", usage: 210 },
    { day: "7", usage: 230 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.line} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.line} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.grid}
          opacity={0.3}
        />
        <XAxis
          dataKey="day"
          stroke={colors.text}
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke={colors.text} style={{ fontSize: "12px" }} width={30} />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.grid,
            border: `1px solid ${colors.line}`,
            borderRadius: "8px",
          }}
          labelStyle={{ color: colors.text }}
        />
        <Area
          type="monotone"
          dataKey="usage"
          stroke={colors.line}
          fillOpacity={1}
          fill="url(#colorUsage)"
          isAnimationActive
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

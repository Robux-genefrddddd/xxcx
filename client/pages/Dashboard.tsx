import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Cloud,
  File,
  TrendingUp,
  Grid,
  Star,
  User,
  BarChart3,
  Search,
  Bell,
  Settings,
  HardDrive,
  Upload,
  Share2,
} from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: "emerald" | "yellow" | "blue";
  icon: React.ComponentType<{ className: string }>;
}

interface FileItem {
  id: string;
  provider: string;
  usage: string;
  period: string;
  amount: string;
  change: string;
  projected: string;
}

interface StorageItem {
  name: string;
  usage: number;
  total: string;
  color?: "blue" | "emerald" | "purple" | "cyan";
}

interface Department {
  name: string;
  percent: number;
  color: string;
}

const stats: StatItem[] = [
  {
    label: "Total Storage",
    value: "$1,390,021",
    change: "+8%",
    trend: "up",
    color: "emerald",
    icon: HardDrive,
  },
  {
    label: "Files Uploaded",
    value: "3,900",
    change: "+15%",
    trend: "up",
    color: "yellow",
    icon: Upload,
  },
  {
    label: "Shared Files",
    value: "78%",
    change: "+2%",
    trend: "up",
    color: "blue",
    icon: Share2,
  },
];

const files: FileItem[] = [
  {
    id: "165372",
    provider: "AWS",
    usage: "10170 Hours",
    period: "Oct 1 - Oct 31",
    amount: "$45,000",
    change: "+8%",
    projected: "$32,000",
  },
  {
    id: "216452",
    provider: "Azure",
    usage: "540 Hours",
    period: "Oct 1 - Oct 31",
    amount: "$20,000",
    change: "+4%",
    projected: "$25,000",
  },
  {
    id: "234343",
    provider: "GCP",
    usage: "2900 Hours",
    period: "Oct 1 - Oct 31",
    amount: "$12,000",
    change: "+9%",
    projected: "$18,000",
  },
  {
    id: "104281",
    provider: "Oracle",
    usage: "2300 Hours",
    period: "Oct 1 - Oct 31",
    amount: "$10,000",
    change: "+9%",
    projected: "$7,000",
  },
  {
    id: "223143",
    provider: "Snow Flake",
    usage: "5000 Hours",
    period: "Oct 1 - Oct 31",
    amount: "$70,000",
    change: "+8%",
    projected: "$11,000",
  },
  {
    id: "234343",
    provider: "Salesforce",
    usage: "1500 Hours",
    period: "Oct 1 - Oct 31",
    amount: "$18,000",
    change: "+8%",
    projected: "$20,000",
  },
];

const storageData: StorageItem[] = [
  { name: "AWS", usage: 88, total: "88 TB / 90 TB" },
  { name: "Azure", usage: 72, total: "72 TB / 90 TB", color: "blue" },
  { name: "GCP", usage: 92, total: "92 TB / 90 TB", color: "emerald" },
  { name: "Oracle", usage: 65, total: "65 TB / 90 TB", color: "purple" },
  { name: "Salesforce", usage: 45, total: "45 TB / 90 TB", color: "cyan" },
];

const departments: Department[] = [
  { name: "Sales", percent: 35, color: "bg-rose-500" },
  { name: "Marketing", percent: 25, color: "bg-blue-500" },
  { name: "Human Resources", percent: 20, color: "bg-purple-500" },
  { name: "Information technology", percent: 20, color: "bg-amber-500" },
];

const getColorClasses = (color: "emerald" | "yellow" | "blue") => {
  const colorMap = {
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
  };
  return colorMap[color];
};

const getStorageBarColor = (color?: string) => {
  const colorMap: { [key: string]: string } = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
  };
  return colorMap[color || "orange"] || "bg-orange-500";
};

export default function Dashboard() {
  const [isDragging] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-950 text-white p-6 flex flex-col fixed left-0 top-0 h-screen overflow-y-auto border-r border-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 mb-10 hover:opacity-80 transition"
        >
          <div className="flex items-center gap-2">
            <Cloud className="w-7 h-7 text-blue-400" />
            <span className="text-xl font-bold">Finops</span>
          </div>
        </Link>

        <nav className="space-y-1 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 text-white font-medium transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors">
            <File className="w-5 h-5" />
            <span>Reports</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span>Performance</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Grid className="w-5 h-5" />
            <span>Manage Allocations</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Star className="w-5 h-5" />
            <span>Tags</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors">
            <User className="w-5 h-5" />
            <span>Manage Users</span>
          </button>
        </nav>

        <div className="mt-6 p-4 bg-slate-800 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">New features</p>
              <p className="text-xs text-gray-400">to review</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
            PS
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Paul Smith</p>
            <p className="text-xs text-gray-400">Paul@gmail.com</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <header className="bg-blue-900/50 backdrop-blur border-b border-white/10 px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome Paul! 👋
              </h1>
              <p className="text-sm text-white/60">
                View your cloud spending with just a glance.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-80 bg-blue-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-blue-800"
                />
              </div>
              <button className="p-2 hover:bg-blue-800/50 rounded-lg transition">
                <Bell className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-2 hover:bg-blue-800/50 rounded-lg transition">
                <Settings className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-2 hover:bg-blue-800/50 rounded-lg transition">
                <User className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const colors = getColorClasses(stat.color);
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-sm font-semibold text-cyan-400 flex items-center gap-1">
                      {stat.change}
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-sm text-white/60">{stat.label}</p>
                  <div className="mt-4 h-12">
                    <svg viewBox="0 0 200 40" className="w-full h-full">
                      <polyline
                        points="0,30 40,25 80,28 120,15 160,20 200,10"
                        fill="none"
                        stroke={
                          stat.color === "emerald"
                            ? "#10b981"
                            : stat.color === "yellow"
                              ? "#f59e0b"
                              : "#3b82f6"
                        }
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Charges Table */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Recent charges</h2>
                <button className="text-sm text-cyan-400 font-semibold hover:text-cyan-300 transition">
                  Last 30 days →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-white/60">
                        Invoice ID
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-white/60">
                        Service provider
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-white/60">
                        Usage
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-white/60">
                        Interval
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-white/60">
                        Amount
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-white/60">
                        Projected cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file, index) => (
                      <tr
                        key={index}
                        className="border-b border-white/10 hover:bg-white/5 transition"
                      >
                        <td className="py-4 px-2 text-sm text-white/70">
                          {file.id}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                              <Cloud className="w-4 h-4 text-cyan-400" />
                            </div>
                            <span className="text-sm font-medium text-white">
                              {file.provider}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-white/70">
                          {file.usage}
                        </td>
                        <td className="py-4 px-2 text-sm text-white/70">
                          {file.period}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {file.amount}
                            </span>
                            <span className="text-xs text-cyan-400 font-semibold">
                              {file.change}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-white/70">
                          {file.projected}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-center gap-2 mt-6">
                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                  <span className="text-white/40">←</span>
                </button>
                <button className="w-8 h-8 bg-cyan-400 text-blue-900 rounded-lg text-sm font-semibold">
                  1
                </button>
                <button className="w-8 h-8 hover:bg-white/10 rounded-lg text-sm font-semibold text-white/60 transition">
                  2
                </button>
                <span className="text-white/40">...</span>
                <button className="w-8 h-8 hover:bg-white/10 rounded-lg text-sm font-semibold text-white/60 transition">
                  15
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                  <span className="text-white/60">→</span>
                </button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Spending by Departments */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">
                  Spending by departments
                </h3>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 140 140"
                    >
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="16"
                        strokeDasharray="188.4 377"
                        strokeDashoffset="0"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Cloud className="w-8 h-8 text-white/40 mb-1" />
                      <p className="text-xl font-bold text-white">$1,390,021</p>
                      <p className="text-xs text-cyan-400 font-semibold">
                        ▲ 18%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${dept.color}`}
                      ></div>
                      <span className="text-sm text-white/70 flex-1">
                        {dept.name}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {dept.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Used Storage */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Used storage</h3>
                  <span className="text-xs text-cyan-400 font-semibold">
                    -15% storage left
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-2xl font-bold text-white mb-1">
                    212 TB / 600 TB
                  </p>
                </div>
                <div className="space-y-4">
                  {storageData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-white/40" />
                          <span className="text-sm font-medium text-white">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs text-white/50">
                          {item.total}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStorageBarColor(item.color)} rounded-full transition-all`}
                          style={{ width: `${item.usage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

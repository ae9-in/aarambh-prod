"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, TrendingDown, Users, BookOpen, Clock, Target,
  Download, Calendar, ChevronDown, ArrowUpRight, Filter,
  BarChart3, PieChart as PieChartIcon, Activity
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Chart data
const engagementData = [
  { name: "Mon", users: 120, completions: 45 },
  { name: "Tue", users: 180, completions: 72 },
  { name: "Wed", users: 210, completions: 89 },
  { name: "Thu", users: 165, completions: 65 },
  { name: "Fri", users: 195, completions: 82 },
  { name: "Sat", users: 85, completions: 32 },
  { name: "Sun", users: 65, completions: 28 },
]

const monthlyData = [
  { name: "Jan", lessons: 12, users: 45 },
  { name: "Feb", lessons: 18, users: 62 },
  { name: "Mar", lessons: 24, users: 78 },
  { name: "Apr", lessons: 32, users: 95 },
  { name: "May", lessons: 38, users: 112 },
  { name: "Jun", lessons: 42, users: 125 },
]

const categoryData = [
  { name: "HR Onboarding", value: 35, color: "#FF6B35" },
  { name: "Product Training", value: 25, color: "#C8A96E" },
  { name: "Sales", value: 20, color: "#10B981" },
  { name: "Compliance", value: 15, color: "#6366F1" },
  { name: "Other", value: 5, color: "#78716C" },
]

const topLessons = [
  { title: "Welcome to the Company", views: 1234, completionRate: 92 },
  { title: "Product Overview", views: 987, completionRate: 85 },
  { title: "Sales Fundamentals", views: 756, completionRate: 78 },
  { title: "Customer Support Guide", views: 654, completionRate: 88 },
  { title: "Compliance Training 2024", views: 543, completionRate: 95 },
]

const recentActivity = [
  { user: "Rahul Sharma", action: "Completed Sales Training", time: "2 min ago" },
  { user: "Priya Patel", action: "Started Onboarding", time: "5 min ago" },
  { user: "Amit Kumar", action: "Asked AI: How to handle returns?", time: "12 min ago" },
  { user: "Neha Singh", action: "Uploaded new document", time: "25 min ago" },
  { user: "Vikram Desai", action: "Completed Product Overview", time: "1 hour ago" },
]

const COLORS = ["#FF6B35", "#C8A96E", "#10B981", "#6366F1", "#78716C"]

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1500
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("Last 7 days")

  const stats = [
    { 
      label: "Total Users", 
      value: 1247, 
      change: 12.5, 
      trend: "up", 
      icon: Users,
      color: "#FF6B35"
    },
    { 
      label: "Lessons Completed", 
      value: 3892, 
      change: 8.2, 
      trend: "up", 
      icon: BookOpen,
      color: "#10B981" 
    },
    { 
      label: "Avg. Time Spent", 
      value: 24, 
      suffix: " min",
      change: -3.1, 
      trend: "down", 
      icon: Clock,
      color: "#6366F1" 
    },
    { 
      label: "Completion Rate", 
      value: 78, 
      suffix: "%",
      change: 5.4, 
      trend: "up", 
      icon: Target,
      color: "#C8A96E" 
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">Reports & Analytics</h1>
          <p className="text-[#78716C] mt-1">Track your team&apos;s learning progress</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] hover:border-[#FF6B35]/30 transition-colors">
              <Calendar size={16} className="text-[#78716C]" />
              {dateRange}
              <ChevronDown size={16} className="text-[#78716C]" />
            </button>
          </div>
          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#E85520] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-2xl border border-[#E7E5E4] p-6 hover:border-[#FF6B35]/30 hover:shadow-lg hover:shadow-[#FF6B35]/5 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-500"
              }`}>
                {stat.trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {stat.change}%
              </span>
            </div>
            <div className="text-3xl font-bold text-[#1C1917] mb-1">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-sm text-[#78716C]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Engagement Chart */}
        <motion.div
          className="col-span-2 bg-white rounded-2xl border border-[#E7E5E4] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[#1C1917]">Weekly Engagement</h3>
              <p className="text-sm text-[#78716C]">Active users vs completions</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                Active Users
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C8A96E]" />
                Completions
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8A96E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C8A96E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
              <XAxis dataKey="name" stroke="#78716C" fontSize={12} />
              <YAxis stroke="#78716C" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1917",
                  border: "none",
                  borderRadius: "12px",
                  color: "#FAF9F7",
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#FF6B35"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
              <Area
                type="monotone"
                dataKey="completions"
                stroke="#C8A96E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompletions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="font-semibold text-[#1C1917]">Content by Category</h3>
            <p className="text-sm text-[#78716C]">Distribution of lessons</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1917",
                  border: "none",
                  borderRadius: "12px",
                  color: "#FAF9F7",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-medium text-[#1C1917]">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Monthly Growth */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-6">
            <h3 className="font-semibold text-[#1C1917]">Monthly Growth</h3>
            <p className="text-sm text-[#78716C]">Lessons & Users trend</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
              <XAxis dataKey="name" stroke="#78716C" fontSize={12} />
              <YAxis stroke="#78716C" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1917",
                  border: "none",
                  borderRadius: "12px",
                  color: "#FAF9F7",
                }}
              />
              <Bar dataKey="lessons" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              <Bar dataKey="users" fill="#C8A96E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Lessons */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[#1C1917]">Top Lessons</h3>
              <p className="text-sm text-[#78716C]">By engagement</p>
            </div>
            <button className="text-sm text-[#FF6B35] font-medium hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {topLessons.map((lesson, i) => (
              <motion.div
                key={lesson.title}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <span className="w-6 h-6 rounded-full bg-[#F5F5F4] flex items-center justify-center text-xs font-semibold text-[#78716C]">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1C1917] text-sm truncate">{lesson.title}</p>
                  <p className="text-xs text-[#78716C]">{lesson.views.toLocaleString()} views</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-green-600">{lesson.completionRate}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E7E5E4] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[#1C1917]">Recent Activity</h3>
              <p className="text-sm text-[#78716C]">Live feed</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#C8A96E] flex items-center justify-center text-white text-xs font-bold">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-[#1C1917]">{activity.user}</span>
                  </p>
                  <p className="text-xs text-[#78716C] truncate">{activity.action}</p>
                </div>
                <span className="text-xs text-[#A8A29E] whitespace-nowrap">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-[#1C1917] to-[#2C2723] rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Generate Custom Report</h3>
            <p className="text-sm text-white/60 mt-1">
              Create detailed reports with specific date ranges and metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors">
              <BarChart3 size={18} />
              Custom Report
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors">
              <Activity size={18} />
              Schedule Report
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutGrid,
  BookOpen,
  Users,
  FileUp,
  MoreHorizontal,
  Check,
  X,
  Send,
  ChevronRight,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Circular Progress Ring Component
function CircularProgress({ value, color, size = 44 }: { value: number; color: string; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E8E6E1"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [aiEnabled, setAiEnabled] = useState(true)
  const [aiModel, setAiModel] = useState("OpenAI GPT-3.5")
  const [responseLength, setResponseLength] = useState("Short Summary")
  const [chatOpen, setChatOpen] = useState(true)
  const [chatMessage, setChatMessage] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalUsers: number
    activeUsers: number
    totalContent: number
    contentByType: Record<string, number>
    avgCompletion: number
    aiQueryCount: number
  }>({
    totalUsers: 0,
    activeUsers: 0,
    totalContent: 0,
    contentByType: {},
    avgCompletion: 0,
    aiQueryCount: 0,
  })
  const [recentUsers, setRecentUsers] = useState<
    { id: string; name: string; email: string; role: string; status: string }[]
  >([])
  const [recentContent, setRecentContent] = useState<
    { id: string; title: string; type: string }[]
  >([])
  const [openEnquiries, setOpenEnquiries] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      if (!user?.orgId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)

        const [analyticsRes, usersRes, contentRes, enquiriesRes] =
          await Promise.all([
            fetch(
              `/api/analytics?orgId=${encodeURIComponent(
                user.orgId,
              )}&period=7`,
              { credentials: "include" },
            ),
            fetch("/api/users", { credentials: "include" }),
            fetch(
              `/api/content?orgId=${encodeURIComponent(user.orgId)}`,
              { credentials: "include" },
            ),
            fetch("/api/enquiries?status=new&count=true", {
              credentials: "include",
            }),
          ])

        if (!analyticsRes.ok) {
          const d = await analyticsRes.json().catch(() => null)
          throw new Error(d?.error || "Failed to load analytics.")
        }
        if (!usersRes.ok) {
          const d = await usersRes.json().catch(() => null)
          throw new Error(d?.error || "Failed to load users.")
        }
        if (!contentRes.ok) {
          const d = await contentRes.json().catch(() => null)
          throw new Error(d?.error || "Failed to load content.")
        }
        if (!enquiriesRes.ok) {
          const d = await enquiriesRes.json().catch(() => null)
          throw new Error(d?.error || "Failed to load enquiries.")
        }

        const analytics = await analyticsRes.json()
        const usersData = await usersRes.json()
        const contentData = await contentRes.json()
        const enquiriesData = await enquiriesRes.json()

        setStats({
          totalUsers: analytics.totalUsers ?? 0,
          activeUsers: analytics.activeUsers ?? 0,
          totalContent: analytics.totalContent ?? 0,
          contentByType: analytics.contentByType ?? {},
          avgCompletion: analytics.avgCompletion ?? 0,
          aiQueryCount: analytics.aiQueryCount ?? 0,
        })

        const uList: any[] = usersData.users ?? []
        setRecentUsers(
          uList.slice(0, 5).map((u) => ({
            id: u.id,
            name: u.name ?? "",
            email: u.email ?? "",
            role: u.role ?? "EMPLOYEE",
            status: (u.status ?? "active") as string,
          })),
        )

        const cList: any[] = contentData.content ?? []
        setRecentContent(
          cList.slice(0, 5).map((c) => ({
            id: c.id,
            title: c.title ?? "",
            type: c.type ?? "OTHER",
          })),
        )

        setOpenEnquiries(enquiriesData.count ?? 0)
      } catch (e: any) {
        console.error(e)
        setError(e?.message || "Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user?.orgId])

  const categoryCount = useMemo(
    () => Object.keys(stats.contentByType).length,
    [stats.contentByType],
  )

  const videoCount = stats.contentByType["VIDEO"] ?? 0

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Categories */}
        <motion.div
          className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#FFF4F0] flex items-center justify-center">
            <LayoutGrid size={24} className="text-[#FF6B35]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#78716C] font-medium">Total Categories</p>
            <p className="text-2xl font-bold text-[#1C1917]">
              {loading ? "…" : categoryCount}
            </p>
          </div>
          <CircularProgress value={categoryCount > 0 ? 100 : 0} color="#FF6B35" />
        </motion.div>

        {/* Total Lessons */}
        <motion.div
          className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ y: -2 }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#F0FAFA] flex items-center justify-center">
            <BookOpen size={24} className="text-[#0EA5A5]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#78716C] font-medium">Total Lessons</p>
            <p className="text-2xl font-bold text-[#1C1917]">
              {loading ? "…" : stats.totalContent}
            </p>
          </div>
          <CircularProgress
            value={stats.totalContent > 0 ? 100 : 0}
            color="#0EA5A5"
          />
        </motion.div>

        {/* Active Users */}
        <motion.div
          className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -2 }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
            <Users size={24} className="text-[#F97316]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#78716C] font-medium">Active Users</p>
            <p className="text-2xl font-bold text-[#1C1917]">
              {loading ? "…" : stats.activeUsers}
            </p>
          </div>
          <CircularProgress
            value={
              stats.totalUsers > 0
                ? Math.min(
                    100,
                    Math.round(
                      (stats.activeUsers / Math.max(stats.totalUsers, 1)) *
                        100,
                    ),
                  )
                : 0
            }
            color="#F97316"
          />
        </motion.div>

        {/* Files Uploaded */}
        <motion.div
          className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ y: -2 }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#FDF2F8] flex items-center justify-center">
            <FileUp size={24} className="text-[#EC4899]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#78716C] font-medium">
              New enquiries (open)
            </p>
            <p className="text-2xl font-bold text-[#1C1917]">
              {loading ? "…" : openEnquiries}
            </p>
          </div>
          <CircularProgress
            value={openEnquiries > 0 ? 100 : 0}
            color="#EC4899"
          />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Management */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-[#1C1917] mb-4">
            Overview
          </h2>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-[#78716C]">
              {loading
                ? "Loading latest stats..."
                : "Dashboard numbers are live from Supabase (users, lessons, enquiries and AI usage)."}
            </p>
          )}
        </motion.div>

        {/* User Management */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1C1917]">
              Latest Users
            </h2>
          </div>

          <div className="border border-[#E8E6E1] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F3EF]">
              <h3 className="text-sm font-semibold text-[#1C1917]">
                Users & Roles
              </h3>
            </div>

            <table className="w-full">
              <thead className="bg-[#FAFAF9]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#78716C]">Name</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#78716C]">Email</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#78716C]">Role</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#78716C]">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    className="border-t border-[#E8E6E1] hover:bg-[#FAFAF9]"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#1C1917]">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#78716C]">
                      {row.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1C1917]">
                      {row.role}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.status === "active" 
                          ? "bg-[#D1FAE5] text-[#059669]" 
                          : "bg-[#FFEDD5] text-[#EA580C]"
                      }`}>
                        {row.status.charAt(0).toUpperCase() +
                          row.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Content Library */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-[#1C1917] mb-4">
            Recent Content
          </h2>

          <div className="overflow-hidden rounded-xl border border-[#E8E6E1]">
            <table className="w-full">
              <thead className="bg-[#F5F3EF]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[#1C1917]">File Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[#1C1917]">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[#1C1917]">
                    <span className="flex items-center gap-1">
                      Uploaded By
                      <ChevronRight size={14} />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentContent.map((file, index) => {
                  // Get icon based on content type
                  const getFileIcon = (type: string) => {
                    switch (type?.toLowerCase()) {
                      case 'video': return <Video size={16} className="text-purple-500" />
                      case 'pdf': return <FileText size={16} className="text-red-500" />
                      case 'audio': return <Music size={16} className="text-green-500" />
                      case 'image': return <ImageIcon size={16} className="text-blue-500" />
                      default: return <FileText size={16} className="text-gray-500" />
                    }
                  }
                  
                  // Get background color based on type
                  const getIconBg = (type: string) => {
                    switch (type?.toLowerCase()) {
                      case 'video': return 'bg-purple-100'
                      case 'pdf': return 'bg-red-100'
                      case 'audio': return 'bg-green-100'
                      case 'image': return 'bg-blue-100'
                      default: return 'bg-gray-100'
                    }
                  }
                  
                  return (
                    <motion.tr
                      key={file.id}
                      className="border-t border-[#E8E6E1] hover:bg-[#FAFAF9]"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconBg(file.type)}`}>
                            {getFileIcon(file.type)}
                          </div>
                          <span className="text-sm text-[#1C1917]">
                            {file.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#78716C]">
                        {file.type}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#78716C]">
                          From Supabase content
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <button className="mt-3 text-sm font-medium text-[#FF6B35] hover:underline flex items-center gap-1">
            <ChevronRight size={14} />
            View All Files
          </button>
        </motion.div>

        {/* AI Search Settings */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-lg font-bold text-[#1C1917] mb-4">AI Search</h2>

          {/* Orange orb decoration */}
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#FF6B35]" />

          <div className="space-y-4">
            {/* Enable AI Search */}
            <div className="flex items-center gap-3 p-3 bg-[#F5F3EF] rounded-xl">
              <div 
                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                  aiEnabled ? "bg-[#FF6B35] border-[#FF6B35]" : "border-[#78716C]"
                }`} 
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                {aiEnabled && <Check size={12} className="text-white" />}
              </div>
              <span className="text-sm font-medium text-[#1C1917]">Enable AI Search</span>
              <div className="ml-auto">
                <button
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors ${aiEnabled ? "bg-[#FF6B35]" : "bg-[#D1D5DB]"}`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                    animate={{ x: aiEnabled ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* AI Model */}
            <div className="flex items-center gap-3 p-3 bg-[#F5F3EF] rounded-xl">
              <div className="w-5 h-5 rounded bg-[#E8E6E1] flex items-center justify-center">
                <FileText size={12} className="text-[#78716C]" />
              </div>
              <span className="text-sm font-medium text-[#1C1917]">AI Model</span>
              <div className="ml-auto">
                <select 
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                >
                  <option>OpenAI GPT-3.5</option>
                  <option>OpenAI GPT-4</option>
                  <option>Claude 3</option>
                </select>
              </div>
            </div>

            {/* Response Length */}
            <div className="flex items-center gap-3 p-3 bg-[#F5F3EF] rounded-xl">
              <div className="w-5 h-5 rounded bg-[#E8E6E1] flex items-center justify-center">
                <FileText size={12} className="text-[#78716C]" />
              </div>
              <span className="text-sm font-medium text-[#1C1917]">Response Length</span>
              <div className="ml-auto">
                <select 
                  value={responseLength}
                  onChange={(e) => setResponseLength(e.target.value)}
                  className="bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
                >
                  <option>Short Summary</option>
                  <option>Medium</option>
                  <option>Detailed</option>
                </select>
              </div>
            </div>

            <button className="w-full py-2.5 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#E85A2A] transition-colors">
              Update Settings
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating AI Chat Widget */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E6E1] overflow-hidden z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E6E1]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-sm font-semibold text-[#1C1917]">AI Chat</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 text-[#78716C] hover:text-[#1C1917]">
                  <MoreHorizontal size={16} />
                </button>
                <button onClick={() => setChatOpen(false)} className="p-1 text-[#78716C] hover:text-[#1C1917]">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-4 h-64 overflow-y-auto space-y-4">
              {/* User Message */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-[#D4A574] overflow-hidden shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face" 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-[#F5F3EF] rounded-xl rounded-tl-none px-3 py-2">
                  <p className="text-sm text-[#1C1917]">Hi thinking...</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#FF6B35] mt-1" />
              </div>

              {/* AI Message */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1C1917] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <div className="bg-[#1C1917] rounded-xl rounded-tl-none px-3 py-2 text-white">
                  <p className="text-sm">
                    AI search stats and settings are visual only in this
                    version.
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#FF6B35] mt-1" />
              </div>

              {/* AI Response with Source */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-[#F5F3EF] rounded-xl px-3 py-2">
                    <p className="text-sm text-[#1C1917]">Source cards slides up from from the bottom.</p>
                  </div>
                  
                  {/* Source Cards */}
                  <div className="flex gap-2">
                    <motion.div
                      className="bg-[#EEF2FF] rounded-lg px-2 py-1.5 flex items-center gap-1.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <FileText size={12} className="text-[#6366F1]" />
                      <div>
                        <p className="text-xs font-medium text-[#1C1917]">Source Cards</p>
                        <p className="text-[10px] text-[#78716C]">Document: Virondea slides from the bottom.</p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-[#EEF2FF] rounded-lg px-2 py-1.5 flex items-center gap-1.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <FileText size={12} className="text-[#6366F1]" />
                      <div>
                        <p className="text-xs font-medium text-[#1C1917]">Source</p>
                        <p className="text-[10px] text-[#78716C]">Source cards up from th...</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#E8E6E1]">
              <div className="flex items-center gap-2 bg-[#F5F3EF] rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#1C1917] placeholder:text-[#78716C] outline-none"
                />
                <button className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white hover:bg-[#E85A2A] transition-colors">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button (when closed) */}
      {!chatOpen && (
        <motion.button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF6B35] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#E85A2A] transition-colors z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.35 17L2 22L7 20.65C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white"/>
          </svg>
        </motion.button>
      )}

      {/* Bottom Tab Bar Preview */}
      <motion.div
        className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { icon: "📧", label: "Email" },
          { icon: "📁", label: "Archive" },
          { icon: "⭐", label: "Favorites" },
          { icon: "📥", label: "Email" },
          { icon: "📚", label: "Lessons" },
          { icon: "💬", label: "Chat" },
          { icon: "📋", label: "Tasks" },
        ].map((tab, i) => (
          <button
            key={`${tab.label}-${i}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#78716C] hover:bg-[#F5F3EF] hover:text-[#1C1917] transition-colors whitespace-nowrap"
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>
    </div>
  )
}

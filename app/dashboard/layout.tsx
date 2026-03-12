"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  LayoutGrid,
  Play,
  FolderOpen,
  Users,
  Shield,
  Sparkles,
  Settings,
  BarChart3,
  ChevronDown,
  Search,
  Bell,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [manageContentOpen, setManageContentOpen] = useState(true)
  const [manageUsersOpen, setManageUsersOpen] = useState(false)
  const [accessControlOpen, setAccessControlOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [newEnquiryCount, setNewEnquiryCount] = useState<number | null>(null)
  const [pendingApprovalCount, setPendingApprovalCount] = useState<number | null>(null)
  const [pendingAccessRequestCount, setPendingAccessRequestCount] = useState<number | null>(null)

  useEffect(() => {
    async function loadCounts() {
      try {
        if (!user?.orgId) return
        const [enquiryRes, approvalRes] = await Promise.all([
          fetch("/api/enquiries?status=new&count=true", { credentials: "include" }),
          fetch("/api/users?status=pending&count=true", { credentials: "include" }),
        ])

        if (enquiryRes.ok) {
          const data = await enquiryRes.json()
          if (typeof data.count === "number") setNewEnquiryCount(data.count)
        }

        if (approvalRes.ok) {
          const data = await approvalRes.json()
          if (typeof data.count === "number") setPendingApprovalCount(data.count)
        }

        const accessRes = await fetch(
          `/api/access-requests?orgId=${encodeURIComponent(user.orgId)}&status=pending`,
          { credentials: "include" },
        )
        if (accessRes.ok) {
          const data = await accessRes.json()
          const pending = Array.isArray(data.requests) ? data.requests.length : 0
          setPendingAccessRequestCount(pending)
        }
      } catch {
        // ignore
      }
    }

    void loadCounts()
    const interval = setInterval(loadCounts, 60_000)
    return () => clearInterval(interval)
  }, [user?.orgId])

  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#1C1917] flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 4C24 4 28 12 28 20C28 28 24 36 24 44C24 36 20 28 20 20C20 12 24 4 24 4Z"
              fill="#FF6B35"
            />
            <path
              d="M24 8C24 8 30 14 32 22C34 30 30 38 24 44C30 38 34 30 32 22C30 14 24 8 24 8Z"
              fill="#FF8C5A"
              opacity="0.8"
            />
            <path
              d="M24 8C24 8 18 14 16 22C14 30 18 38 24 44C18 38 14 30 16 22C18 14 24 8 24 8Z"
              fill="#FF8C5A"
              opacity="0.8"
            />
          </svg>
          <span className="text-white font-bold text-xl tracking-tight">Arambh</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              pathname === "/dashboard"
                ? "bg-[#2A2724] text-white"
                : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
            }`}
          >
            {pathname === "/dashboard" && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B35] rounded-r-full"
              />
            )}
            <Home size={18} />
            Dashboard
          </Link>

          {/* Manage Content Dropdown */}
          <div>
            <button
              onClick={() => setManageContentOpen(!manageContentOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#A8A29E] hover:text-white hover:bg-[#2A2724] transition-all"
            >
              <span className="flex items-center gap-3">
                <FolderOpen size={18} />
                Manage Content
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${manageContentOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {manageContentOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 py-1 space-y-0.5">
                    {[
                      { name: "Categories", href: "/dashboard/categories", icon: LayoutGrid },
                      { name: "Lessons", href: "/dashboard/lessons", icon: Play },
                      { name: "File Library", href: "/dashboard/files", icon: FolderOpen },
                    ].map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                            isActive
                              ? "bg-[#2A2724] text-white"
                              : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FF6B35] rounded-r-full"
                            />
                          )}
                          <item.icon size={16} />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Manage Users Dropdown */}
          <div>
            <button
              onClick={() => setManageUsersOpen(!manageUsersOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#A8A29E] hover:text-white hover:bg-[#2A2724] transition-all"
            >
              <span className="flex items-center gap-3">
                <Users size={18} />
                Manage Users
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${manageUsersOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {manageUsersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 py-1 space-y-0.5">
                    <Link
                      href="/dashboard/users"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                        pathname === "/dashboard/users"
                          ? "bg-[#2A2724] text-white"
                          : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
                      }`}
                    >
                      {pathname === "/dashboard/users" && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FF6B35] rounded-r-full"
                        />
                      )}
                      <Users size={16} />
                      Users & Roles
                    </Link>
                    <Link
                      href="/dashboard/users/approval"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                        pathname === "/dashboard/users/approval"
                          ? "bg-[#2A2724] text-white"
                          : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
                      }`}
                    >
                      {pathname === "/dashboard/users/approval" && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FF6B35] rounded-r-full"
                        />
                      )}
                      <Shield size={16} />
                      Approvals
                      {pendingApprovalCount != null && pendingApprovalCount > 0 && (
                        <span className="ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {pendingApprovalCount > 9 ? "9+" : pendingApprovalCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Access Control Dropdown */}
          <div>
            <button
              onClick={() => setAccessControlOpen(!accessControlOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#A8A29E] hover:text-white hover:bg-[#2A2724] transition-all"
            >
              <span className="flex items-center gap-3">
                <Shield size={18} />
                Access Control
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${accessControlOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {accessControlOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 py-1 space-y-0.5">
                    <Link
                      href="/dashboard/access-control"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                        pathname === "/dashboard/access-control"
                          ? "bg-[#2A2724] text-white"
                          : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
                      }`}
                    >
                      <Shield size={16} />
                      Category Rules
                    </Link>
                    <Link
                      href="/dashboard/access-requests"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                        pathname === "/dashboard/access-requests"
                          ? "bg-[#2A2724] text-white"
                          : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
                      }`}
                    >
                      <Users size={16} />
                      Access Requests
                      {pendingAccessRequestCount != null && pendingAccessRequestCount > 0 && (
                        <span className="ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {pendingAccessRequestCount > 9 ? "9+" : pendingAccessRequestCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Search Settings */}
          <Link
            href="/dashboard/ai-search"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              pathname === "/dashboard/ai-search"
                ? "bg-[#2A2724] text-white"
                : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
            }`}
          >
            {pathname === "/dashboard/ai-search" && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B35] rounded-r-full"
              />
            )}
            <Sparkles size={18} />
            AI Search Settings
          </Link>

          {/* Enquiries */}
          <Link
            href="/dashboard/enquiries"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              pathname === "/dashboard/enquiries"
                ? "bg-[#2A2724] text-white"
                : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
            }`}
          >
            {pathname === "/dashboard/enquiries" && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B35] rounded-r-full"
              />
            )}
            <span className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F97316]/10 text-[#FDBA74] text-xs">
                💬
              </span>
              Enquiries
            </span>
            {newEnquiryCount && newEnquiryCount > 0 && (
              <span className="ml-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {newEnquiryCount > 9 ? "9+" : newEnquiryCount}
              </span>
            )}
          </Link>

          {/* Settings Dropdown */}
          <div>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#A8A29E] hover:text-white hover:bg-[#2A2724] transition-all"
            >
              <span className="flex items-center gap-3">
                <Settings size={18} />
                Settings
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Reports */}
          <Link
            href="/dashboard/reports"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              pathname === "/dashboard/reports"
                ? "bg-[#2A2724] text-white"
                : "text-[#A8A29E] hover:text-white hover:bg-[#2A2724]"
            }`}
          >
            {pathname === "/dashboard/reports" && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B35] rounded-r-full"
              />
            )}
            <BarChart3 size={18} />
            Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-[220px]">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#F5F3EF] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4C24 4 28 12 28 20C28 28 24 36 24 44C24 36 20 28 20 20C20 12 24 4 24 4Z"
                fill="#FF6B35"
              />
            </svg>
            <h1 className="text-lg text-[#1C1917]">
              <span className="font-bold">Training</span> Management System
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-[200px] pl-10 pr-4 py-2.5 bg-[#E8E6E1] rounded-xl text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
              />
            </div>

            {/* Notification */}
            <button className="relative p-2 rounded-lg hover:bg-[#E8E6E1] transition-colors">
              <Bell size={22} className="text-[#1C1917]" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6B35] rounded-full" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#C8A96E] flex items-center justify-center text-white font-semibold text-sm">
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-[#1C1917] block leading-tight">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-[10px] text-[#78716C] block leading-tight">
                    {user?.role?.replace("_", " ") || ""}
                  </span>
                </div>
              </div>
              <button
                onClick={() => void logout()}
                className="p-2 rounded-lg hover:bg-red-50 text-[#78716C] hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

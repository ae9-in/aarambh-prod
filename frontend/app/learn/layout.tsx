"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Home,
  Grid3X3,
  User,
  BarChart3,
  Trophy,
  Sparkles,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LearnSearch } from "@/components/learn-search"

const sidebarNav = [
  { name: "Home", href: "/learn", icon: Home },
  { name: "Categories", href: "/learn/categories", icon: Grid3X3 },
  { name: "Browse", href: "/learn/browse", icon: Grid3X3 },
  { name: "AI Search", href: "/learn/ai-chat", icon: Sparkles },
  { name: "Analytics", href: "/learn/analytics", icon: BarChart3 },
  { name: "Progress", href: "/learn/progress", icon: BarChart3 },
  { name: "Leaderboard", href: "/learn/leaderboard", icon: Trophy },
  { name: "Profile", href: "/learn/profile", icon: User },
]

const mobileNav = [
  { name: "Home", href: "/learn", icon: Home },
  { name: "Categories", href: "/learn/categories", icon: Grid3X3 },
  { name: "Browse", href: "/learn/browse", icon: Grid3X3 },
  { name: "AI Search", href: "/learn/ai-chat", icon: Sparkles },
  { name: "Analytics", href: "/learn/analytics", icon: BarChart3 },
  { name: "Profile", href: "/learn/profile", icon: User },
]

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const isActive = (href: string) => {
    if (href === "/learn") return pathname === "/learn"
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-[#1C1917] flex-col z-50">
        {/* Logo */}
        <div className="h-[72px] px-6 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#E85520] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C10 6 8 8 8 12C8 16 10 20 12 22C14 20 16 16 16 12C16 8 14 6 12 2Z" fill="white"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Arambh</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarNav.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <motion.div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-gradient-to-r from-[#FF6B35]/20 to-transparent text-[#FF6B35]"
                          : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon size={18} className={active ? "text-[#FF6B35]" : ""} />
                      <span className="relative z-10">{item.name}</span>
                      {active && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute left-0 w-1 h-6 rounded-r-full bg-[#FF6B35]"
                          transition={{ type: "spring", bounce: 0.3 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Search Bar in Sidebar */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <LearnSearch />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E85520] flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-white/50 text-xs truncate">{user?.department || user?.role || ""}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header with Search */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1C1917] border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#E85520] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C10 6 8 8 8 12C8 16 10 20 12 22C14 20 16 16 16 12C16 8 14 6 12 2Z" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-bold">Arambh</span>
          </div>
          <div className="flex items-center gap-2">
            <LearnSearch />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-60 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0 relative">
        {children}

        {/* Floating AI chat button (FAB) */}
        {pathname !== "/learn/ai-chat" && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.8 }}
            onClick={() => router.push("/learn/ai-chat")}
            className="fixed bottom-24 right-5 z-50"
            aria-label="Ask Arambh AI"
          >
            <span className="relative inline-flex h-13 w-13 items-center justify-center">
              <span className="absolute inline-flex h-16 w-16 animate-[ping_2s_ease-out_infinite] rounded-full bg-[rgba(255,107,53,0.25)]" />
              <span className="relative inline-flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E85520] shadow-[0_8px_32px_rgba(255,107,53,0.4)]">
                <Sparkles className="h-6 w-6 text-white" />
              </span>
            </span>
          </motion.button>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1C1917]/95 backdrop-blur-xl border-t border-[#FF6B35]/10" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around h-[72px] px-4">
          {mobileNav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className="flex flex-col items-center gap-1 py-2 px-4"
                  whileTap={{ scale: 0.88 }}
                >
                  <motion.div animate={{ scale: active ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                    <item.icon size={22} className={active ? "text-[#FF6B35]" : "text-[#4B5563]"} />
                  </motion.div>
                  {active && (
                    <motion.div
                      layoutId="tab-dot"
                      className="w-1 h-1 rounded-full bg-[#FF6B35]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

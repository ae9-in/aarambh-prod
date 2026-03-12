"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Bell, Shield, Moon, Globe, LogOut, ChevronRight, Camera } from "lucide-react"
import { toast } from "sonner"

const easeExpo = [0.16, 1, 0.3, 1]

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Edit Profile", description: "Update your personal information" },
      { icon: Camera, label: "Change Photo", description: "Update your profile picture" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", description: "Manage notification preferences", toggle: true },
      { icon: Moon, label: "Dark Mode", description: "Switch to dark theme", toggle: true },
      { icon: Globe, label: "Language", description: "English (US)", hasChevron: true },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { icon: Shield, label: "Privacy Settings", description: "Manage your data and privacy" },
    ],
  },
]

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 400)
  }, [])

  const handleToggle = (label: string) => {
    if (label === "Notifications") {
      setNotifications(!notifications)
      toast.success(notifications ? "Notifications disabled" : "Notifications enabled")
    } else if (label === "Dark Mode") {
      setDarkMode(!darkMode)
      toast.success(darkMode ? "Light mode enabled" : "Dark mode enabled")
    }
  }

  const handleLogout = () => {
    toast.success("Logged out successfully")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6 max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-[#F0EDE8] rounded animate-pulse" />
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-[#F0EDE8] rounded-2xl animate-pulse" />)}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <h1 className="text-2xl font-bold text-[#1C1917]">Settings</h1>
      </motion.div>

      {/* User Card */}
      <motion.div
        className="bg-white rounded-2xl border border-[#F0EDE8] p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: easeExpo }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E85520] flex items-center justify-center text-white text-xl font-bold">
            A
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-[#1C1917]">Ananya Sharma</h2>
            <p className="text-sm text-[#9CA3AF]">ananya.sharma@company.com</p>
          </div>
          <ChevronRight size={20} className="text-[#9CA3AF]" />
        </div>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sectionIdx * 0.1, ease: easeExpo }}
          >
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3 px-1">{section.title}</h3>
            <div className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden divide-y divide-[#F0EDE8]">
              {section.items.map((item, itemIdx) => (
                <motion.button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#FAF9F7] transition-colors text-left"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => item.toggle && handleToggle(item.label)}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                    <item.icon size={20} className="text-[#FF6B35]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1C1917]">{item.label}</p>
                    <p className="text-sm text-[#9CA3AF]">{item.description}</p>
                  </div>
                  {item.toggle ? (
                    <div
                      className={`w-12 h-7 rounded-full p-1 transition-colors ${
                        (item.label === "Notifications" ? notifications : darkMode)
                          ? "bg-[#FF6B35]"
                          : "bg-[#E7E5E4]"
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ x: (item.label === "Notifications" ? notifications : darkMode) ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  ) : item.hasChevron ? (
                    <ChevronRight size={20} className="text-[#9CA3AF]" />
                  ) : null}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: easeExpo }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-12 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <LogOut size={18} />
            Log Out
          </motion.button>
        </motion.div>
      </div>

      {/* Version */}
      <motion.p
        className="text-center text-xs text-[#9CA3AF] mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Arambh v2.0.0
      </motion.p>
    </div>
  )
}

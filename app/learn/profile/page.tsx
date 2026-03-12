"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit3, Download, Settings, Check, Bookmark, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"

const easeExpo = [0.16, 1, 0.3, 1]

const user = {
  name: "Ananya Sharma",
  role: "Sales Representative",
  department: "Mumbai Office",
  avatar: "A",
  coursesEnrolled: 23,
  coursesCompleted: 12,
  coursesSaved: 8,
}

const completedCourses = [
  { id: "1", title: "Sales Process Mastery", completedDate: "Mar 5, 2024", hasCertificate: true, image: "https://bizconsultancy.iid.org.in/basepath/thumbnail/courses-industry/31b6684f-6efe-41bf-8d92-ddb9afafd84d.jpg" },
  { id: "2", title: "Customer Service Excellence", completedDate: "Feb 28, 2024", hasCertificate: true, image: "https://media.licdn.com/dms/image/v2/D4D12AQEeytTj0cDWpA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1676263729343?e=2147483647&v=beta&t=CS9xmWsQ2cnG99LpDZen1An40MkRgiNjbAKYmze9etM" },
  { id: "3", title: "Product Knowledge Guide", completedDate: "Feb 15, 2024", hasCertificate: false, image: "https://img.freepik.com/free-photo/online-marketing_53876-176744.jpg?semt=ais_hybrid&w=740&q=80" },
]

const savedCourses = [
  { id: "4", title: "Advanced Negotiation Tactics", category: "Sales", duration: "3 hrs", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNMQMitGmehxu1YjJfVmn_ulHHUBfo1NoKeQ&s" },
  { id: "5", title: "Leadership Fundamentals", category: "Leadership", duration: "2.5 hrs", image: "https://www.leadershipdynamics.com.au/wp-content/uploads/2024/07/Untitled-design-_12_.webp" },
]

const quickActions = [
  { icon: Edit3, label: "Edit Profile", href: "/learn/settings" },
  { icon: Download, label: "Certificates", href: "/learn/certificates" },
  { icon: Settings, label: "Settings", href: "/learn/settings" },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"completed" | "saved">("completed")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 400)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-56 bg-[#1C1917]" />
        <div className="px-6 -mt-16 max-w-lg mx-auto">
          <div className="bg-[#F0EDE8] rounded-3xl h-48 animate-pulse" />
          <div className="mt-6 space-y-4">
            <div className="h-6 w-40 bg-[#F0EDE8] rounded animate-pulse" />
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#F0EDE8] rounded-2xl animate-pulse" />)}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section - Dark */}
      <div className="relative h-56 bg-[#1C1917] overflow-hidden">
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        {/* Orange blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35] rounded-full filter blur-[100px] opacity-20" />
        
        {/* Avatar & Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-4">
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E85520] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white/20 ring-offset-4 ring-offset-[#1C1917]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ease: easeExpo }}
          >
            {user.avatar}
          </motion.div>
          <motion.h1
            className="mt-4 text-xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: easeExpo }}
          >
            {user.name}
          </motion.h1>
          <motion.p
            className="text-sm text-white/60 mt-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ease: easeExpo }}
          >
            {user.role}
          </motion.p>
          <motion.p
            className="text-xs text-white/40 mt-0.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: easeExpo }}
          >
            {user.department}
          </motion.p>
        </div>
      </div>

      {/* Stats Card - Overlapping */}
      <div className="px-4 -mt-10 max-w-lg mx-auto">
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-xl shadow-black/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ease: easeExpo }}
        >
          {/* Stats Row */}
          <div className="flex items-center justify-around">
            {[
              { value: user.coursesEnrolled, label: "Courses" },
              { value: user.coursesCompleted, label: "Completed" },
              { value: user.coursesSaved, label: "Saved" },
            ].map((stat, idx) => (
              <div key={stat.label} className="text-center flex-1 relative">
                <p className="text-2xl font-bold text-[#1C1917]">{stat.value}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
                {idx < 2 && <div className="absolute right-0 top-1 bottom-1 w-px bg-[#F0EDE8]" />}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-5 pt-5 border-t border-[#F0EDE8]">
            {quickActions.map((action, idx) => (
              <Link key={action.label} href={action.href} className="flex-1">
                <motion.div
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border border-[#F0EDE8] hover:border-[#FF6B35] transition-colors group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05, ease: easeExpo }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <action.icon size={18} className="text-[#6B7280] group-hover:text-[#FF6B35] transition-colors" />
                  <span className="text-[11px] text-[#6B7280] group-hover:text-[#1C1917] transition-colors">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-6 max-w-lg mx-auto">
        <div className="flex gap-2 p-1 bg-[#F0EDE8] rounded-xl">
          {(["completed", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-white text-[#1C1917] shadow-sm" : "text-[#9CA3AF]"
              }`}
            >
              {tab === "completed" ? "Completed" : "Saved"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "completed" ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ ease: easeExpo }}
              className="space-y-3"
            >
              {completedCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#F0EDE8]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, ease: easeExpo }}
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#1C1917] truncate">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">Completed</span>
                      <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                        <Calendar size={10} /> {course.completedDate}
                      </span>
                    </div>
                  </div>
                  {course.hasCertificate ? (
                    <Link href="/learn/certificates" className="text-xs text-[#FF6B35] font-medium hover:underline whitespace-nowrap">
                      Certificate →
                    </Link>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={14} className="text-green-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ ease: easeExpo }}
              className="space-y-3"
            >
              {savedCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#F0EDE8] cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, ease: easeExpo }}
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#1C1917] truncate">{course.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mt-0.5">
                      <span>{course.category}</span>
                      <span>•</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  <Bookmark size={18} className="text-[#FF6B35] fill-[#FF6B35]" />
                  <ChevronRight size={16} className="text-[#9CA3AF]" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

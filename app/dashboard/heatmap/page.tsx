"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"
import { AlertCircle } from "lucide-react"
import CountUp from "react-countup"

const easeExpo = [0.16, 1, 0.3, 1]

export default function HeatmapPage() {
  const { state } = useApp()
  const [dateFilter, setDateFilter] = useState("30")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => setTimeout(() => setIsLoading(false), 500), [])

  const heatmapData = state.heatmapData || {}
  const stats = Object.values(heatmapData).reduce((acc, d) => ({
    views: acc.views + (d.views || 0),
    avgCompletion: acc.avgCompletion + (d.completionRate || 0)
  }), { views: 0, avgCompletion: 0 })

  const avgCompletion = Math.round(stats.avgCompletion / (Object.keys(heatmapData).length || 1))
  const atRiskCount = Object.values(heatmapData).filter(d => d.engagementLevel === "LOW").length

  if (isLoading) return <div className="h-40 bg-[#E7E5E4] rounded-lg animate-pulse" />

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <h1 className="text-3xl font-bold text-[#1C1917]">Content Heatmap</h1>
        <p className="text-[#78716C] mt-1">Engagement analysis</p>
      </motion.div>

      <motion.div className="flex gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {["7", "30", "90"].map(days => (
          <motion.button key={days} onClick={() => setDateFilter(days)} className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === days ? "bg-[#FF6B35] text-white" : "bg-white border border-[#E7E5E4]"}`} whileHover={{ scale: 1.05 }}>{days}d</motion.button>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {[{ label: "Total Views", value: stats.views }, { label: "Avg Completion", value: avgCompletion, suffix: "%" }, { label: "At Risk", value: atRiskCount }, { label: "Engagement Avg", value: 72 }].map((stat, i) => (
          <motion.div key={stat.label} className="bg-white rounded-xl border border-[#E7E5E4] p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <p className="text-sm text-[#78716C]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1C1917] mt-1"><CountUp end={stat.value} />{stat.suffix || ""}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid md:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {state.lessons.slice(0, 3).map((lesson, idx) => {
          const data = heatmapData[lesson.id] || { views: 0, completionRate: 0, engagementLevel: "LOW" }
          const colorMap = { HIGH: "#10B981", MEDIUM: "#FF8A00", LOW: "#FF4D6D" }
          return (
            <motion.div key={lesson.id} className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.05 }}>
              <div className="h-24 bg-gradient-to-br from-[#1C1917] to-[#2C2723] relative">
                <div className="absolute inset-0 opacity-20" style={{ backgroundColor: colorMap[data.engagementLevel] }} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#1C1917] truncate">{lesson.title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#78716C]">Views</span><span className="font-bold">{data.views}</span></div>
                  <div className="flex justify-between"><span className="text-[#78716C]">Completion</span><span className="font-bold">{data.completionRate}%</span></div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div className="grid md:grid-cols-2 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <motion.div className="bg-white rounded-xl border border-[#E7E5E4] p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-bold text-[#1C1917] mb-4">Employee Engagement</h2>
          <div className="space-y-3">
            {state.users.slice(0, 4).map(user => (
              <div key={user.id} className="flex justify-between items-center"><span className="text-sm font-medium">{user.name}</span><div className="w-24 h-2 bg-[#E7E5E4] rounded-full overflow-hidden"><motion.div className="h-full bg-[#FF6B35]" initial={{ width: 0 }} animate={{ width: `${(user.completedLessons?.length || 0) * 10}%` }} transition={{ duration: 1 }} /></div></div>
            ))}
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl border border-[#E7E5E4] p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="font-bold text-[#1C1917] mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-orange-500" /> Needs Attention</h2>
          <div className="space-y-3">
            {state.lessons.filter(l => heatmapData[l.id]?.engagementLevel === "LOW").slice(0, 3).map(lesson => (
              <div key={lesson.id} className="flex items-center justify-between"><span className="text-sm font-medium text-[#1C1917] truncate">{lesson.title}</span><button className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-lg font-semibold">Review</button></div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

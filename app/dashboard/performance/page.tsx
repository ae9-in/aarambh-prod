"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useApp } from "@/lib/store"
import CountUp from "react-countup"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, TrendingUp } from "lucide-react"

const easeExpo = [0.16, 1, 0.3, 1]

export default function PerformancePage() {
  const { state } = useApp()
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => setTimeout(() => setIsLoading(false), 500), [])

  const teamAvg = Math.round(state.users.reduce((sum, u) => sum + (u.score || 0), 0) / (state.users.length || 1))
  const topPerformer = [...state.users].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
  const atRisk = state.users.filter(u => (u.score || 0) < 40)
  const sortedUsers = [...state.users].sort((a, b) => (b.score || 0) - (a.score || 0))

  const scoreData = [
    { name: "Completion", value: 40, fill: "#FF6B35" },
    { name: "Quiz Score", value: 35, fill: "#C8A96E" },
    { name: "Time Spent", value: 15, fill: "#10B981" },
    { name: "Consistency", value: 10, fill: "#6B7280" }
  ]

  if (isLoading) return <div className="h-40 bg-[#E7E5E4] rounded-lg animate-pulse" />

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <h1 className="text-3xl font-bold text-[#1C1917]">Performance Analytics</h1>
        <p className="text-[#78716C] mt-1">Track team learning progress</p>
      </motion.div>

      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {[
          { label: "Team Avg", value: teamAvg, color: "#FF6B35" },
          { label: "Top Performer", value: topPerformer?.score || 0, color: "#C8A96E" },
          { label: "At Risk", value: atRisk.length, color: "#F97316" },
          { label: "Perfect Scores", value: state.users.filter(u => (u.score || 0) >= 95).length, color: "#10B981" }
        ].map((stat, i) => (
          <motion.div key={stat.label} className="bg-white rounded-xl border border-[#E7E5E4] p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <p className="text-sm text-[#78716C]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1C1917] mt-1"><CountUp end={stat.value} duration={1} /></p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gauge */}
        <motion.div className="bg-white rounded-xl border border-[#E7E5E4] p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="font-bold text-[#1C1917] mb-4">Team Performance Gauge</h2>
          <div className="flex justify-center">
            <div className="text-5xl font-bold text-[#FF6B35]"><CountUp end={teamAvg} />%</div>
          </div>
        </motion.div>

        {/* Score Distribution */}
        <motion.div className="bg-white rounded-xl border border-[#E7E5E4] p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="font-bold text-[#1C1917] mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={scoreData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value"><BarChart><Tooltip /></BarChart>{scoreData.map((entry, idx) => (<Cell key={idx} fill={entry.fill} />))}</Pie></PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Leaderboard */}
      <motion.div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="p-6 border-b border-[#E7E5E4]"><h2 className="font-bold text-[#1C1917]">Team Leaderboard</h2></div>
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E7E5E4]">
            <tr><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Rank</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Name</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Score</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Trend</th></tr>
          </thead>
          <tbody>
            {sortedUsers.slice(0, 5).map((user, idx) => (
              <motion.tr key={user.id} className={`border-b border-[#E7E5E4] cursor-pointer hover:bg-[#F9FAFB] ${idx === 0 || idx === 1 || idx === 2 ? "border-l-4 border-l-[#FF6B35]" : ""}`} onClick={() => setSelectedUser(user)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                <td className="px-6 py-4 font-bold text-[#1C1917]">#{idx + 1}</td>
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div><span>{user.name}</span></div></td>
                <td className="px-6 py-4 font-bold text-[#FF6B35]"><CountUp end={user.score || 0} /></td>
                <td className="px-6 py-4"><span className="text-green-600 flex items-center gap-1"><TrendingUp size={14} /> {(user.rankChange || 0) > 0 ? "↑" : "↓"}</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{selectedUser?.name}'s Performance</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-[#78716C]">Score</span><span className="font-bold text-[#FF6B35]"><CountUp end={selectedUser?.score || 0} />%</span></div>
            <div className="flex items-center justify-between"><span className="text-[#78716C]">XP</span><span className="font-bold"><CountUp end={selectedUser?.xp || 0} /></span></div>
            <button className="w-full py-2 bg-[#FF6B35] text-white rounded-lg">Assign Training</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

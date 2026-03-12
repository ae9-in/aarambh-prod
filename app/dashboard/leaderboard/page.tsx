"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"
import CountUp from "react-countup"

const easeExpo = [0.16, 1, 0.3, 1]

export default function LeaderboardPage() {
  const { state } = useApp()
  const [tab, setTab] = useState("week")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => setTimeout(() => setIsLoading(false), 500), [])

  const getRankings = () => {
    const copy = [...state.users]
    if (tab === "week") return copy.sort((a, b) => (b.weeklyXP || b.xp / 4) - (a.weeklyXP || a.xp / 4))
    if (tab === "month") return copy.sort((a, b) => (b.monthlyXP || b.xp / 2) - (a.monthlyXP || a.xp / 2))
    return copy.sort((a, b) => b.xp - a.xp)
  }

  const rankings = getRankings()
  const currentUserRank = rankings.findIndex(u => u.id === state.currentUser?.id) + 1

  if (isLoading) return <div className="h-40 bg-[#E7E5E4] rounded-lg animate-pulse" />

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <h1 className="text-3xl font-bold text-[#1C1917]">Leaderboard</h1>
        <p className="text-[#78716C] mt-1">Team performance rankings</p>
      </motion.div>

      <motion.div className="flex gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {["week", "month", "allTime"].map(t => (
          <motion.button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-lg font-medium transition-all ${tab === t ? "bg-[#FF6B35] text-white" : "bg-white border border-[#E7E5E4]"}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {t === "week" ? "This Week" : t === "month" ? "This Month" : "All Time"}
          </motion.button>
        ))}
      </motion.div>

      {/* Podium */}
      <motion.div className="grid grid-cols-3 gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {rankings.slice(0, 3).map((user, idx) => (
          <motion.div key={user.id} className={`text-center p-6 rounded-xl border ${idx === 0 ? "bg-gradient-to-b from-[#FFD700] to-[#FFA500] border-[#FFD700] col-span-1 order-2" : idx === 1 ? "bg-gradient-to-b from-[#C0C0C0] to-[#808080] border-[#C0C0C0]" : "bg-gradient-to-b from-[#CD7F32] to-[#8B4513] border-[#CD7F32]"}`} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}>
            <div className="text-4xl font-bold text-white mb-2">{idx + 1}</div>
            <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-white text-[#FF6B35] flex items-center justify-center font-bold text-sm">{user.name.charAt(0)}</div>
            <h3 className="font-bold text-white text-lg">{user.name}</h3>
            <p className="text-white/80 text-sm"><CountUp end={tab === "week" ? (user.weeklyXP || user.xp / 4) : tab === "month" ? (user.monthlyXP || user.xp / 2) : user.xp} /> XP</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Full List */}
      <motion.div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E7E5E4]">
            <tr><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Rank</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Name</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">XP</th><th className="text-left text-xs font-semibold text-[#78716C] px-6 py-4">Streak</th></tr>
          </thead>
          <tbody>
            {rankings.slice(3).map((user, idx) => (
              <motion.tr key={user.id} className={`border-b border-[#E7E5E4] hover:bg-[#F9FAFB] ${state.currentUser?.id === user.id ? "bg-orange-50" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}>
                <td className="px-6 py-4 font-bold">#{idx + 4}</td>
                <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div><span>{user.name}</span></div></td>
                <td className="px-6 py-4 font-bold text-[#FF6B35]"><CountUp end={tab === "week" ? (user.weeklyXP || user.xp / 4) : tab === "month" ? (user.monthlyXP || user.xp / 2) : user.xp} /></td>
                <td className="px-6 py-4">{user.streak || 0} days</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}

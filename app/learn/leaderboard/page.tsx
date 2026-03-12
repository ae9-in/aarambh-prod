"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Star,
  Zap,
} from "lucide-react"

// Mock leaderboard data
const leaderboardData = [
  {
    id: 1,
    rank: 1,
    previousRank: 1,
    name: "Ankit Patel",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    department: "Operations",
    xp: 4250,
    streak: 15,
    lessonsCompleted: 45,
  },
  {
    id: 2,
    rank: 2,
    previousRank: 3,
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    department: "Customer Service",
    xp: 3890,
    streak: 12,
    lessonsCompleted: 42,
  },
  {
    id: 3,
    rank: 3,
    previousRank: 2,
    name: "Vikram Singh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    department: "Safety",
    xp: 3650,
    streak: 10,
    lessonsCompleted: 38,
  },
  {
    id: 4,
    rank: 4,
    previousRank: 5,
    name: "Sneha Reddy",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    department: "HR",
    xp: 3200,
    streak: 8,
    lessonsCompleted: 35,
  },
  {
    id: 5,
    rank: 5,
    previousRank: 4,
    name: "Amit Kumar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    department: "Production",
    xp: 3100,
    streak: 7,
    lessonsCompleted: 32,
  },
  {
    id: 6,
    rank: 6,
    previousRank: 8,
    name: "Neha Gupta",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    department: "Quality",
    xp: 2950,
    streak: 9,
    lessonsCompleted: 30,
  },
  {
    id: 7,
    rank: 7,
    previousRank: 6,
    name: "Ravi Verma",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    department: "Operations",
    xp: 2800,
    streak: 5,
    lessonsCompleted: 28,
  },
  {
    id: 8,
    rank: 8,
    previousRank: 9,
    name: "Kavita Shah",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    department: "Training",
    xp: 2650,
    streak: 11,
    lessonsCompleted: 27,
  },
  {
    id: 9,
    rank: 9,
    previousRank: 7,
    name: "Sanjay Joshi",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
    department: "Maintenance",
    xp: 2500,
    streak: 4,
    lessonsCompleted: 25,
  },
  {
    id: 10,
    rank: 10,
    previousRank: 11,
    name: "Deepika Nair",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
    department: "Safety",
    xp: 2480,
    streak: 6,
    lessonsCompleted: 24,
  },
  // Current user
  {
    id: 11,
    rank: 12,
    previousRank: 14,
    name: "Rahul Kumar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    department: "Production",
    xp: 2450,
    streak: 7,
    lessonsCompleted: 24,
    isCurrentUser: true,
  },
]

type Period = "weekly" | "monthly" | "all-time"

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("weekly")
  const [showUserCard, setShowUserCard] = useState(true)

  const currentUser = leaderboardData.find((u) => u.isCurrentUser)
  const topThree = leaderboardData.slice(0, 3)
  const restOfList = leaderboardData.slice(3)

  const getRankChange = (rank: number, previousRank: number) => {
    if (rank < previousRank) return { direction: "up", change: previousRank - rank }
    if (rank > previousRank) return { direction: "down", change: rank - previousRank }
    return { direction: "same", change: 0 }
  }

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return { bg: "from-[#FFD700] to-[#FFA500]", icon: Crown, text: "text-[#FFD700]" }
      case 2:
        return { bg: "from-[#C0C0C0] to-[#A0A0A0]", icon: Medal, text: "text-[#C0C0C0]" }
      case 3:
        return { bg: "from-[#CD7F32] to-[#A05010]", icon: Medal, text: "text-[#CD7F32]" }
      default:
        return { bg: "from-[#FF6B35] to-[#FF8C5A]", icon: Trophy, text: "text-[#FF6B35]" }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-6 pb-4"
        >
          <h1 className="text-2xl font-bold text-[#1C1917] mb-2">Leaderboard</h1>
          <p className="text-sm text-[#78716C]">Compete with your colleagues</p>
        </motion.div>

        {/* Period Tabs */}
        <div className="px-4 mb-6">
          <div className="flex p-1 bg-[#E7E5E4] rounded-xl">
            {(["weekly", "monthly", "all-time"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-white text-[#1C1917] shadow-sm"
                    : "text-[#78716C]"
                }`}
              >
                {p === "all-time" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 mb-6"
        >
          <div className="flex items-end justify-center gap-2">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center w-24"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-[#C0C0C0]">
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A0A0A0] flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
              </div>
              <p className="text-xs font-semibold text-[#1C1917] text-center truncate w-full">
                {topThree[1].name.split(" ")[0]}
              </p>
              <p className="text-[10px] text-[#78716C]">{topThree[1].xp.toLocaleString()} XP</p>
              <div className="w-full h-20 mt-2 bg-gradient-to-t from-[#C0C0C0] to-[#E0E0E0] rounded-t-xl" />
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center w-28"
            >
              <motion.div
                className="mb-1"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown size={28} className="text-[#FFD700]" fill="#FFD700" />
              </motion.div>
              <div className="relative mb-2">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#FFD700]">
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
              </div>
              <p className="text-sm font-bold text-[#1C1917] text-center truncate w-full">
                {topThree[0].name.split(" ")[0]}
              </p>
              <p className="text-xs text-[#FF6B35] font-semibold">
                {topThree[0].xp.toLocaleString()} XP
              </p>
              <div className="w-full h-28 mt-2 bg-gradient-to-t from-[#FFD700] to-[#FFF4C4] rounded-t-xl" />
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center w-24"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-[#CD7F32]">
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#A05010] flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
              </div>
              <p className="text-xs font-semibold text-[#1C1917] text-center truncate w-full">
                {topThree[2].name.split(" ")[0]}
              </p>
              <p className="text-[10px] text-[#78716C]">{topThree[2].xp.toLocaleString()} XP</p>
              <div className="w-full h-14 mt-2 bg-gradient-to-t from-[#CD7F32] to-[#DFA070] rounded-t-xl" />
            </motion.div>
          </div>
        </motion.div>

        {/* Rest of Leaderboard */}
        <div className="px-4 space-y-2 pb-6">
          {restOfList.map((user, index) => {
            const rankChange = getRankChange(user.rank, user.previousRank)
            const isCurrentUser = user.isCurrentUser

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isCurrentUser
                    ? "bg-[#FF6B35]/5 border-[#FF6B35]/30"
                    : "bg-white border-[#E7E5E4]"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  <span className={`text-lg font-bold ${isCurrentUser ? "text-[#FF6B35]" : "text-[#1C1917]"}`}>
                    {user.rank}
                  </span>
                </div>

                {/* Rank Change */}
                <div className="w-5">
                  {rankChange.direction === "up" && (
                    <TrendingUp size={14} className="text-[#10B981]" />
                  )}
                  {rankChange.direction === "down" && (
                    <TrendingDown size={14} className="text-red-500" />
                  )}
                  {rankChange.direction === "same" && (
                    <Minus size={14} className="text-[#78716C]" />
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${
                  isCurrentUser ? "ring-[#FF6B35]" : "ring-transparent"
                }`}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${
                      isCurrentUser ? "text-[#FF6B35]" : "text-[#1C1917]"
                    }`}>
                      {user.name}
                      {isCurrentUser && <span className="text-xs"> (You)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#78716C]">
                    <span>{user.department}</span>
                    <span className="flex items-center gap-0.5">
                      <Flame size={10} className="text-[#F59E0B]" />
                      {user.streak}
                    </span>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className={`text-sm font-bold ${isCurrentUser ? "text-[#FF6B35]" : "text-[#1C1917]"}`}>
                    {user.xp.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#78716C]">XP</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Floating Current User Card */}
        <AnimatePresence>
          {showUserCard && currentUser && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto z-40"
            >
              <div className="bg-[#1C1917] rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#FF6B35]">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">#{currentUser.rank}</span>
                      <TrendingUp size={14} className="text-[#10B981]" />
                      <span className="text-[#10B981] text-xs">+2</span>
                    </div>
                    <p className="text-[#A8A29E] text-xs">You need 150 XP to reach #11</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FF6B35] font-bold text-lg">{currentUser.xp.toLocaleString()}</p>
                    <p className="text-[#A8A29E] text-xs">XP</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

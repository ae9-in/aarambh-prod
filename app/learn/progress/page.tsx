"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Flame, Zap, Trophy, Calendar, Lock, Star } from "lucide-react"
import { useApp } from "@/lib/store"
import { getNextLevel } from "@/lib/interactivity-helpers"
import { CountUp } from "@/components/count-up"

export default function ProgressPage() {
  const { state } = useApp()
  const user = state.currentUser
  const weekly = state.weeklyActivity ?? []

  const [scoreProgress, setScoreProgress] = useState(0)
  const [xpProgress, setXpProgress] = useState(0)
  const [entered, setEntered] = useState(false)
  const [activeBar, setActiveBar] = useState<string | null>(null)

  useEffect(() => {
    setEntered(true)
  }, [])

  const derived = useMemo(() => {
    if (!user) return null
    const nextLevel = getNextLevel(user.xp)

    const earnedIds = new Set(user.badges)
    const badges = state.badges.map((b) => ({
      ...b,
      earned: earnedIds.has(b.id),
    }))

    const today = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const isToday = i === 0
      const active = user.completedLessons.length > 0 && Math.random() > 0.5 // simple synthetic streak
      days.push({ date: key, isToday, active })
    }

    return {
      nextLevel,
      badges,
      streakDays: days,
    }
  }, [state.badges, user])

  useEffect(() => {
    if (!user || !derived) return
    const targetScore = Math.min(100, Math.round(user.score * 20))
    const targetXp = Math.min(100, (user.xp / derived.nextLevel.required) * 100)
    const timer = setTimeout(() => {
      setScoreProgress(targetScore)
      setXpProgress(targetXp)
    }, 300)
    return () => clearTimeout(timer)
  }, [derived, user])

  if (!user || !derived) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#78716C]">
        Loading progress...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        <header className="mb-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#F97316]" />
            Progress & insights
          </h1>
          <p className="text-xs text-slate-400">Track your learning momentum over time.</p>
        </header>

        {/* Score gauge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 mb-4"
        >
          <h2 className="text-sm font-medium text-slate-100 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Performance score
          </h2>
          <div className="relative w-44 h-24 mx-auto">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1F2937"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <motion.path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#F97316"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * scoreProgress) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <span className="text-3xl font-bold text-slate-50">
                <CountUp value={scoreProgress} />
              </span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
          </div>
        </motion.div>

        {/* XP bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800">
                <Zap className="w-4 h-4 text-[#F97316]" />
              </span>
              <div>
                <p className="text-xs text-slate-400">XP to next level</p>
                <p className="text-sm font-semibold text-slate-100">{derived.nextLevel.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#F97316]">
                <CountUp value={user.xp} />
              </p>
              <p className="text-xs text-slate-400">
                / {derived.nextLevel.required.toLocaleString()} XP
              </p>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F97316] to-[#FB923C] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Weekly activity */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Weekly activity
            </h2>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-end justify-between gap-2 h-36">
              {weekly.map((day, index) => {
                const maxLessons = Math.max(...weekly.map((d) => d.lessonsCompleted || 1))
                const height = maxLessons ? (day.lessonsCompleted / maxLessons) * 100 : 0
                const isActive = activeBar === day.day
                return (
                  <motion.button
                    key={day.day}
                    type="button"
                    onClick={() => setActiveBar(day.day)}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${height}%`, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex-1 flex flex-col items-center justify-end gap-1 group"
                  >
                    <div
                      className={`w-6 rounded-full bg-gradient-to-t from-[#F97316] to-[#FDBA74] group-hover:from-[#FDBA74] ${
                        isActive ? "ring-2 ring-amber-400" : ""
                      }`}
                      style={{ minHeight: "12px" }}
                    />
                    <span className="text-[10px] text-slate-400">{day.day}</span>
                    {isActive && (
                      <div className="absolute -translate-y-20 px-2 py-1 rounded-md bg-slate-900 text-[10px] text-slate-100 shadow border border-slate-800">
                        <div>{day.lessonsCompleted} lessons</div>
                        <div className="text-slate-400">{day.minutesSpent} min</div>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Streak calendar */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#F97316]" />
              30-day streak
            </h2>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <div className="grid grid-cols-10 gap-2">
              {derived.streakDays.map((d) => (
                <div
                  key={d.date}
                  className="flex items-center justify-center"
                >
                  <div
                    className={[
                      "w-5 h-5 rounded-full border",
                      d.isToday
                        ? "border-[#F97316] flex items-center justify-center"
                        : "border-slate-700",
                      d.active ? "bg-[#F97316]" : "bg-slate-900",
                    ].join(" ")}
                  >
                    {d.isToday && !d.active && (
                      <div className="w-2 h-2 rounded-full bg-[#F97316]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Badges
            </h2>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <div className="grid grid-cols-4 gap-3">
              {derived.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="relative flex flex-col items-center p-2 rounded-xl border border-slate-800"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                      badge.earned ? "" : "grayscale opacity-40"
                    }`}
                    style={{ backgroundColor: badge.earned ? `${badge.color}20` : "#1F2937" }}
                  >
                    {badge.earned ? (
                      <span className="text-base">{badge.icon}</span>
                    ) : (
                      <Lock className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] text-center leading-tight ${
                      badge.earned ? "text-slate-100" : "text-slate-500"
                    }`}
                  >
                    {badge.name}
                  </span>
                  {badge.earned && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Star className="w-2 h-2 text-white" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


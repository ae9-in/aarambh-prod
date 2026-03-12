"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { CountUp } from "@/components/count-up"
import {
  Flame,
  Trophy,
  BookOpen,
  Target,
  Zap,
  Star,
  CheckCircle2,
} from "lucide-react"

const easeExpo = [0.16, 1, 0.3, 1]

function getNextLevel(xp: number): { name: string; required: number; current: number } {
  if (xp < 500) return { name: "Learner", required: 500, current: xp }
  if (xp < 1500) return { name: "Expert", required: 1500, current: xp }
  if (xp < 3500) return { name: "Champion", required: 3500, current: xp }
  return { name: "Champion", required: 3500, current: xp }
}

type ProgressRow = {
  id: string
  title: string | null
  completion_percent: number | null
  xp_reward: number | null
  status: string
}

type AnalyticsPayload = {
  leaderboard?: { id: string; xp_points: number | null }[]
}

export default function LearnAnalyticsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsPayload>({})
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([])
  const [xpPoints, setXpPoints] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [badges, setBadges] = useState<string[]>([])

  const loadLiveData = useCallback(async () => {
    if (!user?.id || !user?.orgId) return
    try {
      const [analyticsRes, progressRes, profileRes, userBadgesRes] = await Promise.all([
        fetch(`/api/analytics?orgId=${encodeURIComponent(user.orgId)}`, {
          credentials: "include",
        }),
        fetch(
          `/api/progress?userId=${encodeURIComponent(user.id)}&orgId=${encodeURIComponent(
            user.orgId,
          )}`,
          { credentials: "include" },
        ),
        supabase
          .from("profiles")
          .select("xp_points,streak_days")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
      ])

      const analyticsJson = analyticsRes.ok ? await analyticsRes.json() : {}
      const progressJson = progressRes.ok ? await progressRes.json() : { progress: [] }

      setAnalytics(analyticsJson ?? {})
      setProgressRows((progressJson?.progress as ProgressRow[]) ?? [])
      setXpPoints((profileRes.data?.xp_points as number | null) ?? user.xpPoints ?? 0)
      setStreakDays((profileRes.data?.streak_days as number | null) ?? user.streakDays ?? 0)

      const badgeIds = (userBadgesRes.data ?? []).map((b: any) => String(b.badge_id))
      if (badgeIds.length > 0) {
        const { data: badgeRows } = await supabase
          .from("badges")
          .select("id,name")
          .in("id", badgeIds)
          .limit(6)
        const names = (badgeRows ?? []).map((b: any) => String(b.name))
        setBadges(names)
      } else {
        setBadges([])
      }
    } catch (e) {
      console.error("analytics live load error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, user?.orgId, user?.streakDays, user?.xpPoints])

  useEffect(() => {
    void loadLiveData()
  }, [loadLiveData])

  useEffect(() => {
    if (!user?.id || !user?.orgId) return
    const channel = supabase
      .channel(`learn-analytics-${user.orgId}-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_progress", filter: `user_id=eq.${user.id}` },
        () => void loadLiveData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => void loadLiveData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_badges", filter: `user_id=eq.${user.id}` },
        () => void loadLiveData(),
      )
      .subscribe()

    const intervalId = window.setInterval(() => {
      void loadLiveData()
    }, 15000)

    return () => {
      window.clearInterval(intervalId)
      void supabase.removeChannel(channel)
    }
  }, [loadLiveData, user?.id, user?.orgId])

  const derived = useMemo(() => {
    const lessonsDone = progressRows.filter((p) => (p.status || "").toUpperCase() === "COMPLETED").length
    const rankList = analytics.leaderboard ?? []
    const userRankIndex = rankList.findIndex((r) => r.id === user?.id)
    const rank = userRankIndex >= 0 ? userRankIndex + 1 : rankList.length + 1
    const nextLevel = getNextLevel(xpPoints)
    const xpToNext = Math.max(nextLevel.required - xpPoints, 0)

    const lessonScores =
      progressRows.length > 0
        ? progressRows.slice(0, 10).map((p) => ({
            id: p.id,
            title: p.title || "Untitled lesson",
            progress: p.completion_percent ?? 0,
            xp: p.xp_reward ?? 0,
          }))
        : []

    return { lessonsDone, rank, nextLevel, xpToNext, lessonScores }
  }, [analytics.leaderboard, progressRows, user?.id, xpPoints])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#78716C]">
        Loading analytics...
      </div>
    )
  }

  const xpProgress = Math.min(100, (xpPoints / derived.nextLevel.required) * 100)

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6 max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-[#F0EDE8] rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#F0EDE8] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1C1917]">Analytics overview</h1>
        <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#F97316]">
          Live updates every few seconds
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="rounded-2xl bg-white border border-[#F3EEE9] px-4 py-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
          <div className="flex items-center justify-between"><span className="text-xs text-[#6B7280]">Lessons done</span><BookOpen className="h-4 w-4 text-[#F97316]" /></div>
          <p className="text-2xl font-bold text-[#111827]"><CountUp value={derived.lessonsDone} /></p>
          <p className="text-[11px] text-[#9CA3AF]">from your real progress</p>
        </motion.div>

        <motion.div className="rounded-2xl bg-white border border-[#F3EEE9] px-4 py-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo, delay: 0.05 }}>
          <div className="flex items-center justify-between"><span className="text-xs text-[#6B7280]">XP points</span><Zap className="h-4 w-4 text-[#F97316]" /></div>
          <p className="text-2xl font-bold text-[#111827]"><CountUp value={xpPoints} /></p>
          <p className="text-[11px] text-[#9CA3AF]">live from your profile</p>
        </motion.div>

        <motion.div className="rounded-2xl bg-white border border-[#F3EEE9] px-4 py-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo, delay: 0.1 }}>
          <div className="flex items-center justify-between"><span className="text-xs text-[#6B7280]">Day streak</span><Flame className="h-4 w-4 text-[#F97316]" /></div>
          <p className="text-2xl font-bold text-[#111827]"><CountUp value={streakDays} /></p>
          <p className="text-[11px] text-[#9CA3AF]">current streak</p>
        </motion.div>

        <motion.div className="rounded-2xl bg-white border border-[#F3EEE9] px-4 py-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo, delay: 0.15 }}>
          <div className="flex items-center justify-between"><span className="text-xs text-[#6B7280]">Global rank</span><Trophy className="h-4 w-4 text-[#F97316]" /></div>
          <p className="text-2xl font-bold text-[#111827]">#<CountUp value={derived.rank} /></p>
          <p className="text-[11px] text-[#9CA3AF]">among teammates</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] gap-4 items-stretch">
        <motion.div className="rounded-3xl bg-gradient-to-r from-[#F97316] to-[#FB923C] px-5 py-4 text-white shadow-xl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: easeExpo }}>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em]">Streak</p>
          <p className="text-2xl font-extrabold mt-2"><CountUp value={streakDays} /> day streak</p>
          <p className="text-xs text-white/80 mt-1">Stay active every day to boost your learning score.</p>
        </motion.div>

        <motion.div className="rounded-3xl bg-white border border-[#F3EEE9] px-5 py-4 shadow-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: easeExpo }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-[#6B7280]">XP level card</p>
              <p className="text-sm font-semibold text-[#111827]">{derived.nextLevel.name}</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2 py-1 text-[10px] font-semibold text-[#F97316]">
              <Star className="h-3 w-3" />
              {Math.round(xpProgress)}% to next
            </div>
          </div>
          <p className="text-xl font-bold text-[#F97316]"><CountUp value={xpPoints} /> <span className="text-sm text-[#6B7280]">/ {derived.nextLevel.required} XP</span></p>
          <p className="text-[11px] text-[#6B7280] mb-2"><CountUp value={derived.xpToNext} /> XP to next level</p>
          <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#FACC15]" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, ease: easeExpo }} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)] gap-5 items-start">
        <div className="rounded-3xl bg-white border border-[#F3EEE9] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#111827]">Lesson score breakdown</p>
            <span className="text-[11px] text-[#9CA3AF]">{derived.lessonScores.length} lessons</span>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {derived.lessonScores.map((ls) => (
              <div key={ls.id} className="flex items-center gap-3 rounded-2xl bg-[#F9F5F0] px-3 py-2">
                <div className="h-8 w-8 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#F97316]">
                  <Target className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-medium text-[#111827]">{ls.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                    <span>Progress</span>
                    <span className="text-[#F97316] font-semibold"><CountUp value={ls.progress} />%</span>
                    <span>•</span>
                    <span><CountUp value={ls.xp} /> XP</span>
                  </div>
                </div>
                <div className="w-20 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div className="h-full rounded-full bg-[#F97316]" style={{ width: `${ls.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-[#F3EEE9] px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#111827]">Recent badges</p>
              <span className="text-[11px] text-[#9CA3AF]">{badges.length} earned</span>
            </div>
            <div className="flex gap-2">
              {badges.slice(0, 4).map((name) => (
                <div key={name} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#FACC15] text-white text-xs font-bold shadow-lg">
                  {name[0]}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-[#F3EEE9] px-4 py-4 space-y-3">
            <p className="text-sm font-semibold text-[#111827]">Quick actions</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button className="flex h-20 flex-col items-start justify-between rounded-2xl bg-[#FFF7ED] px-3 py-2 text-left text-[#7C2D12] shadow-sm">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#F97316]"><Target className="h-4 w-4" /></span>
                <span className="font-semibold">Take a quiz</span>
              </button>
              <button className="flex h-20 flex-col items-start justify-between rounded-2xl bg-[#EFF6FF] px-3 py-2 text-left text-[#1D4ED8] shadow-sm">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1D4ED8]"><BookOpen className="h-4 w-4" /></span>
                <span className="font-semibold">View progress</span>
              </button>
              <button className="flex h-20 flex-col items-start justify-between rounded-2xl bg-[#ECFDF3] px-3 py-2 text-left text-[#166534] shadow-sm">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#16A34A]"><CheckCircle2 className="h-4 w-4" /></span>
                <span className="font-semibold">Complete today&apos;s path</span>
              </button>
              <button className="flex h-20 flex-col items-start justify-between rounded-2xl bg-[#FDF2F8] px-3 py-2 text-left text-[#9D174D] shadow-sm">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#DB2777]"><Star className="h-4 w-4" /></span>
                <span className="font-semibold">Invite colleague</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

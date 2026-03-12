"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Play,
  Lock,
  CheckCircle2,
  Clock,
  Zap,
  Trophy,
  ChevronRight,
  Star,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Lesson {
  id: string
  title: string
  description: string | null
  type: string
  xp_reward: number | null
  duration_minutes: number | null
  file_url: string | null
  has_quiz: boolean
}

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

interface UserProgress {
  content_id: string
  status: string
  completion_percent: number
}

function CircularProgress({ percent, color }: { percent: number; color: string }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#E7E5E4"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[#1C1917]">{Math.round(percent)}%</span>
      </div>
    </div>
  )
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return ""
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

export default function LearningPathPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ id }) => setCategoryId(id))
  }, [params])

  useEffect(() => {
    if (!categoryId || !user?.id || !user?.orgId) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [catRes, progRes] = await Promise.all([
          fetch(`/api/categories/${categoryId}`),
          fetch(`/api/progress?userId=${user.id}&orgId=${user.orgId}`),
        ])

        if (!catRes.ok) throw new Error("Failed to load category")
        const catData = await catRes.json()
        setCategory(catData.category)
        setLessons(catData.lessons || [])

        if (progRes.ok) {
          const progData = await progRes.json()
          const lessonIds = (catData.lessons || []).map((l: Lesson) => l.id)
          setProgress((progData.progress || []).filter((p: UserProgress) =>
            lessonIds.includes(p.content_id)
          ))
        }
      } catch (e) {
        console.error(e)
        toast.error("Failed to load learning path")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId, user?.id, user?.orgId])

  const getLessonStatus = (lessonId: string, index: number) => {
    const lessonProgress = progress.find((p) => p.content_id === lessonId)
    const status = (lessonProgress?.status || "").toUpperCase()
    if (status === "COMPLETED") return "completed"
    if (status === "IN_PROGRESS") return "in_progress"
    if (index === 0) return "available"
    const prevLesson = lessons[index - 1]
    const prevProgress = progress.find((p) => p.content_id === prevLesson?.id)
    if ((prevProgress?.status || "").toUpperCase() === "COMPLETED") return "available"
    return "locked"
  }

  const getNextLesson = () => {
    for (let i = 0; i < lessons.length; i++) {
      const status = getLessonStatus(lessons[i].id, i)
      if (status === "available" || status === "in_progress") {
        return { lesson: lessons[i], index: i, status }
      }
    }
    return null
  }

  const completedCount = lessons.filter((l, i) => getLessonStatus(l.id, i) === "completed").length
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0
  const totalXp = lessons.reduce((acc, l) => acc + (l.xp_reward || 0), 0)
  const earnedXp = progress
    .filter((p) => (p.status || "").toUpperCase() === "COMPLETED")
    .reduce((acc, p) => {
      const lesson = lessons.find((l) => l.id === p.content_id)
      return acc + (lesson?.xp_reward || 0)
    }, 0)
  const totalDuration = lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0)
  const nextLesson = getNextLesson()
  const allCompleted = completedCount === lessons.length && lessons.length > 0

  const accentColor = category?.color || "#FF6B35"

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF6B35]/20 border-t-[#FF6B35] rounded-full animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Category not found</p>
          <Link href="/learn/categories" className="text-[#FF6B35] hover:underline">
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1C1917] px-4 py-6"
      >
        <Link href="/learn/categories" className="inline-flex items-center gap-2 text-white/60 mb-6 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </Link>

        <div className="flex items-center gap-6">
          <CircularProgress percent={progressPercent} color={accentColor} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{category.name}</h1>
            <p className="text-white/60 text-sm mb-3">Learning Path</p>
            <div className="flex items-center gap-4 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Zap size={14} className="text-[#FF6B35]" />
                {earnedXp}/{totalXp} XP
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDuration(totalDuration)}
              </span>
              <span>{completedCount}/{lessons.length} Rooms</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={`/learn/ai-chat?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <Sparkles size={16} />
            Ask AI about {category.name}
          </Link>
        </div>

        {nextLesson && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Link href={`/learn/content/${nextLesson.lesson.id}`}>
              <motion.button
                className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: accentColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={18} fill="white" />
                {nextLesson.status === "in_progress" ? "Continue Room" : "Start Next Room"}
                <ChevronRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        )}

        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center gap-3"
          >
            <Trophy size={24} className="text-yellow-400" />
            <div className="flex-1">
              <p className="text-white font-semibold">Path Complete!</p>
              <p className="text-white/60 text-xs">All rooms completed</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Learning Path */}
      <div className="px-4 py-8">
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#78716C]">No rooms in this path yet</p>
          </div>
        ) : (
          <div className="relative max-w-2xl mx-auto">
            {/* Glowing path line */}
            <div className="absolute left-8 top-0 bottom-0 w-1">
              <div className="absolute inset-0 bg-[#E7E5E4] rounded-full" />
              <motion.div
                className="absolute top-0 left-0 w-full bg-[#FF6B35] rounded-full"
                initial={{ height: 0 }}
                animate={{ height: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  boxShadow: "0 0 20px rgba(255, 107, 53, 0.5)",
                }}
              />
            </div>

            {/* Room Cards */}
            <div className="space-y-6">
              {lessons.map((lesson, index) => {
                const status = getLessonStatus(lesson.id, index)
                const isLast = index === lessons.length - 1

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Node */}
                    <div className="relative z-10 flex-shrink-0">
                      {status === "completed" ? (
                        <motion.div
                          className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center"
                          style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                        >
                          <CheckCircle2 size={28} className="text-[#10B981]" />
                        </motion.div>
                      ) : status === "in_progress" ? (
                        <motion.div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: accentColor,
                            boxShadow: `0 0 30px ${accentColor}80`,
                          }}
                          animate={{
                            boxShadow: [
                              `0 0 20px ${accentColor}60`,
                              `0 0 40px ${accentColor}80`,
                              `0 0 20px ${accentColor}60`,
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Play size={24} className="text-white ml-0.5" fill="white" />
                        </motion.div>
                      ) : status === "available" ? (
                        <Link href={`/learn/content/${lesson.id}`}>
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-white border-2"
                            style={{ borderColor: accentColor }}
                          >
                            <Play size={20} style={{ color: accentColor }} />
                          </div>
                        </Link>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#1C1917]/80 flex items-center justify-center backdrop-blur">
                          <Lock size={20} className="text-[#78716C]" />
                        </div>
                      )}
                    </div>

                    {/* Room Card */}
                    {status === "locked" ? (
                      <div className="flex-1 p-4 rounded-xl bg-[#1C1917]/60 backdrop-blur border border-white/5 opacity-70">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-14 rounded-lg bg-[#1C1917] flex items-center justify-center flex-shrink-0">
                            <Lock size={20} className="text-[#78716C]" />
                          </div>
                          <div>
                            <p className="text-[#78716C] text-xs mb-1">Room {index + 1}</p>
                            <h3 className="text-white/60 font-medium">{lesson.title}</h3>
                            <p className="text-[#78716C] text-xs mt-1">Complete previous room to unlock</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/learn/content/${lesson.id}`} className="flex-1">
                        <motion.div
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            status === "completed"
                              ? "bg-[#1C1917]/40 border-white/5"
                              : status === "in_progress"
                              ? "bg-[#1C1917] border-[#FF6B35]"
                              : "bg-[#1C1917] border-white/10 hover:border-[#FF6B35]/50"
                          }`}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Thumbnail */}
                            <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#1C1917]">
                              {lesson.file_url && lesson.type.toUpperCase() === "VIDEO" ? (
                                <video
                                  src={lesson.file_url}
                                  className="w-full h-full object-cover opacity-80"
                                  preload="metadata"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5">
                                  <Play size={16} className="text-[#FF6B35]" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[#78716C] text-xs">Room {index + 1}</span>
                                {status === "in_progress" && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B35] text-white animate-pulse">
                                    Current
                                  </span>
                                )}
                                {lesson.has_quiz && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                    Quiz
                                  </span>
                                )}
                              </div>
                              <h3 className={`font-semibold mb-1 truncate ${status === "completed" ? "text-white/60" : "text-white"}`}>
                                {lesson.title}
                              </h3>
                              <p className="text-[#78716C] text-xs line-clamp-1">
                                {lesson.description || "Complete this room to continue"}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className="text-[#78716C] flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatDuration(lesson.duration_minutes)}
                                </span>
                                <span className="text-[#FF6B35] flex items-center gap-1">
                                  <Zap size={12} />
                                  +{lesson.xp_reward || 0} XP
                                </span>
                                {status === "completed" && (
                                  <span className="text-[#10B981] flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    Done
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    )}
                  </motion.div>
                )
              })}

              {/* Certificate Card (shown when all completed) */}
              {allCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative flex items-start gap-4 pt-6"
                >
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        boxShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
                      }}
                    >
                      <Trophy size={28} className="text-[#1C1917]" />
                    </div>
                  </div>
                  <div className="flex-1 p-5 rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-amber-500/10">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Certificate Unlocked!</h3>
                    <p className="text-white/80 text-sm mb-4">
                      Congratulations! You&apos;ve completed all rooms in the {category.name} learning path.
                    </p>
                    <Link href={`/learn/certificates`}>
                      <motion.button
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-[#1C1917] flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Star size={18} fill="currentColor" />
                        Claim Certificate
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

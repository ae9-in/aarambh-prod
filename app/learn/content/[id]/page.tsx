"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Zap,
  ChevronRight,
  Trophy,
  FileText,
  ExternalLink,
  SkipBack,
  SkipForward,
  Maximize,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Content {
  id: string
  title: string
  description: string | null
  type: string
  file_url: string | null
  xp_reward: number | null
  duration_minutes: number | null
  category_id: string | null
  categories?: { name: string } | null
  has_quiz?: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  pass_percent?: number
  questions: QuizQuestion[]
}

interface Progress {
  status: string
  completion_percent: number
}

interface MaterialItem {
  id: string
  title: string
  type: string
  file_url: string | null
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const [contentId, setContentId] = useState<string | null>(null)
  const [content, setContent] = useState<Content | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    params.then(({ id }) => setContentId(id))
  }, [params])

  useEffect(() => {
    if (!contentId || !user?.id) return

    const loadData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/content/${contentId}?userId=${user.id}`)
        if (!res.ok) throw new Error("Failed to load content")
        const data = await res.json()
        setContent(data.content)
        setProgress(data.progress)
        setMaterials(data.materials || [])

        const incomingQuiz = data.quiz
          ? {
              id: data.quiz.id,
              title: data.quiz.title || "Lesson Quiz",
              pass_percent: data.quiz.pass_percent,
              questions: Array.isArray(data.quiz.questions)
                ? data.quiz.questions.map((q: any, i: number) => ({
                    id: String(q.id ?? i + 1),
                    question: String(q.question ?? "Question"),
                    options: Array.isArray(q.options) ? q.options.map((x: any) => String(x)) : [],
                    correctAnswer: Number(q.correctAnswer ?? q.correct_answer ?? 0),
                    explanation: String(q.explanation ?? ""),
                  }))
                : [],
            }
          : null
        setQuiz(incomingQuiz)
      } catch (e: any) {
        console.error(e)
        setError(e?.message || "Failed to load lesson")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [contentId, user?.id])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      if (total > 0) {
        setVideoProgress((current / total) * 100)
      }
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    // If has quiz, show it. Otherwise auto-complete
    if (quiz && quiz.questions.length > 0) {
      setShowQuiz(true)
    } else {
      handleMarkComplete()
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const seekBy = (seconds: number) => {
    if (!videoRef.current) return
    const video = videoRef.current
    const nextTime = Math.max(0, Math.min((video.duration || 0), video.currentTime + seconds))
    video.currentTime = nextTime
  }

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const toggleFullscreen = async () => {
    const video = videoRef.current
    if (!video) return
    if (!document.fullscreenElement) {
      await video.requestFullscreen().catch(() => null)
    } else {
      await document.exitFullscreen().catch(() => null)
    }
  }

  const handleMarkComplete = async () => {
    if (
      !user?.id ||
      !user?.orgId ||
      !contentId ||
      (progress?.status || "").toUpperCase() === "COMPLETED"
    ) return

    try {
      const res = await fetch(`/api/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          contentId,
          orgId: user.orgId,
          status: "COMPLETED",
          progressPercent: 100,
          timeSpentMinutes: content?.duration_minutes || 0,
        }),
      })

      if (!res.ok) throw new Error("Failed to save progress")

      setProgress({ status: "COMPLETED", completion_percent: 100 })
      setShowXpAnimation(true)
      toast.success(`+${content?.xp_reward || 0} XP earned!`)
      setTimeout(() => setShowXpAnimation(false), 2000)
    } catch (e) {
      console.error(e)
      toast.error("Failed to save progress")
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    if (showFeedback) return

    setSelectedAnswer(answerIndex)
    if (!quiz) return

    const correct = answerIndex === quiz.questions[currentQuestion].correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)
    setQuizAnswers((prev) => {
      const next = [...prev]
      next[currentQuestion] = answerIndex
      return next
    })

    if (correct) {
      setQuizScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (!quiz) return
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleQuizComplete = () => {
    const submitAndComplete = async () => {
      try {
        if (quiz?.id && user?.id && user?.orgId) {
          await fetch(`/api/quiz/${quiz.id}/attempt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              orgId: user.orgId,
              answers: quizAnswers,
              timeTakenSeconds: 0,
            }),
          })
        }
      } catch (e) {
        console.error("Quiz submit failed:", e)
      } finally {
        handleMarkComplete()
        setShowQuiz(false)
      }
    }
    void submitAndComplete()
  }

  const isCompleted = (progress?.status || "").toUpperCase() === "COMPLETED"
  const isVideo = content?.type?.toUpperCase() === "VIDEO"

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF6B35]/20 border-t-[#FF6B35] rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Lesson not found"}</p>
          <Link href="/learn/categories" className="text-[#FF6B35] hover:underline">
            Back to Learning Paths
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1C1917] border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            href={`/learn/categories/${content.category_id || ""}`}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Path</span>
          </Link>
          <div className="flex items-center gap-3">
            {isCompleted && (
              <span className="flex items-center gap-1 text-[#10B981] text-sm">
                <CheckCircle2 size={16} />
                Completed
              </span>
            )}
            <span className="text-[#FF6B35] text-sm font-medium">+{content.xp_reward || 0} XP</span>
          </div>
        </div>
      </header>

      {/* Two Panel Layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Left Panel - Video (60%) */}
        <div className="lg:w-[60%] bg-[#0a0a0a]">
          {isVideo && content.file_url ? (
            <div className="relative aspect-video bg-[#0a0a0a]">
              <video
                ref={videoRef}
                className="w-full h-full"
                src={content.file_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
                playsInline
                style={{ aspectRatio: "16/9" }}
              />
              <div className="absolute left-3 bottom-3 z-10 flex items-center gap-2 rounded-lg bg-black/60 px-2 py-1.5 text-white">
                <button onClick={() => seekBy(-10)} className="hover:text-[#FF6B35]" title="Rewind 10s">
                  <SkipBack size={16} />
                </button>
                <button onClick={togglePlay} className="hover:text-[#FF6B35]" title="Play / Pause">
                  <Play size={16} />
                </button>
                <button onClick={() => seekBy(10)} className="hover:text-[#FF6B35]" title="Forward 10s">
                  <SkipForward size={16} />
                </button>
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(Number(e.target.value))}
                  className="bg-transparent text-xs outline-none"
                  title="Playback speed"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
                <button onClick={toggleFullscreen} className="hover:text-[#FF6B35]" title="Fullscreen">
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          ) : content.file_url ? (
            <div className="aspect-video bg-[#1C1917] flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 rounded-full bg-[#FF6B35]/20 flex items-center justify-center mx-auto mb-4">
                  <Play size={24} className="text-[#FF6B35]" />
                </div>
                <p className="text-lg mb-4">Document Lesson</p>
                <a
                  href={content.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] rounded-xl font-medium hover:bg-[#E55A24] transition-colors"
                >
                  <Play size={18} />
                  Open Content
                </a>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-[#1C1917] flex items-center justify-center">
              <p className="text-white/60">No content available</p>
            </div>
          )}
        </div>

        {/* Right Panel - Info (40%) */}
        <div className="lg:w-[40%] bg-white border-l border-[#E7E5E4]">
          <div className="p-6">
            {/* Title */}
            <h1 className="text-xl font-bold text-[#1C1917] mb-2">{content.title}</h1>
            <p className="text-sm text-[#78716C] mb-4">{content.description || "Complete this lesson to continue your learning path."}</p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-[#78716C] mb-6 pb-6 border-b border-[#E7E5E4]">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {content.duration_minutes || 0} min
              </span>
              <span className="flex items-center gap-1">
                <Zap size={14} className="text-[#FF6B35]" />
                +{content.xp_reward || 0} XP
              </span>
            </div>

            {/* Tasks / Objectives */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#1C1917] mb-3">Tasks</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF9F7]">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${videoProgress >= 90 ? "bg-[#10B981]" : "bg-[#E7E5E4]"}`}>
                    {videoProgress >= 90 ? <CheckCircle2 size={12} className="text-white" /> : <span className="text-xs text-[#78716C]">1</span>}
                  </div>
                  <span className={`text-sm ${videoProgress >= 90 ? "text-[#10B981] line-through" : "text-[#1C1917]"}`}>
                    Watch the video
                  </span>
                </div>
                {quiz && quiz.questions.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF9F7]">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isCompleted ? "bg-[#10B981]" : "bg-[#E7E5E4]"}`}>
                      {isCompleted ? <CheckCircle2 size={12} className="text-white" /> : <span className="text-xs text-[#78716C]">2</span>}
                    </div>
                    <span className={`text-sm ${isCompleted ? "text-[#10B981] line-through" : "text-[#1C1917]"}`}>
                      Complete the quiz
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Button */}
            {!isCompleted && !(quiz && quiz.questions.length > 0) && (
              <motion.button
                onClick={handleMarkComplete}
                className="w-full py-3.5 rounded-xl font-semibold bg-[#FF6B35] text-white flex items-center justify-center gap-2 hover:bg-[#E55A24] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle2 size={18} />
                Mark as Complete
              </motion.button>
            )}

            {isCompleted && (
              <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-[#10B981]" />
                <div>
                  <p className="font-semibold text-[#10B981]">Room Completed!</p>
                  <p className="text-sm text-[#10B981]/80">+{content.xp_reward || 0} XP earned</p>
                </div>
              </div>
            )}

            {/* Materials Section */}
            <div className="mt-6 pt-6 border-t border-[#E7E5E4]">
              <h3 className="text-sm font-semibold text-[#1C1917] mb-3">Reference Materials</h3>
              {materials.length === 0 ? (
                <p className="text-xs text-[#78716C]">No additional materials for this lesson.</p>
              ) : (
                <div className="space-y-2">
                  {materials.map((m) => (
                    <a
                      key={m.id}
                      href={m.file_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F7] hover:bg-[#F3F2EF] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-[#FF6B35] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-[#1C1917] truncate">{m.title}</p>
                          <p className="text-[11px] text-[#78716C]">{m.type}</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-[#78716C] flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#1C1917] rounded-t-3xl max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              {!quizCompleted && quiz ? (
                <>
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white/60 text-sm">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                    <span className="text-[#FF6B35] text-sm font-medium">Score: {quizScore}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-white/10 rounded-full mb-8">
                    <motion.div
                      className="h-full bg-[#FF6B35] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question */}
                  <motion.h3
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-bold text-white mb-6"
                  >
                    {quiz.questions[currentQuestion]?.question}
                  </motion.h3>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {(quiz.questions[currentQuestion]?.options || []).map((option, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={showFeedback}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          selectedAnswer === idx
                            ? isCorrect
                              ? "bg-[#10B981]/20 border-2 border-[#10B981]"
                              : "bg-red-500/20 border-2 border-red-500"
                            : showFeedback && idx === quiz.questions[currentQuestion]?.correctAnswer
                            ? "bg-[#10B981]/20 border-2 border-[#10B981]"
                            : "bg-white/5 border-2 border-white/10 hover:border-[#FF6B35]/50"
                        }`}
                      >
                        <span className="text-white">{option}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl mb-6 ${isCorrect ? "bg-[#10B981]/10" : "bg-red-500/10"}`}
                      >
                        <p className={`font-semibold mb-1 ${isCorrect ? "text-[#10B981]" : "text-red-400"}`}>
                          {isCorrect ? "✓ Correct!" : "✗ Wrong!"}
                        </p>
                        <p className="text-white/80 text-sm">{quiz.questions[currentQuestion]?.explanation}</p>
                        <motion.button
                          onClick={handleNextQuestion}
                          className="mt-4 w-full py-3 rounded-xl bg-[#FF6B35] text-white font-semibold"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                /* Quiz Results */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4">
                    <Trophy size={36} className="text-[#1C1917]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
                  <p className="text-white/60 mb-6">
                    You scored {quizScore} out of {quiz?.questions.length || 0}
                  </p>
                  <div className="p-4 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 mb-6">
                    <p className="text-[#FF6B35] font-bold text-lg">+{content.xp_reward || 0} XP Earned!</p>
                  </div>
                  <motion.button
                    onClick={handleQuizComplete}
                    className="w-full py-4 rounded-xl bg-[#FF6B35] text-white font-bold text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue to Next Room
                    <ChevronRight size={20} className="inline ml-2" />
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Animation */}
      <AnimatePresence>
        {showXpAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1 }}
            exit={{ opacity: 0, y: -200 }}
            transition={{ duration: 1.5 }}
            className="fixed bottom-1/2 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl flex items-center gap-2">
              <Zap size={24} fill="currentColor" />
              +{content.xp_reward || 0} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


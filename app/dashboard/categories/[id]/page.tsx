"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Video,
  FileText,
  Play,
  Clock,
  Target,
  X,
  Eye,
  CheckCircle2,
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
  view_count: number | null
  completion_count: number | null
  is_published: boolean
  created_at: string
}

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

function getTypeIcon(type: string) {
  switch (type.toUpperCase()) {
    case "VIDEO":
      return Video
    case "PDF":
    case "DOCUMENT":
      return FileText
    case "QUIZ":
      return Target
    default:
      return Play
  }
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return ""
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    params.then(({ id }) => setCategoryId(id))
  }, [params])

  useEffect(() => {
    if (!categoryId) return

    const loadData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/categories/${categoryId}`)
        if (!res.ok) throw new Error("Failed to load category")
        const data = await res.json()
        setCategory(data.category)
        setLessons(data.lessons || [])
      } catch (e: any) {
        console.error(e)
        setError(e?.message || "Failed to load category")
        toast.error("Failed to load category details")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId])

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      setDeletingId(lessonId)
      const res = await fetch(`/api/content/${lessonId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete lesson")
      setLessons((prev) => prev.filter((l) => l.id !== lessonId))
      toast.success("Lesson deleted")
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete lesson")
    } finally {
      setDeletingId(null)
    }
  }

  const handlePreview = (lesson: Lesson) => {
    setPreviewLesson(lesson)
    setIsPlaying(false)
  }

  const closePreview = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setPreviewLesson(null)
    setIsPlaying(false)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#E7E5E4] rounded-lg w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-[#E7E5E4] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Category not found"}</p>
        <Link href="/dashboard/categories" className="text-[#FF6B35] hover:underline">
          Back to Categories
        </Link>
      </div>
    )
  }

  const accentColor = category.color || "#FF6B35"
  const totalDuration = lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0)
  const totalXp = lessons.reduce((acc, l) => acc + (l.xp_reward || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header - Clean, no wall of text */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E7E5E4]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/categories"
            className="p-2 hover:bg-[#E7E5E4] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1917]">{category.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-[#78716C]">
              <span>{lessons.length} lessons</span>
              <span>•</span>
              <span>{formatDuration(totalDuration)} total</span>
              <span>•</span>
              <span className="text-[#FF6B35]">{totalXp} XP</span>
            </div>
          </div>
        </div>
        <motion.a
          href="/dashboard/lessons"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white rounded-xl font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Add Lesson
        </motion.a>
      </motion.div>

      {/* Lessons Grid - Organized Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {lessons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E7E5E4]">
            <div className="w-16 h-16 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mx-auto mb-4">
              <Play size={28} className="text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1C1917] mb-2">No lessons yet</h3>
            <p className="text-[#78716C] mb-6">Add lessons to build your learning path</p>
            <a
              href="/dashboard/lessons"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-medium"
            >
              <Plus size={18} />
              Create First Lesson
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => {
              const TypeIcon = getTypeIcon(lesson.type)
              const isVideo = lesson.type.toUpperCase() === "VIDEO"

              return (
                <motion.div
                  key={lesson.id}
                  className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePreview(lesson)}
                >
                  {/* Thumbnail with Play Overlay */}
                  <div className="relative h-48 overflow-hidden bg-[#1C1917]">
                    {isVideo && lesson.file_url ? (
                      <>
                        <video
                          src={lesson.file_url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="w-16 h-16 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-lg">
                            <Play size={28} className="text-white ml-1" fill="white" />
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}15` }}
                      >
                        <TypeIcon size={48} style={{ color: accentColor }} />
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur uppercase font-medium">
                        {lesson.type}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toast.info("Edit feature coming soon")
                        }}
                        className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white shadow-sm"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLesson(lesson.id)
                        }}
                        disabled={deletingId === lesson.id}
                        className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white text-red-500 shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Duration Badge */}
                    {lesson.duration_minutes && (
                      <div className="absolute bottom-3 right-3">
                        <span className="text-xs px-2 py-1 rounded-md bg-black/50 text-white backdrop-blur flex items-center gap-1">
                          <Clock size={12} />
                          {formatDuration(lesson.duration_minutes)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-[#1C1917] mb-2 line-clamp-1 text-lg">{lesson.title}</h3>
                    <p className="text-sm text-[#78716C] line-clamp-2 mb-4">
                      {lesson.description || "Click to preview this lesson"}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#E7E5E4]">
                      <div className="flex items-center gap-3 text-xs text-[#78716C]">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {lesson.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          {lesson.completion_count || 0}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#FF6B35]">+{lesson.xp_reward || 0} XP</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewLesson && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={closePreview}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-[#1C1917] rounded-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h3 className="text-white font-semibold text-lg">{previewLesson.title}</h3>
                  <p className="text-white/60 text-sm">{previewLesson.type} • {formatDuration(previewLesson.duration_minutes)}</p>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Video Player */}
              <div className="flex-1 bg-black flex items-center justify-center">
                {previewLesson.file_url && previewLesson.type.toUpperCase() === "VIDEO" ? (
                  <div className="relative w-full h-full max-w-5xl mx-auto">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      src={previewLesson.file_url}
                      controls
                      autoPlay
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      style={{ aspectRatio: "16/9" }}
                    />
                  </div>
                ) : previewLesson.file_url ? (
                  <div className="text-center text-white p-8">
                    <FileText size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl mb-4">Document Preview</p>
                    <a
                      href={previewLesson.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] rounded-xl font-medium hover:bg-[#E55A24] transition-colors"
                    >
                      <Play size={18} />
                      Open Document
                    </a>
                  </div>
                ) : (
                  <p className="text-white/60">No preview available</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-[#1C1917]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>Views: {previewLesson.view_count || 0}</span>
                    <span>Completions: {previewLesson.completion_count || 0}</span>
                    <span className="text-[#FF6B35]">+{previewLesson.xp_reward || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toast.info("Edit coming soon")}
                      className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteLesson(previewLesson.id)
                        closePreview()
                      }}
                      disabled={deletingId === previewLesson.id}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

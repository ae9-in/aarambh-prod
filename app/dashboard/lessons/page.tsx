"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Search,
  Grid3X3,
  List,
  BookOpen,
  FileQuestion,
} from "lucide-react"
import CountUp from "react-countup"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { detectType } from "@/lib/firebase"
import { toast } from "sonner"

function uploadLessonFile(
  file: File,
  orgId: string,
  fileType: string,
  onProgress: (pct: number) => void,
): Promise<{ url: string; path: string }> {
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("orgId", orgId)
    fd.append("fileType", fileType)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/upload/lesson-file")

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 90)
        onProgress(pct)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          onProgress(100)
          resolve({ url: data.url, path: data.path })
        } catch {
          reject(new Error("Invalid response from upload server"))
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText)
          reject(new Error(data.error || "Upload failed"))
        } catch {
          reject(new Error("Upload failed with status " + xhr.status))
        }
      }
    }

    xhr.onerror = () => reject(new Error("Network error during upload"))
    xhr.ontimeout = () => reject(new Error("Upload timed out"))
    xhr.timeout = 600000
    xhr.send(fd)
  })
}

const easeExpo = [0.16, 1, 0.3, 1]

type ApiContent = {
  id: string
  org_id: string
  category_id: string | null
  title: string
  description: string | null
  type: string
  xp_reward: number | null
  file_url: string | null
  view_count: number | null
  completion_count: number | null
  created_at: string
  categories?: { name: string | null } | null
  category_name?: string | null
}

type ApiCategory = {
  id: string
  name: string
}

type Lesson = {
  id: string
  title: string
  categoryId: string | null
  categoryName: string
  type: string
  xpReward: number
  views: number
  completions: number
  createdAt: string
}

type ApiQuiz = {
  id: string
  content_id: string | null
  title: string
  questions: any[]
  pass_percent?: number | null
}

const mapContent = (item: ApiContent, categoriesById: Record<string, string>): Lesson => {
  const catId = item.category_id
  const categoryName =
    item.category_name ??
    item.categories?.name ??
    (catId ? categoriesById[catId] : null) ??
    "Uncategorized"

  return {
    id: item.id,
    title: item.title,
    categoryId: catId,
    categoryName,
    type: item.type,
    xpReward: item.xp_reward ?? 0,
    views: item.view_count ?? 0,
    completions: item.completion_count ?? 0,
    createdAt: item.created_at,
  }
}

export default function LessonsPage() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [quizzesByContentId, setQuizzesByContentId] = useState<Record<string, ApiQuiz>>({})
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [quizSaving, setQuizSaving] = useState(false)
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState<Lesson | null>(null)
  const [quizForm, setQuizForm] = useState({
    title: "",
    question: "",
    optionsCsv: "",
    correctIndex: 0,
    explanation: "",
    passPercent: 60,
  })

  const [formData, setFormData] = useState({
    title: "",
    type: "VIDEO",
    categoryId: "",
    description: "",
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem("arambh_lessons_view")
      if (stored === "grid" || stored === "list") {
        setViewMode(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem("arambh_lessons_view", viewMode)
    } catch {
      // ignore
    }
  }, [viewMode])

  const loadData = async () => {
    if (!user?.orgId) {
      setLessons([])
      setCategories([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [catRes, contentRes, quizRes] = await Promise.all([
        fetch(`/api/categories?orgId=${encodeURIComponent(user.orgId)}`),
        fetch(`/api/content?orgId=${encodeURIComponent(user.orgId)}`),
        fetch(`/api/quiz?orgId=${encodeURIComponent(user.orgId)}`),
      ])

      if (!catRes.ok) {
        const data = await catRes.json().catch(() => null)
        throw new Error(data?.error || "Failed to load categories.")
      }
      if (!contentRes.ok) {
        const data = await contentRes.json().catch(() => null)
        throw new Error(data?.error || "Failed to load lessons.")
      }

      const catData = await catRes.json()
      const contentData = await contentRes.json()

      const apiCategories: ApiCategory[] = (catData.categories ?? []).map(
        (c: any) => ({ id: c.id, name: c.name as string }),
      )
      const categoriesById: Record<string, string> = {}
      apiCategories.forEach((c) => {
        categoriesById[c.id] = c.name
      })

      const apiContent: ApiContent[] = contentData.content ?? []
      const apiQuizzes: ApiQuiz[] = quizRes.ok ? ((await quizRes.json()).quizzes ?? []) : []
      const quizMap: Record<string, ApiQuiz> = {}
      apiQuizzes.forEach((q) => {
        if (q.content_id) quizMap[q.content_id] = q
      })

      setCategories(apiCategories)
      setLessons(apiContent.map((c) => mapContent(c, categoriesById)))
      setQuizzesByContentId(quizMap)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load lessons.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.orgId])

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filterType === "all" || lesson.type.toUpperCase() === filterType
      return matchesSearch && matchesFilter
    })
  }, [lessons, searchQuery, filterType])

  const stats = useMemo(() => {
    const total = lessons.length
    const video = lessons.filter((l) => l.type === "VIDEO").length
    const documents = lessons.filter((l) =>
      ["PDF", "PPT", "NOTE"].includes(l.type),
    ).length
    const avgXp =
      total === 0
        ? 0
        : Math.round(
            lessons.reduce((a, l) => a + (l.xpReward || 0), 0) / total,
          )
    return { total, video, documents, avgXp }
  }, [lessons])

  const resetForm = () => {
    setFormData({
      title: "",
      type: "VIDEO",
      categoryId: "",
      description: "",
    })
    setFile(null)
    setUploadProgress(0)
  }

  const handleCreateLesson = async () => {
    if (!user?.orgId || !user.id) {
      toast.error("Missing organization or user.")
      return
    }
    if (!formData.title.trim() || !formData.categoryId) {
      toast.error("Title and category are required.")
      return
    }
    if (!file) {
      toast.error("Please select a file to upload.")
      return
    }

    try {
      setIsSubmitting(true)
      setUploadProgress(0)

      const detectedType = detectType(file.type, file.name)
      const fileType = formData.type || detectedType || "NOTE"

      const { url, path: firebasePath } = await uploadLessonFile(
        file,
        user.orgId,
        fileType,
        (pct) => setUploadProgress(pct),
      )

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId: user.orgId,
          categoryId: formData.categoryId,
          userId: user.id,
          title: formData.title.trim(),
          fileType,
          firebaseUrl: url,
          firebasePath,
          fileSize: file.size,
          durationMinutes: null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to save lesson.")
      }

      const body = await res.json()
      const created: ApiContent | undefined = body.content
      if (created) {
        const catMap: Record<string, string> = {}
        categories.forEach((c) => {
          catMap[c.id] = c.name
        })
        setLessons((prev) => [mapContent(created, catMap), ...prev])
      } else {
        await loadData()
      }

      toast.success("Lesson created successfully.")
      resetForm()
      setIsCreateOpen(false)
    } catch (e: any) {
      console.error("create lesson error:", e)
      toast.error(e?.message || "Failed to create lesson.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      setDeletingId(id)
      const res = await fetch(`/api/content/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to delete lesson.")
      }
      setLessons((prev) => prev.filter((l) => l.id !== id))
      toast.success("Lesson deleted.")
    } catch (e: any) {
      console.error("delete lesson error:", e)
      toast.error(e?.message || "Failed to delete lesson.")
    } finally {
      setDeletingId(null)
    }
  }

  const openQuizEditor = (lesson: Lesson) => {
    setSelectedLessonForQuiz(lesson)
    const existing = quizzesByContentId[lesson.id]
    const q0 = existing?.questions?.[0]
    setQuizForm({
      title: existing?.title || `${lesson.title} Quiz`,
      question: q0?.question || "",
      optionsCsv: Array.isArray(q0?.options) ? q0.options.join(", ") : "",
      correctIndex: Number(q0?.correctAnswer ?? 0),
      explanation: q0?.explanation || "",
      passPercent: existing?.pass_percent ?? 60,
    })
    setQuizModalOpen(true)
  }

  const saveQuizForLesson = async () => {
    if (!user?.orgId || !user?.id || !selectedLessonForQuiz) {
      toast.error("Missing user/session details.")
      return
    }
    if (!quizForm.title.trim() || !quizForm.question.trim()) {
      toast.error("Quiz title and question are required.")
      return
    }
    const options = quizForm.optionsCsv
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)

    if (options.length < 2) {
      toast.error("Provide at least 2 answer options (comma separated).")
      return
    }
    if (quizForm.correctIndex < 0 || quizForm.correctIndex >= options.length) {
      toast.error("Correct option index is out of range.")
      return
    }

    try {
      setQuizSaving(true)
      const payload = {
        orgId: user.orgId,
        contentId: selectedLessonForQuiz.id,
        title: quizForm.title.trim(),
        questions: [
          {
            id: "q1",
            question: quizForm.question.trim(),
            options,
            correctAnswer: Number(quizForm.correctIndex),
            explanation: quizForm.explanation.trim(),
          },
        ],
        timeLimitSeconds: 180,
        passPercent: Number(quizForm.passPercent) || 60,
        createdBy: user.id,
      }

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save quiz.")
      }

      const created = data.quiz as ApiQuiz
      if (created?.content_id) {
        setQuizzesByContentId((prev) => ({ ...prev, [created.content_id as string]: created }))
      }
      toast.success("Quiz saved for lesson.")
      setQuizModalOpen(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to save quiz.")
    } finally {
      setQuizSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#E7E5E4] rounded-lg w-1/3 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-[#E7E5E4] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: easeExpo }}
      >
        <div>
          <h1 className="text-3xl font-bold text-[#1C1917]">Lessons</h1>
          <p className="text-[#78716C] mt-1">Manage your training content</p>
        </div>
        <motion.button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white rounded-xl font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Add Lesson
        </motion.button>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Total Lessons", value: stats.total },
          { label: "Video", value: stats.video },
          { label: "Documents", value: stats.documents },
          { label: "Avg XP", value: stats.avgXp },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl border border-[#E7E5E4] p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <p className="text-sm text-[#78716C]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1C1917] mt-1">
              <CountUp end={stat.value} duration={1} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]"
          />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "VIDEO", label: "Video" },
            { key: "PDF", label: "PDF" },
            { key: "AUDIO", label: "Audio" },
          ].map((type) => (
            <motion.button
              key={type.key}
              onClick={() => setFilterType(type.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === type.key
                  ? "bg-[#FF6B35] text-white"
                  : "bg-white border border-[#E7E5E4] text-[#1C1917]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-[#FF6B35] text-white"
                : "bg-white border border-[#E7E5E4]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Grid3X3 size={18} />
          </motion.button>
          <motion.button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-[#FF6B35] text-white"
                : "bg-white border border-[#E7E5E4]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <List size={18} />
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {filteredLessons.length === 0 && !error ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <BookOpen
            size={48}
            className="mx-auto text-[#E7E5E4] mb-4"
          />
          <h3 className="text-xl font-bold text-[#1C1917] mb-2">
            No lessons found
          </h3>
          <motion.button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your First Lesson
          </motion.button>
        </motion.div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          <AnimatePresence>
            {filteredLessons.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden hover:shadow-lg transition-all group p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                layout
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#FFE4D6] text-[#FF6B35] text-xs font-semibold rounded-full">
                      {lesson.type}
                    </span>
                    {quizzesByContentId[lesson.id] && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        Quiz
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1 hover:bg-purple-50 rounded text-purple-600"
                      onClick={() => openQuizEditor(lesson)}
                      title="Manage Quiz"
                    >
                      <FileQuestion size={14} />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-1 hover:bg-red-50 rounded text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>
                          Delete Lesson
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the lesson and its file
                          permanently.
                        </AlertDialogDescription>
                        <div className="flex gap-3">
                          <AlertDialogCancel>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              void handleDeleteLesson(lesson.id)
                            }
                            disabled={deletingId === lesson.id}
                          >
                            {deletingId === lesson.id
                              ? "Deleting..."
                              : "Delete"}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <h3 className="font-bold text-[#1C1917] mb-1 line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-sm text-[#78716C] mb-3">
                  {lesson.categoryName}
                </p>
                <div className="space-y-2 text-xs text-[#78716C]">
                  <div className="flex justify-between">
                    <span>{lesson.views} views</span>
                    <span>{lesson.completions} completions</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent aria-describedby={undefined} className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <input
              type="text"
              placeholder="Lesson Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20"
            />
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="AUDIO">Audio</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 resize-none"
            />
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-1">
                Lesson file
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const picked = e.target.files?.[0] ?? null
                  setFile(picked)
                }}
                className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#FF6B35]/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-[#FF6B35]"
              />
              {file && (
                <p className="mt-1 text-xs text-[#78716C] truncate max-w-full">
                  {file.name.length > 50 ? file.name.slice(0, 50) + "..." : file.name}
                </p>
              )}
              {isSubmitting && (
                <div className="mt-3 p-3 bg-[#FFF5F0] rounded-lg">
                  <div className="flex justify-between text-xs text-[#FF6B35] font-medium mb-1">
                    <span>Uploading…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E7E5E4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FF6B35] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4 mt-2 border-t border-[#E7E5E4] flex-shrink-0">
            <button
              onClick={() => {
                setIsCreateOpen(false)
                resetForm()
              }}
              className="flex-1 py-2.5 border border-[#E7E5E4] rounded-lg text-[#1C1917] font-medium hover:bg-[#FAF9F7]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={() => void handleCreateLesson()}
              className="flex-1 py-2.5 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A24] disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {quizzesByContentId[selectedLessonForQuiz?.id || ""] ? "Update Quiz" : "Add Quiz"} —{" "}
              {selectedLessonForQuiz?.title || "Lesson"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Quiz title"
              value={quizForm.title}
              onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg"
            />
            <textarea
              placeholder="Question"
              value={quizForm.question}
              onChange={(e) => setQuizForm((p) => ({ ...p, question: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg resize-none"
            />
            <input
              type="text"
              placeholder="Options (comma separated) e.g. Netlify, AWS, Heroku"
              value={quizForm.optionsCsv}
              onChange={(e) => setQuizForm((p) => ({ ...p, optionsCsv: e.target.value }))}
              className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                placeholder="Correct option index (0-based)"
                value={quizForm.correctIndex}
                onChange={(e) =>
                  setQuizForm((p) => ({ ...p, correctIndex: Number(e.target.value || 0) }))
                }
                className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg"
              />
              <input
                type="number"
                min={1}
                max={100}
                placeholder="Pass percent"
                value={quizForm.passPercent}
                onChange={(e) =>
                  setQuizForm((p) => ({ ...p, passPercent: Number(e.target.value || 60) }))
                }
                className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg"
              />
            </div>
            <textarea
              placeholder="Explanation (optional)"
              value={quizForm.explanation}
              onChange={(e) => setQuizForm((p) => ({ ...p, explanation: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-[#E7E5E4] rounded-lg resize-none"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setQuizModalOpen(false)}
                className="flex-1 py-2.5 border border-[#E7E5E4] rounded-lg font-medium"
                disabled={quizSaving}
              >
                Cancel
              </button>
              <button
                onClick={() => void saveQuizForLesson()}
                className="flex-1 py-2.5 bg-[#FF6B35] text-white rounded-lg font-medium disabled:opacity-60"
                disabled={quizSaving}
              >
                {quizSaving ? "Saving..." : "Save Quiz"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

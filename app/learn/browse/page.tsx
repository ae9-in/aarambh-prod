"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bookmark, ChevronRight, Play, FileText, Headphones, HelpCircle, Users } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const easeExpo = [0.16, 1, 0.3, 1]

const filters = ["All", "Video", "PDF", "Audio", "Quiz"]
const sorts = ["Popular", "Newest", "A-Z"]

const TypeIcon = ({ type }: { type: string }) => {
  const normalized = type.toLowerCase()
  const icons: Record<string, typeof Play> = {
    video: Play,
    pdf: FileText,
    audio: Headphones,
    quiz: HelpCircle,
  }
  const Icon = icons[normalized] || Play
  return <Icon size={16} />
}

function CourseMedia({
  type,
  image,
  fileUrl,
  title,
}: {
  type: string
  image: string | null
  fileUrl: string | null
  title: string
}) {
  if (type.toLowerCase() === "video" && fileUrl) {
    return (
      <video
        src={fileUrl}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget
          if (!Number.isNaN(v.duration) && v.duration > 1) {
            v.currentTime = 1
          }
        }}
      />
    )
  }
  if (image) {
    return <img src={image} alt={title} className="w-full h-full object-cover" />
  }
  return <div className="w-full h-full bg-gradient-to-br from-[#F3ECE5] to-[#E7E5E4]" />
}

export default function BrowsePage() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState("All")
  const [activeSort, setActiveSort] = useState("Popular")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarked, setBookmarked] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<
    {
      id: string
      title: string
      description: string
      category: string
      lessons: number
      duration: string
      level: string
      enrolled: number
      type: string
      image: string | null
      badge: string | null
      fileUrl: string | null
    }[]
  >([])

  useEffect(() => {
    const load = async () => {
      if (!user?.orgId) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(
          `/api/content?orgId=${encodeURIComponent(user.orgId)}`,
          { credentials: "include" },
        )
        if (!res.ok) {
          const d = await res.json().catch(() => null)
          throw new Error(d?.error || "Failed to load content.")
        }
        const data = await res.json()
        const rows: any[] = data.content ?? []
        setCourses(
          rows.map((c) => ({
            id: c.id,
            title: c.title ?? "",
            description: c.description ?? "",
            category: c.category_name ?? "General",
            lessons: 1,
            duration: c.duration_minutes ? `${c.duration_minutes} min` : "—",
            level: "All",
            enrolled: c.view_count ?? 0,
            type: (c.type ?? "VIDEO").toLowerCase(),
            image:
              (c.thumbnail_url as string | null) ??
              null,
            badge: null,
            fileUrl: (c.file_url as string | null) ?? null,
          })),
        )
      } catch (e: any) {
        console.error(e)
        setError(e?.message || "Failed to load content.")
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [user?.orgId])

  const filteredCourses = courses.filter((c) => {
    const matchesFilter = activeFilter === "All" || c.type.toLowerCase() === activeFilter.toLowerCase()
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-[#F0EDE8] rounded animate-pulse" />
        <div className="h-14 bg-[#F0EDE8] rounded-full animate-pulse" />
        <div className="flex gap-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 w-20 bg-[#F0EDE8] rounded-full animate-pulse" />)}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-[#F0EDE8] rounded-3xl animate-pulse" />)}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeExpo }}>
        <h1 className="text-2xl font-bold text-[#1C1917]">Training Library</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          {courses.length} courses ·{" "}
          {courses.reduce((a, c) => a + c.lessons, 0)} lessons
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: easeExpo }}
      >
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search courses, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-14 pr-5 rounded-full bg-white border border-[#F0EDE8] text-[#1C1917] placeholder:text-[#9CA3AF] focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 outline-none transition-all"
        />
      </motion.div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {/* Filters */}
      <motion.div
        className="flex gap-2 mb-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ease: easeExpo }}
      >
        {filters.map((filter) => (
          <motion.button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter ? "text-white" : "bg-white border border-[#F0EDE8] text-[#1C1917] hover:border-[#FF6B35]"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeFilter === filter && (
              <motion.div
                layoutId="filter-bg"
                className="absolute inset-0 bg-[#FF6B35] rounded-full shadow-lg shadow-[#FF6B35]/30"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{filter}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Sort */}
      <motion.div
        className="flex gap-2 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: easeExpo }}
      >
        {sorts.map((sort) => (
          <button
            key={sort}
            onClick={() => setActiveSort(sort)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSort === sort ? "bg-[#1C1917] text-white" : "text-[#9CA3AF] hover:text-[#1C1917]"
            }`}
          >
            {sort}
          </button>
        ))}
      </motion.div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course, idx) => (
            <Link key={course.id} href={`/learn/content/${course.id}`}>
              <motion.div
                className="bg-white rounded-3xl border border-[#F0EDE8] overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.08, ease: easeExpo }}
                whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.1)", borderColor: "rgba(255,107,53,0.15)" }}
                layout
              >
              {/* Image Area */}
              <div className="relative h-48 overflow-hidden">
                <CourseMedia
                  type={course.type}
                  image={course.image}
                  fileUrl={course.fileUrl}
                  title={course.title}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
                
                {/* Bookmark */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(course.id) }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bookmark size={16} className={bookmarked.includes(course.id) ? "fill-[#FF6B35] text-[#FF6B35]" : "text-[#6B7280]"} />
                </motion.button>

                {/* Badge */}
                {course.badge && (
                  <span className="absolute top-4 left-4 px-2 py-1 rounded-md bg-[#1C1917] text-white text-[9px] font-mono uppercase">
                    {course.badge}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <span className="text-[11px] text-[#FF6B35] uppercase tracking-wider font-medium">{course.category}</span>
                <h3 className="mt-1 text-base font-bold text-[#1C1917] leading-tight line-clamp-2">{course.title}</h3>
                <p className="mt-1.5 text-[13px] text-[#9CA3AF] line-clamp-2">{course.description}</p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F5F5F5] text-[10px] text-[#6B7280]">
                    <TypeIcon type={course.type} /> {course.lessons} lessons
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[#F5F5F5] text-[10px] text-[#6B7280]">{course.duration}</span>
                  <span className={`px-2 py-1 rounded-full text-[10px] ${
                    course.level === "Beginner" ? "bg-green-100 text-green-700" :
                    course.level === "Intermediate" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>{course.level}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#F0EDE8] my-4" />

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                    <Users size={12} />
                    <span>{course.enrolled} enrolled</span>
                  </div>
                  <motion.button
                    className="inline-flex items-center gap-1 px-4 h-8 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E85520] text-white text-xs font-bold shadow-lg shadow-[#FF6B35]/25"
                    whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(255,107,53,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>
              </motion.div>
            </Link>
          ))}
        </AnimatePresence>
      </div>

      {filteredCourses.length === 0 && !isLoading && !error && (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-[#1C1917]">No courses found</h3>
          <p className="text-sm text-[#9CA3AF] mt-1">Try a different search or filter</p>
        </motion.div>
      )}
    </div>
  )
}

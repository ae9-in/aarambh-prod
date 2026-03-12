"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Play, FileText, Headphones, Clock, ChevronRight, Bell } from "lucide-react"
import Link from "next/link"
import { AuroraBg } from "@/components/ui/aurora-bg"
import { useAuth } from "@/lib/auth-context"

const easeExpo = [0.16, 1, 0.3, 1]

const TypeIcon = ({ type }: { type: string }) => {
  const normalized = type.toLowerCase()
  const icons: Record<string, typeof Play> = {
    video: Play,
    pdf: FileText,
    audio: Headphones,
  }
  const Icon = icons[normalized] || Play
  return <Icon size={16} />
}

function CoursePreview({
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
  if (type === "video" && fileUrl) {
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

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#F3ECE5] to-[#E7E5E4] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
        <Play size={16} className="text-[#FF6B35] ml-0.5" />
      </div>
    </div>
  )
}

export default function LearnHomePage() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("Good morning")
  const [isLoading, setIsLoading] = useState(true)
  const [continueCourses, setContinueCourses] = useState<
    {
      id: string
      title: string
      category: string
      lessons: number
      duration: string
      progress: number
      type: string
      image: string | null
      fileUrl: string | null
    }[]
  >([])
  const [categories, setCategories] = useState<
    { id: string; name: string; image: string | null; lessons: number }[]
  >([])
  const [newCourses, setNewCourses] = useState<
    { id: string; title: string; category: string; duration: string; type: string }[]
  >([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening")
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!user?.orgId) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        setError(null)

        const [catsRes, contentRes] = await Promise.all([
          fetch(`/api/categories?orgId=${encodeURIComponent(user.orgId)}`, {
            credentials: "include",
          }),
          fetch(`/api/content?orgId=${encodeURIComponent(user.orgId)}`, {
            credentials: "include",
          }),
        ])

        if (!catsRes.ok) {
          const d = await catsRes.json().catch(() => null)
          throw new Error(d?.error || "Failed to load categories.")
        }
        if (!contentRes.ok) {
          const d = await contentRes.json().catch(() => null)
          throw new Error(d?.error || "Failed to load content.")
        }

        const catsData = await catsRes.json()
        const contentData = await contentRes.json()

        const catRows: any[] = catsData.categories ?? []
        setCategories(
          catRows.map((c) => ({
            id: c.id,
            name: c.name ?? "",
            image: (c.icon as string | null) ?? null,
            lessons: (c.lesson_count as number | null) ?? 0,
          })),
        )

        const contentRows: any[] = contentData.content ?? []

        setContinueCourses(
          contentRows.slice(0, 5).map((c) => ({
            id: c.id,
            title: c.title ?? "",
            category: c.category_name ?? "General",
            lessons: 1,
            duration: c.duration_minutes ? `${c.duration_minutes} min` : "—",
            progress: 0,
            type: (c.type ?? "VIDEO").toLowerCase(),
            image: (c.thumbnail_url as string | null) ?? null,
            fileUrl: (c.file_url as string | null) ?? null,
          })),
        )

        setNewCourses(
          contentRows
            .slice(0, 5)
            .map((c) => ({
              id: c.id,
              title: c.title ?? "",
              category: c.category_name ?? "General",
              duration: c.duration_minutes ? `${c.duration_minutes} min` : "—",
              type: (c.type ?? "VIDEO").toLowerCase(),
            })),
        )
      } catch (e: any) {
        console.error(e)
        setError(e?.message || "Failed to load learning content.")
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [user?.orgId])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 h-[60px] px-6 flex items-center justify-between bg-[#FAF9F7]/80 backdrop-blur-xl border-b border-[#F0EDE8]">
          <div className="h-5 w-40 bg-[#F0EDE8] rounded animate-pulse" />
          <div className="flex gap-3"><div className="w-9 h-9 bg-[#F0EDE8] rounded-xl animate-pulse" /><div className="w-9 h-9 bg-[#F0EDE8] rounded-full animate-pulse" /></div>
        </header>
        <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
          <div className="h-44 bg-[#F0EDE8] rounded-3xl animate-pulse" />
          <div className="space-y-2"><div className="h-5 w-32 bg-[#F0EDE8] rounded animate-pulse" /><div className="flex gap-4"><div className="w-64 h-56 bg-[#F0EDE8] rounded-2xl animate-pulse" /><div className="w-64 h-56 bg-[#F0EDE8] rounded-2xl animate-pulse" /></div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 h-[60px] px-6 flex items-center justify-between bg-[#FAF9F7]/80 backdrop-blur-xl border-b border-[#F0EDE8]">
        <h1 className="text-base font-semibold text-[#1C1917]">
          {greeting},{" "}
          <span className="text-[#FF6B35]">
            {user?.name || "Learner"}
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-[#F0EDE8] transition-colors">
            <Bell size={20} className="text-[#6B7280]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#E85520] flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: easeExpo }}
        >
          <AuroraBg className="p-7">
            <div className="relative z-10">
              <span className="text-[10px] font-mono text-[#FF6B35] tracking-[0.15em] uppercase">
                Featured Training
              </span>
              <h2 className="mt-3 max-w-[280px] text-xl font-bold leading-tight text-white">
                Master the Art of Customer Success
              </h2>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  12 Lessons
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  4.2 hrs
                </span>
              </div>
              <motion.button
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E85520] px-5 text-xs font-bold text-white shadow-lg shadow-[#FF6B35]/40"
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(255,107,53,0.5)" }}
                whileTap={{ scale: 0.97 }}
              >
                Start Learning
                <ArrowRight size={14} />
              </motion.button>
            </div>
          </AuroraBg>
        </motion.div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1C1917]">Continue Learning</h3>
            <Link href="/learn/browse" className="text-sm text-[#FF6B35] hover:underline">See all →</Link>
          </div>
          {error && continueCourses.length === 0 ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : continueCourses.length === 0 ? (
            <p className="text-sm text-[#78716C]">Training content is being prepared. Check back soon.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-1 -mx-6 px-6" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
              {continueCourses.map((course, idx) => (
                <Link key={course.id} href={`/learn/content/${course.id}`}>
                  <motion.div
                    className="flex-shrink-0 w-64 bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden cursor-pointer"
                    style={{ scrollSnapAlign: "start" }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, ease: easeExpo }}
                    whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.1)", borderColor: "rgba(255,107,53,0.2)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="h-36 relative overflow-hidden">
                      <CoursePreview
                        type={course.type}
                        image={course.image}
                        fileUrl={course.fileUrl}
                        title={course.title}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
                      <span className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/30 backdrop-blur-sm text-white text-[10px] font-mono uppercase">
                        {course.type}
                      </span>
                    </div>
                    <div className="p-4">
                      <span className="text-[11px] text-[#FF6B35] uppercase tracking-wide font-medium">{course.category}</span>
                      <h4 className="mt-1 text-sm font-semibold text-[#1C1917] line-clamp-2">{course.title}</h4>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#9CA3AF]">
                        <span>{course.lessons} lessons</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1C1917]">Explore Topics</h3>
            <Link href="/learn/browse" className="text-sm text-[#FF6B35] hover:underline">Browse all →</Link>
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-[#78716C]">No categories yet. Once your admin adds training categories, they will appear here.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat, idx) => (
                <Link key={cat.id} href={`/learn/categories/${cat.id}`}>
                  <motion.div
                    className="flex items-center gap-3 h-16 px-4 bg-white rounded-2xl border border-[#F0EDE8] cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, ease: easeExpo }}
                    whileHover={{ y: -2, borderColor: "#FF6B35" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" whileHover={{ scale: 1.1 }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#F0EDE8]" />
                      )}
                    </motion.div>
                    <span className="flex-1 text-sm font-semibold text-[#1C1917]">{cat.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[10px] text-[#9CA3AF]">{cat.lessons}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-bold text-[#1C1917] mb-4">New This Week</h3>
          {newCourses.length === 0 ? (
            <p className="text-sm text-[#78716C]">No new lessons have been added this week.</p>
          ) : (
            <div className="space-y-3">
              {newCourses.map((course, idx) => (
                <Link key={course.id} href={`/learn/content/${course.id}`}>
                  <motion.div
                    className="flex items-center gap-4 h-[72px] px-4 bg-white rounded-2xl border border-[#F0EDE8] cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, ease: easeExpo }}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      course.type === "video" ? "bg-gradient-to-br from-[#FF6B35] to-[#E85520]" :
                      course.type === "pdf" ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                      "bg-gradient-to-br from-purple-500 to-pink-500"
                    } text-white`}>
                      <TypeIcon type={course.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#1C1917] truncate">{course.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                        <span>{course.category}</span>
                        <span>•</span>
                        <Clock size={12} />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-bold">New</span>
                    <ChevronRight size={16} className="text-[#9CA3AF]" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

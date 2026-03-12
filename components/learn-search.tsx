"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Play, Clock, Zap, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface SearchResult {
  category: {
    id: string
    name: string
    color: string
  }
  lessons: Array<{
    id: string
    title: string
    description: string | null
    type: string
    xp_reward: number | null
    duration_minutes: number | null
  }>
}

export function LearnSearch() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !user?.orgId) return

      setLoading(true)
      setHasSearched(true)

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&orgId=${user.orgId}&userId=${user.id}&userRole=${user.role}`
        )

        if (res.ok) {
          const data = await res.json()
          setResults(data.groupedResults || [])
        }
      } catch (e) {
        console.error("Search error:", e)
      } finally {
        setLoading(false)
      }
    },
    [user?.orgId, user?.id, user?.role]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query)
      } else {
        setResults([])
        setHasSearched(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, performSearch])

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return ""
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E7E5E4] rounded-xl text-[#78716C] hover:border-[#FF6B35] transition-colors"
      >
        <Search size={18} />
        <span className="hidden sm:inline">Search...</span>
        <span className="text-xs text-[#A8A29E] hidden md:inline">⌘K</span>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Search Input */}
              <div className="p-4 border-b border-[#E7E5E4]">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]"
                  />
                  <input
                    type="text"
                    placeholder="Search lessons, categories..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 text-lg border border-[#E7E5E4] rounded-xl focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("")
                        setResults([])
                        setHasSearched(false)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#E7E5E4] rounded-full transition-colors"
                    >
                      <X size={18} className="text-[#78716C]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#FF6B35]/20 border-t-[#FF6B35] rounded-full animate-spin" />
                  </div>
                ) : hasSearched && results.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#78716C]">No results found for &quot;{query}&quot;</p>
                    <p className="text-sm text-[#A8A29E] mt-1">
                      Try different keywords or check spelling
                    </p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-6">
                    {results.map((group) => (
                      <div key={group.category.id}>
                        {/* Category Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: group.category.color || "#FF6B35" }}
                          />
                          <h3 className="font-semibold text-[#1C1917]">
                            {group.category.name}
                          </h3>
                          <span className="text-xs text-[#78716C]">
                            ({group.lessons.length} results)
                          </span>
                        </div>

                        {/* Lessons */}
                        <div className="space-y-2">
                          {group.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/learn/content/${lesson.id}`}
                              onClick={() => setIsOpen(false)}
                            >
                              <motion.div
                                className="p-3 rounded-xl bg-[#FAF9F7] hover:bg-[#FF6B35]/10 border border-transparent hover:border-[#FF6B35]/30 transition-all cursor-pointer group"
                                whileHover={{ x: 4 }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-[#1C1917] flex items-center justify-center flex-shrink-0">
                                    <Play size={16} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-[#1C1917] group-hover:text-[#FF6B35] transition-colors line-clamp-1">
                                      {lesson.title}
                                    </h4>
                                    <p className="text-sm text-[#78716C] line-clamp-1 mt-0.5">
                                      {lesson.description || "No description"}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-[#78716C]">
                                      <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatDuration(lesson.duration_minutes)}
                                      </span>
                                      <span className="text-[#FF6B35] flex items-center gap-1">
                                        <Zap size={12} />
                                        +{lesson.xp_reward || 0} XP
                                      </span>
                                      <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#E7E5E4]">
                                        {lesson.type}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight
                                    size={16}
                                    className="text-[#78716C] group-hover:text-[#FF6B35] self-center opacity-0 group-hover:opacity-100 transition-all"
                                  />
                                </div>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#78716C]">Type to search...</p>
                    <p className="text-sm text-[#A8A29E] mt-1">
                      Search for lesson titles, descriptions, or category names
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#E7E5E4] bg-[#FAF9F7] text-xs text-[#78716C] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">↵</kbd>
                    Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">Esc</kbd>
                  Close
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
